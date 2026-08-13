import { getAccessToken, getServiceAccount } from "./googleAuth.js";

/** Sends one push notification per token via FCM's HTTP v1 API. */
export async function sendPushToTokens(
  tokens: string[],
  notification: { title: string; body: string }
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const token = await getAccessToken(["https://www.googleapis.com/auth/firebase.messaging"]);
  const url = `https://fcm.googleapis.com/v1/projects/${getServiceAccount().project_id}/messages:send`;

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  for (const deviceToken of tokens) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification,
          webpush: { fcm_options: { link: "/" } },
        },
      }),
    });

    if (res.ok) {
      successCount++;
    } else {
      failureCount++;
      errors.push(`${res.status}: ${await res.text()}`);
    }
  }

  return { successCount, failureCount, errors };
}
