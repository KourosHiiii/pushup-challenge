/**
 * Service Worker — پوش‌آپ چلنج
 * دریافت Web Push و نمایش نوتیفیکیشن یادآوری با صدا
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/** دریافت پیام push از سرور */
self.addEventListener("push", (event) => {
  let data = {
    title: "🔥 وقت شناست!",
    body: "استریک‌ات رو حفظ کن — بیا شنا بزن!",
    tag: "pushup-daily-reminder",
    url: "/",
  };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    // بدنه متنی ساده
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "pushup-reminder",
      renotify: true,
      requireInteraction: false,
      vibrate: [120, 60, 120, 60, 200],
      silent: false, // صدا هنگام نمایش (پیش‌فرض سیستم)
      data: { url: data.url || "/" },
    })
  );
});

/** کلیک روی نوتیف → باز کردن اپ */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
