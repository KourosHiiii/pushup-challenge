"use client";

/**
 * پل داده ویجت صفحه‌ اصلی اندروید 📱
 * در حالت APK، مقادیر با @capacitor/preferences در SharedPreferences
 * با نام CapacitorStorage ذخیره می‌شوند و PushupWidgetProvider (کاتلین)
 * همان فایل را می‌خواند و ویجت را رندر می‌کند.
 */

import { Preferences } from "@capacitor/preferences";
import { getPlatform } from "@/lib/notifications";

export interface WidgetSnapshot {
  streak: number;
  day: number; // روز فعلی چالش
  dayTotal: number; // ۳۰
  total: number; // مجموع شناها
  label: string; // برچسب وضعیت: «امروز: ۱۲ شنا» یا «استراحت»
}

export async function updateWidgetData(s: WidgetSnapshot): Promise<void> {
  if (getPlatform() !== "native") return;
  try {
    await Promise.all([
      Preferences.set({ key: "widget_streak", value: String(s.streak) }),
      Preferences.set({ key: "widget_day", value: String(s.day) }),
      Preferences.set({ key: "widget_day_total", value: String(s.dayTotal) }),
      Preferences.set({ key: "widget_total", value: String(s.total) }),
      Preferences.set({ key: "widget_label", value: s.label }),
      Preferences.set({ key: "widget_ts", value: String(Date.now()) }),
    ]);
  } catch {
    /* ویجت حیاتی نیست — خطا نادیده گرفته می‌شود */
  }
}
