"use client";

/**
 * حالت آفلاین (APK) — کل منطق اپ سمت کلاینت با localStorage اجرا می‌شود،
 * دقیقاً همان خروجی API های سرور تا UI بدون تغییر کار کند.
 */

import { getPlanDay, PLAN, PLAN_DAYS, getLevel, levelProgress, computeUnlocked, FINAL_TEST_TARGET, ACHIEVEMENTS } from "@/lib/plan";
import type { DayType } from "@/lib/plan";
import { tehranToday, tehranYesterday, lastNDates } from "@/lib/dates";
import type { AppStateData, PlanDayStatus } from "@/components/app/types";

interface LocalRecord {
  dayNumber: number;
  type: DayType;
  target: number;
  completed: number;
  date: string;
}

interface LocalState {
  currentDay: number;
  currentStreak: number;
  bestStreak: number;
  lastCheckinDate: string | null;
  totalPushups: number;
  totalWorkouts: number;
  createdAt: string;
}

const STATE_KEY = "pushup-local-state";
const RECORDS_KEY = "pushup-local-records";

function defaultState(): LocalState {
  return {
    currentDay: 1,
    currentStreak: 0,
    bestStreak: 0,
    lastCheckinDate: null,
    totalPushups: 0,
    totalWorkouts: 0,
    createdAt: new Date().toISOString(),
  };
}

function readState(): LocalState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return { ...defaultState(), ...(JSON.parse(raw) as LocalState) };
  } catch {
    /* ignore */
  }
  return defaultState();
}

function writeState(s: LocalState) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

function readRecords(): LocalRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (raw) return JSON.parse(raw) as LocalRecord[];
  } catch {
    /* ignore */
  }
  return [];
}

function writeRecords(r: LocalRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(r));
}

function buildStateResponse(
  state: LocalState,
  records: LocalRecord[]
): AppStateData {
  const recByDay = new Map(records.map((r) => [r.dayNumber, r]));
  const today = tehranToday();
  const checkedInToday = state.lastCheckinDate === today;

  const planStatus: PlanDayStatus[] = PLAN.map((p) => {
    const rec = recByDay.get(p.day);
    let status: PlanDayStatus["status"] = "upcoming";
    if (rec) status = "done";
    else if (p.day === state.currentDay) status = "current";
    return {
      day: p.day,
      week: p.week,
      type: p.type,
      target: p.target,
      title: p.title,
      status,
      completed: rec?.completed,
      date: rec?.date,
    };
  });

  const dateMap = new Map(records.map((r) => [r.date, r]));
  const recentDays = lastNDates(7).map((date) => {
    const rec = dateMap.get(date);
    return {
      date,
      pushups: rec?.completed ?? 0,
      type: rec?.type ?? null,
    };
  });

  const task = getPlanDay(Math.min(state.currentDay, PLAN_DAYS));
  const unlocked = computeUnlocked({
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    totalPushups: state.totalPushups,
    records,
  });

  return {
    today,
    checkedInToday,
    finished: state.currentDay > PLAN_DAYS,
    currentDay: Math.min(state.currentDay, PLAN_DAYS),
    currentTask: {
      day: task.day,
      week: task.week,
      type: task.type,
      target: task.target,
      sets: task.sets,
      tip: task.tip,
      title: task.title,
    },
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    totalPushups: state.totalPushups,
    totalWorkouts: state.totalWorkouts,
    level: getLevel(state.totalPushups),
    levelProgressValue: levelProgress(state.totalPushups),
    planStatus,
    recentDays,
    achievements: ACHIEVEMENTS.map((def) => ({
      id: def.id,
      unlocked: unlocked.has(def.id),
      def,
    })),
    startedAt: state.createdAt,
  };
}

/** همان خروجی GET /api/state */
export function localGetFullState(): AppStateData {
  if (typeof window === "undefined") throw new Error("client only");
  const state = readState();
  const records = readRecords();
  return buildStateResponse(state, records);
}

