/**
 * ─────────────────────────────────────────────────────────────
 *  برنامه ۳۰ روزه چالش شنا — بر پایه تحقیقات
 * ─────────────────────────────────────────────────────────────
 * منابع پژوهش:
 *  - EverydayHealth 30-Day Push-Up Challenge: شروع با ۵ شنا در روز ۱،
 *    افزودن حدود ۲ تکرار در روز، و استراحت حوالی هر روز هفتم.
 *  - Hundred Push Ups Program: ست‌بندی تمرین با ۶۰-۹۰ ثانیه استراحت
 *    بین ست‌ها و ۳ روز تمرین + روزهای ریکاوری در هفته.
 *  - اصل Progressive Overload: افزایش تدریجی ~۱۰-۱۵٪ حجم هفتگی.
 *  - Citadel / NSCA guidance: تمرین ۳-۵ بار در هفته با ریکاوری کافی
 *    تا عضلات فرصت رشد داشته باشند.
 *  - NASM: شنا سینه، سرشانه، پشت‌بازو و عضلات مرکزی (core) را درگیر می‌کند.
 */

export type DayType = "workout" | "rest" | "final";

export interface PlanDay {
  day: number;
  week: number;
  type: DayType;
  /** مجموع شناهای هدف روز (۰ برای استراحت) */
  target: number;
  /** توزیع ست‌ها؛ برای روز استراحت خالی است */
  sets: number[];
  /** نکته آموزشی روز (بر پایه راهنمای فرم صحیح) */
  tip: string;
  /** عنوان کوتاه روز */
  title: string;
}

const T = {
  form1: "بدنت باید از سر تا پاشنه یک خط صاف باشه؛ شکم و باسن رو منقبض نگه دار.",
  form2: "آرنج‌ها رو با زاویه ۴۵ درجه نسبت به بدن نگه دار، نه چسبیده نه کاملاً باز.",
  form3: "هنگام پایین رفتن نفس بگیر و هنگام بالا رفتن آرام بیرون بده.",
  form4: "روی کف دست‌ها فشار بیار و انگشت‌ها رو کمی باز کن برای تعادل بهتر.",
  form5: "سرعت مهم نیست! هر تکرار رو با کنترل کامل و دامنه کامل انجام بده.",
  form6: "اگر فرم شکست، قبل از ادامه ۳۰ ثانیه استراحت کن؛ کیفیت از تعداد مهم‌تره.",
  form7: "گردن رو صاف نگه دار و به نقطه‌ای حدود ۳۰ سانتی‌متر جلوی دست‌ها نگاه کن.",
  recovery: "عضله در استراحت ساخته می‌شه! امروز آب کافی بنوش و کشش سبک انجام بده.",
  rest1: "امروز ریکاوریه؛ یه پیاده‌روی سبک یا کشش سینه به رشدت کمک می‌کنه.",
  rest2: "خواب ۷-۸ ساعته امشب، بهترین مکمل تمرین دیروزته!",
  rest3: "کم‌کاری نکن! استراحت برنامه‌ریزی‌شده بخشی از تمرینه، نه توقف.",
  final: "روز بزرگه! با فرم تمیز تا جایی که می‌تونی ادامه بده و رکوردت رو ثبت کن.",
};

function w(day: number) {
  return Math.ceil(day / 7);
}

