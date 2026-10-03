import webpush from "web-push";
import { db } from "@/lib/db";

let configured = false;

export function isPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );
}

function ensureConfigured() {
  if (configured) return true;
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:pushup-challenge@app.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
  return true;
}

export interface ReminderPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

/** ارسال push به همه اشتراک‌ها؛ اشتراک‌های منقضی حذف می‌شوند */
export async function sendPushToAll(payload: ReminderPayload) {
  if (!ensureConfigured()) {
    return { sent: 0, failed: 0, configured: false };
  }
  const subs = await db.pushSubscription.findMany();
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 12 }
        );
        sent++;
      } catch (err) {
        failed++;
        const status = (err as { statusCode?: number }).statusCode;
        // اشتراک منقضی‌شده → حذف
        if (status === 404 || status === 410) {
          await db.pushSubscription
            .deleteMany({ where: { endpoint: sub.endpoint } })
            .catch(() => {});
        }
      }
    })
  );

  return { sent, failed, configured: true };
}
