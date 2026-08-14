#!/data/data/com.termux/files/usr/bin/bash
#
# Hudi CRM - EVC SMS forwarder + reminder sender for Termux.
#
# Two jobs, both on the same poll loop:
#   1. Inbound: watches the SMS inbox for messages from the EVC Plus sender
#      ("913") and POSTs each new one to the Hudi CRM webhook.
#   2. Outbound: polls the CRM for queued customer reminder SMS (24h+
#      overdue bundles) and sends them via termux-sms-send.
# Runs as an infinite loop; start it once (ideally from ~/.termux/boot/ so
# it survives reboots) and leave it running.
#
# Requires: pkg install termux-api jq curl
# Requires: the Termux:API app installed alongside Termux (from F-Droid),
#           and SMS permission granted to Termux:API.
#
# Configure the two variables below, then run:
#   chmod +x termux-evc-forwarder.sh
#   ./termux-evc-forwarder.sh
set -u

WEBHOOK_URL="https://hudicrm.vercel.app/api/sms-webhook"
PENDING_SMS_URL="https://hudicrm.vercel.app/api/pending-sms"
MARK_SENT_URL="https://hudicrm.vercel.app/api/mark-sms-sent"
WEBHOOK_TOKEN="REPLACE_WITH_YOUR_SMS_WEBHOOK_SECRET"
SENDER="913"

STATE_FILE="$HOME/.evc_forwarder_last_id"
POLL_SECONDS=20

last_id=0
if [ -f "$STATE_FILE" ]; then
    last_id="$(cat "$STATE_FILE")"
fi

echo "Hudi CRM EVC forwarder starting. Watching sender '$SENDER', last_id=$last_id"

termux-wake-lock

while true; do
    messages="$(termux-sms-list -l 10 -t inbox 2>/dev/null)"

    if [ -n "$messages" ]; then
        # Oldest-to-newest, only from the EVC sender, only ids newer than last_id.
        new_messages="$(echo "$messages" | jq -c \
            --arg sender "$SENDER" --argjson last_id "$last_id" \
            '[.[] | select(.number == $sender and ._id > $last_id)] | sort_by(._id)')"

        count="$(echo "$new_messages" | jq 'length')"

        if [ "$count" -gt 0 ]; then
            for i in $(seq 0 $((count - 1))); do
                msg_id="$(echo "$new_messages" | jq -r ".[$i]._id")"
                msg_body="$(echo "$new_messages" | jq -r ".[$i].body")"

                response="$(curl -s -o /dev/null -w "%{http_code}" \
                    -X POST "$WEBHOOK_URL" \
                    -H "Content-Type: application/json" \
                    -H "x-webhook-token: $WEBHOOK_TOKEN" \
                    -d "$(jq -n --arg message "$msg_body" '{message: $message}')")"

                echo "$(date '+%Y-%m-%d %H:%M:%S') forwarded sms _id=$msg_id -> HTTP $response"

                if [ "$response" = "200" ]; then
                    last_id="$msg_id"
                    echo "$last_id" > "$STATE_FILE"
                fi
            done
        fi
    fi

    # --- Outbound: send any queued customer reminder SMS ---
    pending_response="$(curl -s "$PENDING_SMS_URL?token=$WEBHOOK_TOKEN")"
    pending_count="$(echo "$pending_response" | jq '.pending | length' 2>/dev/null)"

    if [ -n "${pending_count:-}" ] && [ "$pending_count" -gt 0 ] 2>/dev/null; then
        for i in $(seq 0 $((pending_count - 1))); do
            sms_id="$(echo "$pending_response" | jq -r ".pending[$i].id")"
            sms_phone="$(echo "$pending_response" | jq -r ".pending[$i].phone")"
            sms_message="$(echo "$pending_response" | jq -r ".pending[$i].message")"

            if termux-sms-send -n "$sms_phone" "$sms_message"; then
                mark_response="$(curl -s -o /dev/null -w "%{http_code}" \
                    -X POST "$MARK_SENT_URL?token=$WEBHOOK_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d "$(jq -n --arg id "$sms_id" '{id: $id}')")"
                echo "$(date '+%Y-%m-%d %H:%M:%S') sent reminder sms to $sms_phone (id=$sms_id) -> marked HTTP $mark_response"
            else
                echo "$(date '+%Y-%m-%d %H:%M:%S') FAILED sending reminder sms to $sms_phone (id=$sms_id) — will retry next poll"
            fi
        done
    fi

    sleep "$POLL_SECONDS"
done