export const PLAN: PlanDay[] = [
  // ── هفته ۱: پایه‌سازی ──
  { day: 1, week: w(1), type: "workout", target: 5, sets: [5], tip: T.form5, title: "شروع ماجراجویی" },
  { day: 2, week: w(2), type: "workout", target: 6, sets: [6], tip: T.form1, title: "گرم‌شدن عضلات" },
  { day: 3, week: w(3), type: "workout", target: 8, sets: [4, 4], tip: T.form2, title: "اولین ست دوتایی" },
  { day: 4, week: w(4), type: "rest", target: 0, sets: [], tip: T.recovery, title: "استراحت" },
  { day: 5, week: w(5), type: "workout", target: 10, sets: [5, 5], tip: T.form3, title: "دو رقمی شدی!" },
  { day: 6, week: w(6), type: "workout", target: 12, sets: [6, 6], tip: T.form4, title: "ریتم رو حفظ کن" },
  { day: 7, week: w(7), type: "rest", target: 0, sets: [], tip: T.rest1, title: "استراحت هفتگی" },

  // ── هفته ۲: ساخت ──
  { day: 8, week: w(8), type: "workout", target: 14, sets: [7, 7], tip: T.form5, title: "هفته جدید، تو قوی‌تری" },
  { day: 9, week: w(9), type: "workout", target: 16, sets: [8, 8], tip: T.form6, title: "قدرت در حال رشد" },
  { day: 10, week: w(10), type: "workout", target: 18, sets: [9, 9], tip: T.form7, title: "یک‌سوم راه" },
  { day: 11, week: w(11), type: "rest", target: 0, sets: [], tip: T.rest2, title: "استراحت" },
  { day: 12, week: w(12), type: "workout", target: 20, sets: [10, 10], tip: T.form1, title: "عدد طلایی ۲۰" },
  { day: 13, week: w(13), type: "workout", target: 22, sets: [11, 11], tip: T.form3, title: "بیشتر از دیروز" },
  { day: 14, week: w(14), type: "rest", target: 0, sets: [], tip: T.recovery, title: "استراحت هفتگی" },

  // ── هفته ۳: قدرت ──
  { day: 15, week: w(15), type: "workout", target: 25, sets: [13, 12], tip: T.form2, title: "نصف راه!" },
  { day: 16, week: w(16), type: "workout", target: 28, sets: [14, 14], tip: T.form4, title: "سرعت بیشتری پیدا می‌کنی" },
  { day: 17, week: w(17), type: "workout", target: 30, sets: [10, 10, 10], tip: T.form5, title: "سه ست کامل" },
  { day: 18, week: w(18), type: "rest", target: 0, sets: [], tip: T.rest3, title: "استراحت" },
  { day: 19, week: w(19), type: "workout", target: 33, sets: [11, 11, 11], tip: T.form7, title: "۳۳ در ۳ ست" },
  { day: 20, week: w(20), type: "workout", target: 36, sets: [12, 12, 12], tip: T.form6, title: "دو-سوم راه" },
  { day: 21, week: w(21), type: "rest", target: 0, sets: [], tip: T.rest1, title: "استراحت هفتگی" },

  // ── هفته ۴: فولاد ──
  { day: 22, week: w(22), type: "workout", target: 38, sets: [13, 13, 12], tip: T.form1, title: "هفته قهرمانان" },
  { day: 23, week: w(23), type: "workout", target: 40, sets: [10, 10, 10, 10], tip: T.form3, title: "چهل تا!" },
  { day: 24, week: w(24), type: "rest", target: 0, sets: [], tip: T.rest2, title: "استراحت" },
  { day: 25, week: w(25), type: "workout", target: 42, sets: [14, 14, 14], tip: T.form2, title: "بدنت رو به چالش بکش" },
  { day: 26, week: w(26), type: "workout", target: 45, sets: [15, 15, 15], tip: T.form4, title: "۴۵ تای باستانی" },
  { day: 27, week: w(27), type: "rest", target: 0, sets: [], tip: T.recovery, title: "استراحت پیش از فینال" },
  { day: 28, week: w(28), type: "workout", target: 48, sets: [12, 12, 12, 12], tip: T.form5, title: "آخرین تمرین فنی" },
  { day: 29, week: w(29), type: "workout", target: 50, sets: [13, 13, 12, 12], tip: T.form7, title: "پنجاه تا — آماده فینال شو" },
  { day: 30, week: w(30), type: "final", target: 55, sets: [], tip: T.final, title: "🏆 تست نهایی" },
];

export const PLAN_DAYS = PLAN.length; // 30
export const FINAL_TEST_TARGET = 55;

export function getPlanDay(day: number): PlanDay {
  return PLAN[Math.min(Math.max(day, 1), PLAN_DAYS) - 1];
}

/** XP = مجموع شناهای انجام‌شده */
export interface LevelInfo {
  level: number;
  title: string;
  /** XP لازم برای رسیدن به سطح بعد */
  nextAt: number;
  /** XP شروع این سطح */
  currentAt: number;
}

const LEVELS: { at: number; title: string }[] = [
  { at: 0, title: "تازه‌کار" },
  { at: 50, title: "پرهیجان" },
  { at: 120, title: "سرباز" },
  { at: 220, title: "محکم‌کاری" },
  { at: 350, title: "آهنین" },
  { at: 500, title: "قهرمان" },
  { at: 700, title: "استاد" },
  { at: 1000, title: "افسانه" },
];

