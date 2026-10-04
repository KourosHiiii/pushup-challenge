import { db } from "@/lib/db";
import { getPlanDay, PLAN_DAYS, PLAN, getLevel, levelProgress, computeUnlocked, AchievementId, ACHIEVEMENTS, AchievementDef } from "@/lib/plan";
import { tehranToday, lastNDates, daysBetween, addDays } from "@/lib/dates";
import type { DayType } from "@/lib/plan";

/** فاصله شارژ مجدد یخ استریک (روز) */
export const FREEZE_COOLDOWN_DAYS = 7;

/** آیا یخ استریک در دسترس است؟ (۷ روز پس از مصرف قبلی شارژ می‌شود) */
export function isFreezeAvailable(freezeUsedDate: string | null, today: string): boolean {
  if (!freezeUsedDate) return true;
  return daysBetween(freezeUsedDate, today) >= FREEZE_COOLDOWN_DAYS;
}

export interface PlanDayStatus {
  day: number;
  week: number;
  type: DayType;
  target: number;
  title: string;
  status: "done" | "current" | "upcoming";
  completed?: number;
  date?: string;
}

export interface StateResponse {
  today: string;
  checkedInToday: boolean;
  finished: boolean;
  currentDay: number;
  currentTask: {
    day: number;
    week: number;
    type: DayType;
    target: number;
    sets: number[];
    tip: string;
    title: string;
  };
  currentStreak: number;
  bestStreak: number;
  totalPushups: number;
  totalWorkouts: number;
  level: ReturnType<typeof getLevel>;
  levelProgressValue: number;
  planStatus: PlanDayStatus[];
  recentDays: { date: string; pushups: number; type: DayType | null }[];
  achievements: { id: AchievementId; unlocked: boolean; def: AchievementDef }[];
  startedAt: string;
  // ── Streak Freeze (هر ۷ روز یک‌بار، روز جاافتاده تکی را نجات می‌دهد) ──
  freezeAvailable: boolean;
  freezeUsedDate: string | null;
  /** اگر freeze مصرف شده باشد: تاریخ دوباره در دسترس قرار گرفتن (null = هم‌اکنون موجود) */
  freezeNextAvailableDate: string | null;
  // ── حالت تمرین آزاد پس از پایان چالش ──
  freeMode: boolean;
  // ── تقویم حرارتی: آخرین ۷۰ روز (۱۰ هفته) برای heatmap ──
  calendarDays: { date: string; pushups: number }[];
}

export async function getOrCreateState() {
  let state = await db.appState.findUnique({ where: { id: "main" } });
  if (!state) {
    state = await db.appState.create({ data: { id: "main" } });
  }
  return state;
}

export async function getFullState(): Promise<StateResponse> {
  const state = await getOrCreateState();
  const records = await db.dayRecord.findMany({
    where: { stateId: "main" },
    orderBy: { dayNumber: "asc" },
  });
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

  // نقشه آخرین ۷ روز برای نمودار هفتگی
  const dateMap = new Map(records.map((r) => [r.date, r]));
  const recentDays = lastNDates(7).map((date) => {
    const rec = dateMap.get(date);
    return {
      date,
      pushups: rec?.completed ?? 0,
      type: (rec?.type as DayType | undefined) ?? null,
    };
  });

  const task = getPlanDay(state.currentDay);
  const unlocked = computeUnlocked({
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    totalPushups: state.totalPushups,
    records,
  });

  const freezeAvailable = isFreezeAvailable(state.freezeUsedDate, today);
  // تاریخ شارژ مجدد فقط وقتی معنا دارد که یخ مصرف شده و هنوز در حالت سردباشد
  const freezeNextAvailableDate =
    state.freezeUsedDate && !freezeAvailable
      ? addDays(state.freezeUsedDate, FREEZE_COOLDOWN_DAYS)
      : null;

  return {
    today,
    checkedInToday,
    finished: state.currentDay > PLAN_DAYS,
    currentDay: state.currentDay,
    freezeAvailable,
    freezeUsedDate: state.freezeUsedDate,
    freezeNextAvailableDate,
    freeMode: state.freeMode,
    calendarDays: lastNDates(70).map((date) => ({
      date,
      pushups: dateMap.get(date)?.completed ?? 0,
    })),
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
    startedAt: state.createdAt.toISOString(),
  };
}
