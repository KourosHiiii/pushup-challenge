"use client";

/**
 * حالت آفلاین (APK) — کل منطق اپ سمت کلاینت با localStorage اجرا می‌شود،
 * دقیقاً همان خروجی API های سرور تا UI بدون تغییر کار کند.
 */

import { getPlanDay, PLAN, PLAN_DAYS, getLevel, levelProgress, computeUnlocked, FINAL_TEST_TARGET, ACHIEVEMENTS } from "@/lib/plan";
import type { DayType } from "@/lib/plan";
import { tehranToday, tehranYesterday, lastNDates, daysBetween, addDays } from "@/lib/dates";
import type { AppStateData, PlanDayStatus, BodyData, MaxRepTestItem, WeightItem } from "@/components/app/types";

/** فاصله شارژ مجدد یخ استریک (روز) — هماهنگ با src/lib/state.ts */
const FREEZE_COOLDOWN_DAYS = 7;

function isFreezeAvailableLocal(freezeUsedDate: string | null, today: string): boolean {
  if (!freezeUsedDate) return true;
  return daysBetween(freezeUsedDate, today) >= FREEZE_COOLDOWN_DAYS;
}

interface LocalRecord {
  dayNumber: number;
  /** "workout" | "rest" | "final" | "free" */
  type: DayType | "free";
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
  freezeUsedDate: string | null;
  freeMode: boolean;
  createdAt: string;
}

interface LocalPhoto {
  slot: "before" | "after";
  image: string;
  date: string;
}

const STATE_KEY = "pushup-local-state";
const RECORDS_KEY = "pushup-local-records";
const MAXREPS_KEY = "pushup-local-maxreps";
const WEIGHTS_KEY = "pushup-local-weights";
const PHOTOS_KEY = "pushup-local-photos";
/** کلید قدیمی تست ماکس (نسخه‌های قبلی اپ) — فقط برای پاکسازی */
const LEGACY_MAXTESTS_KEY = "pushup-local-maxtests";

function defaultState(): LocalState {
  return {
    currentDay: 1,
    currentStreak: 0,
    bestStreak: 0,
    lastCheckinDate: null,
    totalPushups: 0,
    totalWorkouts: 0,
    freezeUsedDate: null,
    freeMode: false,
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

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
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
      // همان رفتار سرور (getFullState): نوع «free» از نوع رکورد عبور می‌کند
      type: (rec?.type ?? null) as DayType | null,
    };
  });

  const task = getPlanDay(Math.min(state.currentDay, PLAN_DAYS));
  const unlocked = computeUnlocked({
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    totalPushups: state.totalPushups,
    records,
  });

  const freezeAvailable = isFreezeAvailableLocal(state.freezeUsedDate, today);
  // تاریخ شارژ مجدد فقط وقتی معنا دارد که یخ مصرف شده و هنوز در حالت سردباشد
  const freezeNextAvailableDate =
    state.freezeUsedDate && !freezeAvailable
      ? addDays(state.freezeUsedDate, FREEZE_COOLDOWN_DAYS)
      : null;

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
    freezeAvailable,
    freezeUsedDate: state.freezeUsedDate,
    freezeNextAvailableDate,
    freeMode: state.freeMode,
    calendarDays: lastNDates(70).map((date) => ({
      date,
      pushups: dateMap.get(date)?.completed ?? 0,
    })),
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
    type: DayType | "free";
    completedPushups: number;
    newStreak: number;
    streakIncreased: boolean;
    bestStreak: number;
    newAchievementIds: string[];
    newLevel: { level: number; title: string } | null;
    finished: boolean;
    freezeUsed?: boolean;
  };
}