export function getLevel(totalPushups: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalPushups >= LEVELS[i].at) idx = i;
  }
  const isMax = idx === LEVELS.length - 1;
  return {
    level: idx + 1,
    title: LEVELS[idx].title,
    nextAt: isMax ? LEVELS[idx].at : LEVELS[idx + 1].at,
    currentAt: LEVELS[idx].at,
  };
}

/** پیشرفت داخل سطح فعلی (۰..۱) */
export function levelProgress(totalPushups: number): number {
  const { level, nextAt, currentAt } = getLevel(totalPushups);
  if (level === LEVELS.length) return 1;
  return Math.min(1, Math.max(0, (totalPushups - currentAt) / (nextAt - currentAt)));
}

// ─────────────────────────────────────────────
//  دستاوردها (سبک دولینگو — پاداش به ثبات)
// ─────────────────────────────────────────────

export type AchievementId =
  | "first_step"
  | "streak_3"
  | "streak_7"
  | "streak_14"
  | "streak_30"
  | "total_50"
  | "total_100"
  | "total_250"
  | "total_500"
  | "day_10"
  | "day_20"
  | "day_30"
  | "final_hero"
  | "rest_master";

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  /** دسته برای گروه‌بندی */
  group: "شروع" | "استریک" | "حجم" | "مسیر";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_step", title: "اولین قدم", description: "اولین روز چالش رو کامل کن", group: "شروع" },
  { id: "streak_3", title: "جرقه", description: "استریک ۳ روزه بساز", group: "استریک" },
  { id: "streak_7", title: "شعله هفتگی", description: "استریک ۷ روزه بساز", group: "استریک" },
  { id: "streak_14", title: "آتش سوزان", description: "استریک ۱۴ روزه بساز", group: "استریک" },
  { id: "streak_30", title: "آتشفشان", description: "استریک کامل ۳۰ روزه بساز", group: "استریک" },
  { id: "total_50", title: "۵۰ شنا", description: "مجموع ۵۰ شنا بزن", group: "حجم" },
  { id: "total_100", title: "صد شنا", description: "مجموع ۱۰۰ شنا بزن", group: "حجم" },
  { id: "total_250", title: "ماشین شنا", description: "مجموع ۲۵۰ شنا بزن", group: "حجم" },
  { id: "total_500", title: "غول آهنین", description: "مجموع ۵۰۰ شنا بزن", group: "حجم" },
  { id: "day_10", title: "یک‌سوم مسیر", description: "روز ۱۰ برنامه رو کامل کن", group: "مسیر" },
  { id: "day_20", title: "دو-سوم مسیر", description: "روز ۲۰ برنامه رو کامل کن", group: "مسیر" },
  { id: "day_30", title: "قهرمان چالش", description: "هر ۳۰ روز برنامه رو کامل کن", group: "مسیر" },
  { id: "final_hero", title: "قهرمان فینال", description: "تست نهایی رو با موفقیت انجام بده", group: "مسیر" },
  { id: "rest_master", title: "استراحت هوشمند", description: "یک روز استراحت رو تایید کن", group: "شروع" },
];

/** محاسبه دستاوردهای جدید بعد از یک چک‌این */
export function computeUnlocked(state: {
  currentStreak: number;
  bestStreak: number;
  totalPushups: number;
  records: { dayNumber: number; type: string; completed: number }[];
}): Set<AchievementId> {
  const unlocked = new Set<AchievementId>();
  const { currentStreak, bestStreak, totalPushups, records } = state;

  if (records.length > 0) unlocked.add("first_step");
  const streak = Math.max(currentStreak, bestStreak);
  if (streak >= 3) unlocked.add("streak_3");
  if (streak >= 7) unlocked.add("streak_7");
  if (streak >= 14) unlocked.add("streak_14");
  if (streak >= 30) unlocked.add("streak_30");
  if (totalPushups >= 50) unlocked.add("total_50");
  if (totalPushups >= 100) unlocked.add("total_100");
  if (totalPushups >= 250) unlocked.add("total_250");
  if (totalPushups >= 500) unlocked.add("total_500");
  const has = (d: number) => records.some((r) => r.dayNumber === d);
  if (has(10)) unlocked.add("day_10");
  if (has(20)) unlocked.add("day_20");
  if (records.length >= PLAN_DAYS) unlocked.add("day_30");
  const finalRec = records.find((r) => r.type === "final");
  if (finalRec && finalRec.completed >= FINAL_TEST_TARGET) unlocked.add("final_hero");
  if (records.some((r) => r.type === "rest")) unlocked.add("rest_master");
  return unlocked;
}
