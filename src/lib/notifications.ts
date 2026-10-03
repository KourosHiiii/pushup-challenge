"use client";

/**
 * یادآوری روزانه — چندسکویی
 *
 * ── APK (Capacitor) ──
 * نوتیفیکیشن لوکال بومی اندروید هر روز ساعت تنظیم‌شده با صدا اجرا می‌شود،
 * حتی وقتی اپ بسته است (AlarmManager) و بدون نیاز به اینترنت.
 *
 * ── مرورگر / PWA ──
 * Notification API + Service Worker + Web Push از سرور.
 */

export interface ReminderSettings {
  enabled: boolean;
  /** HH:mm */
  time: string;
}

export type Platform = "native" | "web";

export function getPlatform(): Platform {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  return cap?.isNativePlatform?.() ? "native" : "web";
}

/** ذخیره تنظیمات یادآوری محلی (همیشه، به‌عنوان منبع حقیقت کلاینت) */
const LS_KEY = "pushup-reminder";

export function loadReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") return { enabled: false, time: "20:00" };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as ReminderSettings;
  } catch {
    /* ignore */
  }
  return { enabled: false, time: "20:00" };
}

export function saveReminderSettings(s: ReminderSettings) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

/* ────────────────────────── APK (Capacitor) ────────────────────────── */

const CHANNEL_ID = "pushup-reminders";

async function capPlugin() {
  try {
    const mod = await import("@capacitor/local-notifications");
    return mod.LocalNotifications;
  } catch {
    return null;
  }
}

/** زمان HH:mm → اجزای next occurrence */
function splitTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return { hour: h || 20, minute: m || 0 };
}

/** زمان‌بندی نوتیف لوکال تکرارشونده روزانه در APK */
export async function scheduleNativeReminder(time: string) {
  const plugin = await capPlugin();
  if (!plugin) return false;

  // کانال با اهمیت بالا → هدزآپ + صدا
  try {
    await plugin.createChannel({
      id: CHANNEL_ID,
      name: "یادآوری چالش شنا",
      description: "یادآوری روزانه برای حفظ استریک شنا",
      importance: 5,
      visibility: 1,
      vibration: true,
    });
  } catch {
    /* کانال ممکن است قبلا ساخته شده باشد */
  }

  const { hour, minute } = splitTime(time);
  await plugin.cancelAll();

  await plugin.schedule({
    notifications: [
      {
        id: 1001,
        title: "🔥 وقت شناست!",
        body: "استریک‌ات رو حفظ کن — بیا شنا بزن! 💪",
        schedule: { on: { hour, minute }, repeating: true, allowWhileIdle: true },
        channelId: CHANNEL_ID,
        largeIcon: "ic_launcher",
        smallIcon: "ic_launcher",
      },
    ],
  });
  return true;
}

/** لغو نوتیف‌های زمان‌بندی‌شده در APK */
export async function cancelNativeReminder() {
  const plugin = await capPlugin();
  if (!plugin) return;
  await plugin.cancelAll();
}

/**فعال‌سازی با گرفتن مجوز در APK */
export async function enableNativeReminder(time: string): Promise<boolean> {
  const plugin = await capPlugin();
  if (!plugin) return false;
  const cur = await plugin.checkPermissions();
  if (cur.display !== "granted") {
    const req = await plugin.requestPermissions();
    if (req.display !== "granted") return false;
  }
  return scheduleNativeReminder(time);
}

/** ارسال فوری یک نوتیف آزمایشی در APK */
export async function fireNativeTestNotification(): Promise<boolean> {
  const plugin = await capPlugin();
  if (!plugin) return false;
  const cur = await plugin.checkPermissions();
  if (cur.display !== "granted") {
    const req = await plugin.requestPermissions();
    if (req.display !== "granted") return false;
  }
  await plugin.schedule({
    notifications: [
      {
        id: Math.floor(Math.random() * 1_000_000),
        title: "🔥 تست یادآوری شنا!",
        body: "عالیه — از این به بعد هر روز یادت می‌ندازیم بیای شنا بزنی 💪",
        channelId: CHANNEL_ID,
        largeIcon: "ic_launcher",
        smallIcon: "ic_launcher",
      },
    ],
  });
  return true;
}

/* ────────────────────────── مرورگر / PWA ────────────────────────── */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

/** فعال‌سازی نوتیف مرورگر: مجوز + ثبت SW + اشتراک push سرور */
export async function enableWebReminder(): Promise<
  "granted" | "denied" | "unsupported"
> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return "denied";

  const reg = await registerServiceWorker();
  if (!reg) return "granted"; // بدون SW هم نوتیف لوکال ممکن است

  // اشتراک Web Push از سرور (برای نوتیف وقتی تب باز نیست)
  try {
    const cfgRes = await fetch("/api/push/config");
    const cfg = await cfgRes.json();
    if (cfg.configured && "pushManager" in reg) {
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
        }));
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    }
  } catch {
    /* push از سرور نشد؛ نوتیف محلی همچنان کار می‌کند */
  }
  return "granted";
}

/** نوتیف آزمایشی فوری در مرورگر */
export async function fireWebTestNotification(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const reg = await navigator.serviceWorker?.getRegistration?.();
  if (reg) {
    await reg.showNotification("🔥 تست یادآوری شنا!", {
      body: "عالیه — از این به بعد هر روز یادت می‌ندازیم بیای شنا بزنی 💪",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "pushup-test",
      renotify: true,
      vibrate: [120, 60, 120, 60, 200],
      silent: false,
    });
    return true;
  }
  new Notification("🔥 تست یادآوری شنا!", {
    body: "عالیه — از این به بعد هر روز یادت می‌ندازیم بیای شنا بزنی 💪",
    icon: "/icons/icon-192.png",
  });
  return true;
}

/* ────────────────────── API یکپارچه چندسکویی ────────────────────── */

export async function enableReminders(
  time: string
): Promise<{ ok: boolean; platform: Platform; reason?: string }> {
  const platform = getPlatform();
  saveReminderSettings({ enabled: true, time });

  if (platform === "native") {
    const ok = await enableNativeReminder(time);
    return { ok, platform, reason: ok ? undefined : "permission_denied" };
  }

  const res = await enableWebReminder();
  return {
    ok: res === "granted",
    platform,
    reason: res === "denied" ? "permission_denied" : res === "unsupported" ? "unsupported" : undefined,
  };
}

export async function disableReminders(): Promise<void> {
  const platform = getPlatform();
  saveReminderSettings({ enabled: false, time: loadReminderSettings().time });
  if (platform === "native") {
    await cancelNativeReminder();
  } else {
    // سرور: یادآوری سراسری خاموش
    try {
      await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
    } catch {
      /* ignore */
    }
  }
}

export async function fireTestNotification(): Promise<boolean> {
  const platform = getPlatform();
  if (platform === "native") return fireNativeTestNotification();
  return fireWebTestNotification();
}

/**
 * زمان‌بندی‌های Android دقیقاً سر ساعت اجرا نمی‌شوند؛ این تابع
 * زمان‌بندی بومی را با تنظیمات به‌روز همگام می‌کند (بعد از تغییر ساعت یا لود اپ)
 */
export async function syncNativeScheduleOnLoad() {
  const s = loadReminderSettings();
  if (s.enabled && getPlatform() === "native") {
    await scheduleNativeReminder(s.time);
  }
}