/** همان خروجی POST /api/checkin */
export function localCheckin(completedInput?: number): LocalCheckinResult {
  const state = readState();
  const records = readRecords();

  const isFreeWorkout = state.currentDay > PLAN_DAYS && state.freeMode;

  if (state.currentDay > PLAN_DAYS && !state.freeMode) {
    throw new Error("چالش ۳۰ روزه کامل شده! 🏆");
  }

  const planDay = getPlanDay(state.currentDay);
  const today = tehranToday();
  const alreadyToday = state.lastCheckinDate === today;

  let completed = 0;
  if (isFreeWorkout) {
    // تمرین آزاد: ۱ تا ۱۰۰۰ (خطا = همان ۴۰۰ سرور)
    completed = Math.round(Number(completedInput ?? 0));
    if (!Number.isFinite(completed) || completed < 1 || completed > 1000) {
      throw new Error("تعداد شنا نامعتبر است (۱ تا ۱۰۰۰)");
    }
  } else if (planDay.type === "rest") {
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
  let freezeConsumed = false;
  if (!alreadyToday) {
    const yesterday = tehranYesterday();
    if (state.lastCheckinDate === yesterday) {
      newStreak = state.currentStreak + 1;
    } else if (
      state.lastCheckinDate &&
      daysBetween(state.lastCheckinDate, today) === 2 &&
      isFreezeAvailableLocal(state.freezeUsedDate, today)
    ) {
      // ❄️ یخ استریک نجات داد
      newStreak = state.currentStreak + 1;
      freezeConsumed = true;
    } else {
      newStreak = 1;
    }
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
  if (isFreeWorkout) {
    records.push({
      dayNumber: state.currentDay,
      type: "free",
      target: 0,
      completed,
      date: today,
    });
  } else {
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
  }
  records.sort((a, b) => a.dayNumber - b.dayNumber);

  const isWorkout = isFreeWorkout || planDay.type !== "rest";
  const updated: LocalState = {
    ...state,
    currentDay: state.currentDay + 1,
    currentStreak: newStreak,
    bestStreak,
    lastCheckinDate: today,
    totalPushups: state.totalPushups + completed,
    totalWorkouts: state.totalWorkouts + (isWorkout ? 1 : 0),
    freezeUsedDate: freezeConsumed ? today : state.freezeUsedDate,
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
      dayCompleted: isFreeWorkout ? state.currentDay : planDay.day,
      dayTitle: isFreeWorkout ? "تمرین آزاد" : planDay.title,
      type: isFreeWorkout ? "free" : planDay.type,
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
      freezeUsed: freezeConsumed,
    },
  };
}

/** همان خروجی POST /api/reset */
export function localReset(): AppStateData {
  writeState(defaultState());
  writeRecords([]);
  writeJSON(MAXREPS_KEY, []);
  writeJSON(WEIGHTS_KEY, []);
  writeJSON(PHOTOS_KEY, []);
  // پاکسازی کلید قدیمی نسخه‌های قبلی اپ
  try {
    localStorage.removeItem(LEGACY_MAXTESTS_KEY);
  } catch {
    /* ignore */
  }
  return localGetFullState();
}

// ── حالت تمرین آزاد (آفلاین) ──

/** فعال/غیرفعال کردن حالت تمرین آزاد — همان POST /api/free-mode (false = فعال‌سازی مجاز نیست) */
export function localSetFreeMode(enabled: boolean): boolean {
  if (typeof window === "undefined") throw new Error("client only");
  const state = readState();
  // فعال‌سازی فقط پس از پایان ۳۰ روز چالش مجاز است (غیرفعال‌سازی همیشه آزاد است)
  if (enabled && state.currentDay <= PLAN_DAYS) return false;
  writeState({ ...state, freeMode: enabled });
  return true;
}

// ── تست حداکثر شنا (آفلاین) ──

/** همان GET /api/max-reps — ۵۰ تست آخر (جدیدترین اول) + بهترین رکورد */
export const localMaxReps = {
  get(): { tests: MaxRepTestItem[]; best: number | null } {
    const tests = readJSON<MaxRepTestItem[]>(MAXREPS_KEY, []);
    return {
      tests,
      best: tests.length ? Math.max(...tests.map((t) => t.count)) : null,
    };
  },
  /** همان POST /api/max-reps — ثبت نتیجه جدید (۱ تا ۱۰۰۰) */
  save(count: number): { tests: MaxRepTestItem[]; best: number; isRecord: boolean } {
    const n = Math.round(Number(count));
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      throw new Error("تعداد شنا نامعتبر است (۱ تا ۱۰۰۰)");
    }
    const prev = readJSON<MaxRepTestItem[]>(MAXREPS_KEY, []);
    const previousBest = prev.length ? Math.max(...prev.map((t) => t.count)) : null;
    const isRecord = previousBest === null || n > previousBest;
    const tests = [{ id: `mr_${Date.now()}`, count: n, date: tehranToday() }, ...prev].slice(0, 50);
    writeJSON(MAXREPS_KEY, tests);
    return {
      tests,
      best: previousBest === null ? n : Math.max(previousBest, n),
      isRecord,
    };
  },
};

