#!/data/data/com.termux/files/usr/bin/bash
#
# Hudi CRM - EVC SMS forwarder for Termux.
#
# Polls the phone's SMS inbox for messages from the EVC Plus sender ("913")
# and POSTs each new one to the Hudi CRM webhook. Runs as an infinite loop;
# start it once (ideally from ~/.termux/boot/ so it survives reboots) and
# leave it running.
#
# Requires: pkg install termux-api jq curl
# Requires: the Termux:API app installed alongside Termux (from F-Droid),
#           and SMS permission granted to Termux:API.
#
# Configure the three variables below, then run:
#   chmod +x termux-evc-forwarder.sh
#   ./termux-evc-forwarder.sh
set -u

WEBHOOK_URL="https://hudicrm.vercel.app/api/sms-webhook"
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

    sleep "$POLL_SECONDS"
done
