import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlanDay, PLAN_DAYS, computeUnlocked, getLevel, FINAL_TEST_TARGET } from "@/lib/plan";
import { tehranToday, tehranYesterday } from "@/lib/dates";
import { getFullState, getOrCreateState } from "@/lib/state";

export const dynamic = "force-dynamic";

interface CheckinBody {
  /** تعداد شنا انجام‌شده (برای تمرین و تست نهایی) */
  completed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as CheckinBody;
    const state = await getOrCreateState();

    if (state.currentDay > PLAN_DAYS) {
      return NextResponse.json({ error: "چالش ۳۰ روزه کامل شده! 🏆" }, { status: 400 });
    }

    const planDay = getPlanDay(state.currentDay);
    const today = tehranToday();
    const alreadyToday = state.lastCheckinDate === today;

    // ── تعیین تعداد شنا انجام‌شده ──
    let completed = 0;
    if (planDay.type === "rest") {
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
    if (!alreadyToday) {
      const yesterday = tehranYesterday();
      if (state.lastCheckinDate === yesterday) {
        newStreak = state.currentStreak + 1;
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

    // ── به‌روزرسانی وضعیت کلی ──
    const isWorkout = planDay.type !== "rest";
    const updated = await db.appState.update({
      where: { id: "main" },
      data: {
        currentDay: state.currentDay + 1,
        currentStreak: newStreak,
        bestStreak,
        lastCheckinDate: today,
        totalPushups: state.totalPushups + completed,
        totalWorkouts: state.totalWorkouts + (isWorkout ? 1 : 0),
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
        dayCompleted: planDay.day,
        dayTitle: planDay.title,
        type: planDay.type,
        completedPushups: completed,
        newStreak: updated.currentStreak,
        streakIncreased,
        bestStreak: updated.bestStreak,
        newAchievementIds,
        newLevel: newLevel.level > prevLevel ? { level: newLevel.level, title: newLevel.title } : null,
        finished: updated.currentDay > PLAN_DAYS,
      },
    });
  } catch (error) {
    console.error("POST /api/checkin failed:", error);
    return NextResponse.json({ error: "خطا در ثبت تمرین" }, { status: 500 });
  }
}