// ── دفتر بدن (آفلاین) ──

/** وزن‌ها صعودی بر اساس تاریخ */
function readWeightsSorted(): WeightItem[] {
  return readJSON<WeightItem[]>(WEIGHTS_KEY, []).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
}

/** عکس‌های قبل/بعد به شکل استاندارد پاسخ */
function photosResponse(): BodyData["photos"] {
  const rows = readJSON<LocalPhoto[]>(PHOTOS_KEY, []);
  const before = rows.find((p) => p.slot === "before") ?? null;
  const after = rows.find((p) => p.slot === "after") ?? null;
  return {
    before: before ? { image: before.image, date: before.date } : null,
    after: after ? { image: after.image, date: after.date } : null,
  };
}

/** داده‌های بدن — همان GET /api/body */
export const localBody = {
  get(): BodyData {
    return { weights: readWeightsSorted(), photos: photosResponse() };
  },
  /** همان POST /api/body/weight — ۲۰ تا ۴۰۰ کیلوگرم، گرد به یک رقم اعشار، upsert روزانه */
  saveWeight(kg: number): { weights: WeightItem[] } {
    const raw = Number(kg);
    if (!Number.isFinite(raw)) {
      throw new Error("وزن نامعتبر است");
    }
    const rounded = Math.round(raw * 10) / 10;
    if (rounded < 20 || rounded > 400) {
      throw new Error("وزن نامعتبر است (۲۰ تا ۴۰۰ کیلوگرم)");
    }
    const weights = readJSON<WeightItem[]>(WEIGHTS_KEY, []);
    const today = tehranToday();
    const idx = weights.findIndex((w) => w.date === today);
    if (idx >= 0) weights[idx] = { date: today, kg: rounded };
    else weights.push({ date: today, kg: rounded });
    writeJSON(WEIGHTS_KEY, weights);
    return { weights: readWeightsSorted() };
  },
  /** همان POST /api/body/photo — data URL فشرده (کمتر از ۷۰۰هزار کاراکتر) */
  savePhoto(slot: "before" | "after", image: string): { photos: BodyData["photos"] } {
    if (slot !== "before" && slot !== "after") {
      throw new Error("اسلات عکس نامعتبر است");
    }
    if (!image.startsWith("data:image/") || image.length >= 700_000) {
      throw new Error("عکس نامعتبر یا خیلی حجیم است");
    }
    const rows = readJSON<LocalPhoto[]>(PHOTOS_KEY, []).filter((p) => p.slot !== slot);
    rows.push({ slot, image, date: tehranToday() });
    writeJSON(PHOTOS_KEY, rows);
    return { photos: photosResponse() };
  },
  /** همان DELETE /api/body/photo?slot= */
  deletePhoto(slot: "before" | "after"): { photos: BodyData["photos"] } {
    if (slot !== "before" && slot !== "after") {
      throw new Error("اسلات عکس نامعتبر است");
    }
    writeJSON(
      PHOTOS_KEY,
      readJSON<LocalPhoto[]>(PHOTOS_KEY, []).filter((p) => p.slot !== slot)
    );
    return { photos: photosResponse() };
  },
};
