import type {
  DayType,
  LevelInfo,
  AchievementDef,
  AchievementId,
} from "@/lib/plan";

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

export interface AppStateData {
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
  level: LevelInfo;
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

export interface CelebrationData {
  dayCompleted: number;
  dayTitle: string;
  type: DayType;
  completedPushups: number;
  newStreak: number;
  streakIncreased: boolean;
  bestStreak: number;
  newAchievementIds: AchievementId[];
  newLevel: { level: number; title: string } | null;
  finished: boolean;
  /** ❄️ یخ استریک در این چک‌این مصرف شد */
  freezeUsed?: boolean;
}

// ── تست حداکثر شنا ──
export interface MaxRepTestItem {
  id: string;
  count: number;
  date: string;
}

// ── ثبت وزن و عکس ──
export interface WeightItem {
  date: string;
  kg: number;
}

export interface BodyPhotoItem {
  image: string; // data URL
  date: string;
}

export interface BodyData {
  weights: WeightItem[];
  photos: {
    before: BodyPhotoItem | null;
    after: BodyPhotoItem | null;
  };
}

export type TabId = "today" | "plan" | "learn" | "stats" | "awards";