export interface LocalCheckinResult {
  state: AppStateData;
  celebration: {
    dayCompleted: number;
    dayTitle: string;
    type: DayType;
    completedPushups: number;
    newStreak: number;
    streakIncreased: boolean;
    bestStreak: number;
    newAchievementIds: string[];
    newLevel: { level: number; title: string } | null;
    finished: boolean;
  };
}

/** همان خروجی POST /api/checkin */
export function localCheckin(completedInput?: number): LocalCheckinResult {
  const state = readState();
  const records = readRecords();

  if (state.currentDay > PLAN_DAYS) {
    throw new Error("چالش ۳۰ روزه کامل شده! 🏆");
  }

  const planDay = getPlanDay(state.currentDay);
  const today = tehranToday();
  const alreadyToday = state.lastCheckinDate === today;

  let completed = 0;
  if (planDay.type === "rest") {
    completed = 0;
  } else if (planDay.type === "final") {
    completed = Math.round(Number(completedInput ?? FINAL_TEST_TARGET));
    if (!Number.isFinite(completed) || completed < 1) completed = FINAL_TEST_TARGET;
    completed = Math.min(completed, 500);
  } else {
    completed = Math.round(Number(completedInput ?? planDay.target));
    if (!Number.isFinite(completed) || completed < 1) completed = planDay.target;
    completed = Math.min(completed, 500);
  }

  let newStreak = state.currentStreak;
  let streakIncreased = false;
  if (!alreadyToday) {
    const yesterday = tehranYesterday();
    newStreak = state.lastCheckinDate === yesterday ? state.currentStreak + 1 : 1;
    streakIncreased = true;
  }
  const bestStreak = Math.max(state.bestStreak, newStreak);

  const prevUnlocked = computeUnlocked({
    currentStreak: newStreak,
    bestStreak,
    totalPushups: state.totalPushups + completed,
    records,
  });
  const prevLevel = getLevel(state.totalPushups).level;

  // ثبت روز
  const existing = records.findIndex((r) => r.dayNumber === planDay.day);
  if (existing >= 0) {
    records[existing] = { ...records[existing], completed, date: today };
  } else {
    records.push({
      dayNumber: planDay.day,
      type: planDay.type,
      target: planDay.target,
      completed,
      date: today,
    });
  }
  records.sort((a, b) => a.dayNumber - b.dayNumber);

  const isWorkout = planDay.type !== "rest";
  const updated: LocalState = {
    ...state,
    currentDay: state.currentDay + 1,
    currentStreak: newStreak,
    bestStreak,
    lastCheckinDate: today,
    totalPushups: state.totalPushups + completed,
    totalWorkouts: state.totalWorkouts + (isWorkout ? 1 : 0),
  };

  writeState(updated);
  writeRecords(records);

  const newUnlocked = computeUnlocked({
    currentStreak: updated.currentStreak,
    bestStreak: updated.bestStreak,
    totalPushups: updated.totalPushups,
    records,
  });
  const newAchievementIds = [...newUnlocked].filter(
    (id) => !prevUnlocked.has(id)
  ) as string[];
  const newLevel = getLevel(updated.totalPushups);

  return {
    state: localGetFullState(),
    celebration: {
      dayCompleted: planDay.day,
      dayTitle: planDay.title,
      type: planDay.type,
      completedPushups: completed,
      newStreak: updated.currentStreak,
      streakIncreased,
      bestStreak: updated.bestStreak,
      newAchievementIds,
      newLevel:
        newLevel.level > prevLevel
          ? { level: newLevel.level, title: newLevel.title }
          : null,
      finished: updated.currentDay > PLAN_DAYS,
    },
  };
}

/** همان خروجی POST /api/reset */
export function localReset(): AppStateData {
  writeState(defaultState());
  writeRecords([]);
  return localGetFullState();
}
