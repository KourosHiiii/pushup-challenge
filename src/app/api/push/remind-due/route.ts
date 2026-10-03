import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateState } from "@/lib/state";
import { tehranToday, tehranNowParts } from "@/lib/dates";
import { sendPushToAll } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * بررسی یادآوری روزانه — برای اجرای زمان‌بندی‌شده (cron).
 * اگر از زمان یادآوری گذشته باشد و امروز چک‌این نشده باشد،
 * یک نوتیفیکیشن push با صدا به همه دستگاه‌ها ارسال می‌شود (روزی فقط یک‌بار).
 */
export async function POST() {
  try {
    const state = await getOrCreateState();
    const today = tehranToday();

    // امروز چک‌این کرده؟ کاری نداریم
    if (state.lastCheckinDate === today) {
      return NextResponse.json({ action: "none", reason: "already_checked_in" });
    }
    // چالش تمام شده؟ یادآوری لازم نیست
    if (state.currentDay > 30) {
      return NextResponse.json({ action: "none", reason: "finished" });
    }
    // یادآوری غیرفعال است
    if (!state.reminderEnabled) {
      return NextResponse.json({ action: "none", reason: "reminder_disabled" });
    }
    // امروز قبلاً یادآوری فرستاده‌ایم؟
    if (state.lastReminderSentDate === today) {
      return NextResponse.json({ action: "none", reason: "already_sent_today" });
    }

    // زمان فعلی تهران
    const now = tehranNowParts(); // { hour, minute }
    const [rH, rM] = state.reminderTime.split(":").map(Number);
    const nowMinutes = now.hour * 60 + now.minute;
    const remindMinutes = (rH || 20) * 60 + (rM || 0);

    // هنوز زمان یادآوری نرسیده؟
    if (nowMinutes < remindMinutes) {
      return NextResponse.json({
        action: "none",
        reason: "not_time_yet",
        nowMinutes,
        remindMinutes,
      });
    }

    // ── ارسال یادآوری ──
    const target = state.currentDay;
    const result = await sendPushToAll({
      title: `🔥 ${target} شنا منتظرته!`,
      body:
        target === 1
          ? "روز اول چالشه — با ۵ شنا شروع کن، استریک‌ات رو روشن کن! 💪"
          : `استریک ${state.currentStreak} روزه‌ات در خطره! فقط ${target} شنا تا حفظش مونده 💪`,
      tag: "pushup-daily-reminder",
      url: "/",
    });

    await db.appState.update({
      where: { id: "main" },
      data: { lastReminderSentDate: today },
    });

    return NextResponse.json({
      action: "sent",
      day: target,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/push/remind-due failed:", error);
    return NextResponse.json({ error: "خطا در بررسی یادآوری" }, { status: 500 });
  }
}
