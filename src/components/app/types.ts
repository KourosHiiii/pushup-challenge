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
}

export type TabId = "today" | "plan" | "stats" | "awards";
