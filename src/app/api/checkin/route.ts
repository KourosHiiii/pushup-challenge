import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlanDay, PLAN_DAYS, computeUnlocked, getLevel, FINAL_TEST_TARGET } from "@/lib/plan";
import { tehranToday, tehranYesterday, daysBetween } from "@/lib/dates";
import { getFullState, getOrCreateState, isFreezeAvailable } from "@/lib/state";

export const dynamic = "force-dynamic";

interface CheckinBody {
  /** تعداد شنا انجام‌شده (برای تمرین و تست نهایی) */
  completed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as CheckinBody;
    const state = await getOrCreateState();

    // ── حالت تمرین آزاد پس از پایان چالش ──
    const isFreeWorkout = state.currentDay > PLAN_DAYS && state.freeMode;

    if (state.currentDay > PLAN_DAYS && !state.freeMode) {
      return NextResponse.json({ error: "چالش ۳۰ روزه کامل شده! 🏆" }, { status: 400 });
    }

    const planDay = getPlanDay(state.currentDay);
    const today = tehranToday();
    const alreadyToday = state.lastCheckinDate === today;

    // ── تعیین تعداد شنا انجام‌شده ──
    let completed = 0;
    if (isFreeWorkout) {
      // تمرین آزاد: کاربر هر تعداد دلخواه ثبت می‌کند (۱ تا ۱۰۰۰)
      completed = Math.round(Number(body.completed ?? 0));
      if (!Number.isFinite(completed) || completed < 1 || completed > 1000) {
        return NextResponse.json({ error: "تعداد شنا نامعتبر است (۱ تا ۱۰۰۰)" }, { status: 400 });
      }
    } else if (planDay.type === "rest") {
      completed = 0;
    } else if (planDay.type === "final") {
      completed = Math.round(Number(body.completed ?? FINAL_TEST_TARGET));
      if (!Number.isFinite(completed) || completed < 1) {
        return NextResponse.json({ error: "تعداد شنا نامعتبر است" }, { status: 400 });
      }
      completed = Math.min(completed, 500);
    } else {
      completed = Math.round(Number(body.completed ?? planDay.target));
      if (!Number.isFinite(completed) || completed < 1) {
        return NextResponse.json({ error: "تعداد شنا نامعتبر است" }, { status: 400 });
      }
      completed = Math.min(completed, 500);
    }

    // ── منطق استریک (سبک دولینگو: ثبات روزانه پاداش می‌گیرد) ──
    let newStreak = state.currentStreak;
    let streakIncreased = false;
    let freezeConsumed = false;
    if (!alreadyToday) {
      const yesterday = tehranYesterday();
      if (state.lastCheckinDate === yesterday) {
        newStreak = state.currentStreak + 1;
      } else if (
        state.lastCheckinDate &&
        daysBetween(state.lastCheckinDate, today) === 2 &&
        isFreezeAvailable(state.freezeUsedDate, today)
      ) {
        // ❄️ یخ استریک: دقیقاً یک روز جاافتاده + یخ در دسترس → استریک نجات پیدا می‌کند
        newStreak = state.currentStreak + 1;
        freezeConsumed = true;
      } else {
        newStreak = 1;
      }
      streakIncreased = true;
    }

    const bestStreak = Math.max(state.bestStreak, newStreak);

    // ── محاسبه دستاوردها قبل از ثبت ──
    const prevRecords = await db.dayRecord.findMany({ where: { stateId: "main" } });
    const prevUnlocked = computeUnlocked({
      currentStreak: newStreak,
      bestStreak,
      totalPushups: state.totalPushups + completed,
      records: prevRecords,
    });
    const prevLevel = getLevel(state.totalPushups).level;

    // ── ثبت روز ──
    if (isFreeWorkout) {
      await db.dayRecord.create({
        data: {
          dayNumber: state.currentDay,
          type: "free",
          target: 0,
          completed,
          date: today,
          stateId: "main",
        },
      });
    } else {
      await db.dayRecord.upsert({
        where: { dayNumber: planDay.day },
        create: {
          dayNumber: planDay.day,
          type: planDay.type,
          target: planDay.target,
          completed,
          date: today,
          stateId: "main",
        },
        update: { completed, date: today },
      });
    }

    // ── به‌روزرسانی وضعیت کلی ──
    const isWorkout = isFreeWorkout || planDay.type !== "rest";
    const updated = await db.appState.update({
      where: { id: "main" },
      data: {
        currentDay: state.currentDay + 1,
        currentStreak: newStreak,
        bestStreak,
        lastCheckinDate: today,
        totalPushups: state.totalPushups + completed,
        totalWorkouts: state.totalWorkouts + (isWorkout ? 1 : 0),
        ...(freezeConsumed ? { freezeUsedDate: today } : {}),
      },
    });

    // ── دستاوردهای تازه ──
    const allRecords = await db.dayRecord.findMany({ where: { stateId: "main" } });
    const newUnlocked = computeUnlocked({
      currentStreak: updated.currentStreak,
      bestStreak: updated.bestStreak,
      totalPushups: updated.totalPushups,
      records: allRecords,
    });
    const newAchievementIds = [...newUnlocked].filter((id) => !prevUnlocked.has(id));
    const newLevel = getLevel(updated.totalPushups);

    const fullState = await getFullState();

    return NextResponse.json({
      state: fullState,
      celebration: {
        dayCompleted: isFreeWorkout ? state.currentDay : planDay.day,
        dayTitle: isFreeWorkout ? "تمرین آزاد" : planDay.title,
        type: isFreeWorkout ? "free" : planDay.type,
        completedPushups: completed,
        newStreak: updated.currentStreak,
        streakIncreased,
        bestStreak: updated.bestStreak,
        newAchievementIds,
        newLevel: newLevel.level > prevLevel ? { level: newLevel.level, title: newLevel.title } : null,
        finished: updated.currentDay > PLAN_DAYS,
        freezeUsed: freezeConsumed,
      },
    });
  } catch (error) {
    console.error("POST /api/checkin failed:", error);
    return NextResponse.json({ error: "خطا در ثبت تمرین" }, { status: 500 });
  }
}
