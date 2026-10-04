"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Lightbulb,
  Info,
  RotateCcw,
  Minus,
  Plus,
  Loader2,
  Snowflake,
} from "lucide-react";
import {
  RestMoonIcon,
  FlameIcon,
  CheckBadgeIcon,
  DumbbellIcon,
  TrophyIcon,
} from "./illustrations";
import { Mascot, getMascotStage, type MascotMood } from "./mascot";
import { RestTimer } from "./rest-timer";
import { FormGuide } from "./form-guide";
import { faDate, faWeekdayShort, toFa, daysBetween } from "@/lib/dates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppStateData } from "./types";

interface TodayTabProps {
  state: AppStateData;
  /** completed برای حالت تمرین آزاد (چک‌این با تعداد دلخواه) */
  onCheckin: (completed?: number) => void;
  onReset: () => void;
  /** فعال‌سازی حالت تمرین آزاد پس از پایان چالش — وایرینگ در page.tsx */
  onEnableFreeMode?: () => void;
}

/** سلام زمان‌محور بر اساس ساعت تهران — محاسبه در اولین رندر (تهران-محور روی سرور و کلاینت یکسانه) */
function computeGreeting(): string {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tehran",
        hour: "numeric",
        hour12: false,
      }).format(new Date())
    );
    if (hour < 5) return "شب بخیر قهرمان!";
    if (hour < 12) return "صبح بخیر قهرمان!";
    if (hour < 17) return "وقت بخیر قهرمان!";
    if (hour < 21) return "عصر بخیر قهرمان!";
    return "شب بخیر قهرمان!";
  } catch {
    return "سلام قهرمان!";
  }
}

function useGreeting() {
  return useState(computeGreeting)[0];
}

/** حالت چهره ماسکوت بر اساس وضعیت امروز */
function mascotMood(state: AppStateData): MascotMood {
  if (state.checkedInToday) return "happy";
  if (state.currentStreak === 0 && state.totalWorkouts > 0) return "sad";
  return "neutral";
}

/** چیپ مرحله شعله + روزهای باقی‌مانده تا مرحله بعد */
function MascotStageChip({ state }: { state: AppStateData }) {
  const ms = getMascotStage(state.currentStreak);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100/80 px-2.5 py-1 text-[10px] font-extrabold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
        <FlameIcon className="size-3" />
        مرحله شعله: {ms.name}
      </span>
      {ms.nextAt !== null && (
        <span className="text-[10px] font-medium text-muted-foreground">
          {toFa(Math.max(0, ms.nextAt - state.currentStreak))} روز تا{" "}
          {getMascotStage(ms.nextAt).name}
        </span>
      )}
    </div>
  );
}

/** چیپ یخ استریک — فقط برای کاربرانی که تمرین ثبت کرده‌اند */
function FreezeChip({ state }: { state: AppStateData }) {
  if (state.totalWorkouts === 0) return null;
  if (state.freezeAvailable) {
    return (
      <div className="flex items-center gap-1.5 self-start rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1.5 dark:border-sky-900/60 dark:bg-sky-950/40">
        <Snowflake className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
        <span className="text-[10.5px] font-extrabold text-sky-700 dark:text-sky-300">
          یخ استریک آماده — اگه یه روز جا بمونی نجاتت می‌ده
        </span>
      </div>
    );
  }
  const remaining = state.freezeNextAvailableDate
    ? daysBetween(state.today, state.freezeNextAvailableDate)
    : 0;
  if (state.freezeUsedDate && remaining > 0 && remaining <= 7) {
    return (
      <div className="flex items-center gap-1.5 self-start rounded-full border border-border bg-muted/50 px-3 py-1.5">
        <Snowflake className="size-3.5 shrink-0 text-muted-foreground/70" />
        <span className="text-[10.5px] font-bold text-muted-foreground">
          یخ استریک مصرف شده — از {toFa(remaining)} روز دیگه دوباره شارژ می‌شه
        </span>
      </div>
    );
  }
  return null;
}

export function TodayTab({ state, onCheckin, onReset, onEnableFreeMode }: TodayTabProps) {
  const task = state.currentTask;
  const isRest = task.type === "rest";
  const isFinal = task.type === "final";
  const greeting = useGreeting();
  const isNewUser = !state.planStatus.some((d) => d.status === "done");

  // ── حالت اتمام چالش: کارت قهرمانی + حالت تمرین آزاد ──
  if (state.finished) {
    return (
      <div className="flex flex-col gap-4">
        <FinishedHeader state={state} />
        {/* حالت تمرین آزاد فعال — کارت ثبت تمرین روزانه */}
        {state.freeMode && <FreeModeCard state={state} onCheckin={onCheckin} />}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          aria-label="چالش کامل شد"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-6 text-center text-white shadow-xl shadow-orange-500/20"
        >
          <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -right-8 size-48 rounded-full bg-white/10" />
          <TrophyIcon className="animate-flame mx-auto size-28 drop-shadow-lg" />
          <h2 className="mt-2 text-2xl font-black">تو قهرمان ۳۰ روز شدی!</h2>
          <p className="mt-1 text-[12px] font-bold text-white/85">
            از ۵ شنا در روز اول تا {toFa(state.totalPushups)} شنا مجموع — مسیر کامل رو
            رفتی
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <VictoryStat value={toFa(state.totalPushups)} label="شنا مجموع" />
            <VictoryStat value={toFa(state.totalWorkouts)} label="تمرین" />
            <VictoryStat value={toFa(state.bestStreak)} label="بهترین استریک" />
          </div>
          <button
            onClick={onReset}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/40 bg-white/10 py-3.5 text-[14px] font-black backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <RotateCcw className="size-4" />
            شروع دوباره چالش
          </button>
        </motion.section>
        {/* پیشنهاد ادامه با حالت تمرین آزاد — فقط وقتی وایر شده و هنوز فعاله */}
        {!state.freeMode && onEnableFreeMode && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-label="ادامه تمرین"
            className="rounded-3xl border border-border bg-card p-5 text-center"
          >
            <p className="text-[14px] font-extrabold">چالش تموم شد! می‌خوای ادامه بدی؟</p>
            <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-muted-foreground">
              با حالت تمرین آزاد هر روز می‌تونی شنا ثبت کنی و استریکت رو زنده نگه داری.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onEnableFreeMode}
              className="mt-3 w-full rounded-2xl border-2 border-orange-300 bg-orange-50 py-3 text-[13.5px] font-black text-orange-600 transition-colors hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/70"
            >
              شروع حالت تمرین آزاد
            </motion.button>
          </motion.section>
        )}
        <WeekStrip state={state} />
        <QuickStats state={state} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* نوار تاریخ و شماره روز + ماسکوت شعله */}
      <div className="flex items-start justify-between gap-2 px-1">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold">
            {isRest ? "امروز ریکاوریه" : greeting}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">{faDate(state.today)}</p>
          <MascotStageChip state={state} />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Mascot
            stage={getMascotStage(state.currentStreak).stage}
            mood={mascotMood(state)}
            className="size-14"
          />
          <span className="self-start rounded-full bg-secondary px-3 py-1.5 text-xs font-extrabold text-secondary-foreground">
            روز {toFa(task.day)} از {toFa(30)}
          </span>
        </div>
      </div>

      {/* چیپ یخ استریک — بعد از اولین تمرین */}
      <FreezeChip state={state} />

      {/* کارت خوش‌آمد برای کاربر تازه‌کار */}
      {isNewUser && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="راهنمای شروع"
          className="rounded-3xl border border-orange-200 bg-gradient-to-l from-orange-50 to-amber-50 p-4 dark:border-orange-900/60 dark:from-orange-950/40 dark:to-amber-950/30"
        >
          <p className="mb-3 text-[13px] font-black">چالش چطوری کار می‌کنه؟</p>
          <ol className="space-y-2.5">
            {[
              "هر روز یه تمرین کوچیک بر اساس برنامه علمی داری",
              "بعد از تمرین، تیکش بزن و استریک روزانه بگیر",
              "روزهای استراحت رو هم تایید کن تا استریک نشکنه",
            ].map((s, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-black text-white shadow-sm shadow-orange-500/30">
                  {toFa(i + 1)}
                </span>
                <span className="text-[11.5px] font-medium leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </motion.section>
      )}

      {/* بنر موفقیت امروز */}
      {state.checkedInToday && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40"
        >
          <CheckBadgeIcon className="size-6 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-extrabold text-emerald-800 dark:text-emerald-300">
              استریک امروز قفل شد!
            </p>
            <p className="text-emerald-700/80 dark:text-emerald-400/80">
              اگر می‌تونی، روز بعدی رو هم امروز بزن — ولی به بدنت رحم کن.
            </p>
          </div>
        </motion.div>
      )}

      {/* کارت اصلی روز */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        aria-label="تمرین امروز"
        className={`relative overflow-hidden rounded-3xl shadow-xl shadow-orange-500/10 ${
          isRest
            ? "bg-gradient-to-br from-emerald-400 to-teal-600"
            : isFinal
              ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500"
              : "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
        }`}
      >
        {/* الگوی دایره‌ای پس‌زمینه */}
        <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -right-8 size-48 rounded-full bg-white/10" />

        <div className="relative px-5 pb-5 pt-4 text-white">
          {/* عکس واقعی تمرین */}
          <div className="relative mx-auto -mt-1 mb-2 w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/25">
            <Image
              src={
                isRest
                  ? "/images/rest-hero.png"
                  : isFinal
                    ? "/images/final-hero.png"
                    : "/images/pushup-hero.png"
              }
              alt={
                isRest
                  ? "عکس استراحت و ریکاوری ورزشکار روی مت یوگا"
                  : isFinal
                    ? "عکس تمرین نهایی با نورپردازی طلایی و هیجان قهرمانی"
                    : "عکس ورزشکار در حال انجام شنا سوئدی با فرم صحیح"
              }
              width={1152}
              height={864}
              priority
              className="h-44 w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2.5 py-1 text-[9.5px] font-extrabold text-white backdrop-blur-sm">
              {isRest ? "ریکاوری فعال" : isFinal ? "روز آخر — همه یا هیچ!" : "فرم صحیح: بدن صاف مثل خط"}
            </span>
          </div>

          <div className="text-center">
            <p className="text-[13px] font-bold text-white/85">{task.title}</p>
            {isRest ? (
              <>
                <p className="mt-1 text-4xl font-black tracking-tight">استراحت</p>
                <p className="mt-1 text-sm font-medium text-white/85">
                  عضله‌ها امروز دارن قوی می‌شن
                </p>
              </>
            ) : (
              <>
                <div className="mt-1 flex items-end justify-center gap-2">
                  <span className="text-6xl font-black leading-none tracking-tight drop-shadow-sm">
                    {toFa(task.target)}
                  </span>
                  <span className="pb-1.5 text-sm font-extrabold text-white/90">شنا سوئدی</span>
                </div>
                {task.sets.length > 1 && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    {task.sets.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm"
                      >
                        ست {toFa(i + 1)}: {toFa(s)}
                      </span>
                    ))}
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
                      ۶۰-۹۰ ثانیه استراحت بین ست‌ها
                    </span>
                  </div>
                )}
                {isFinal && (
                  <p className="mt-2 text-[12px] font-bold text-amber-100">
                    هدف: ۵۵ شنا با فرم تمیز — رکوردت رو بشکن!
                  </p>
                )}
              </>
            )}
          </div>

          {/* نکته آموزشی */}
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-black/15 px-3.5 py-2.5 backdrop-blur-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-200" />
            <p className="text-[11.5px] font-medium leading-relaxed text-white/95">{task.tip}</p>
          </div>

          {/* دکمه اصلی */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onCheckin()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[15px] font-black text-orange-600 shadow-lg transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 dark:text-orange-600"
          >
            {isRest ? (
              "استراحت امروز انجام شد"
            ) : isFinal ? (
              <>
                <FlameIcon className="size-5" />
                تست نهایی رو ثبت کن
              </>
            ) : (
              "تمرین رو انجام دادم!"
            )}
          </motion.button>
          {state.checkedInToday && (
            <p className="mt-2 text-center text-[10.5px] font-bold text-white/75">
              استریک امروزت امنه — این تمرینِ اضافه‌ست
            </p>
          )}
        </div>
      </motion.section>

      {/* تایمر استراحت — فقط روزهای تمرین */}
      {!isRest && <RestTimer />}

      {/* نوار هفتگی — ۷ روز اخیر */}
      <WeekStrip state={state} />

      {/* خلاصه سریع */}
      <QuickStats state={state} />

      {/* راهنمای فرم صحیح */}
      <FormGuide />

      {/* راهنمای کوچک */}
      <div className="mb-2 flex items-start gap-2 rounded-2xl bg-muted/60 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          برنامه بر اساس اصل پیش‌بار تدریجی طراحی شده: هر روز کمی سخت‌تر از دیروز و هر
          هفته یک روز استراحت. ثبات مهم‌تر از شدت است — مثل دولینگو، هر روز بیا!
        </p>
      </div>
    </div>
  );
}

function FinishedHeader({ state }: { state: AppStateData }) {
  return (
    <div className="flex items-start justify-between gap-2 px-1">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-extrabold">قهرمان برگشتی!</h1>
        <p className="text-xs font-medium text-muted-foreground">{faDate(state.today)}</p>
        <MascotStageChip state={state} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Mascot
          stage={getMascotStage(state.currentStreak).stage}
          mood={mascotMood(state)}
          className="size-14"
        />
        <span className="self-start rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          ۳۰ از ۳۰ روز
        </span>
      </div>
    </div>
  );
}

/** کارت تمرین آزاد پس از پایان چالش — دیالوگ خودکفا با استپر */
function FreeModeCard({
  state,
  onCheckin,
}: {
  state: AppStateData;
  onCheckin: (completed?: number) => void;
}) {
  const [open, setOpen] = useState(false);
  // آخرین تعداد ثبت‌شده به‌عنوان پیش‌فرض دیالوگ
  const lastDone = useMemo(() => {
    const found = [...state.recentDays].reverse().find((d) => d.pushups > 0);
    return found?.pushups ?? Math.max(state.currentTask.target, 10);
  }, [state.recentDays, state.currentTask.target]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="تمرین آزاد"
      className="rounded-3xl border-2 border-orange-300/70 bg-gradient-to-l from-orange-50 to-amber-50 p-5 dark:border-orange-800 dark:from-orange-950/50 dark:to-amber-950/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-black">تمرین آزاد 💪</p>
          <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-muted-foreground">
            هر روز هر تعداد که تونستی بزن و استریکت رو حفظ کن
          </p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950">
          <DumbbellIcon className="size-6 text-orange-600 dark:text-orange-400" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-orange-100/60 px-3 py-2 dark:bg-orange-900/30">
        <FlameIcon className="size-4 shrink-0 text-orange-500" />
        <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300">
          استریک فعلی: {toFa(state.currentStreak)} روز
          {state.checkedInToday ? " — امروز ثبت شد" : " — امروز هنوز ثبت نشده"}
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-orange-500/25 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ثبت تمرین امروز
      </motion.button>
      <FreeModeCheckinDialog
        open={open}
        onOpenChange={setOpen}
        lastDone={lastDone}
        onSubmit={(n) => onCheckin(n)}
      />
    </motion.section>
  );
}

/** دیالوگ ثبت تمرین آزاد — الگوی دیالوگ چک‌این با بازه ۱ تا ۱۰۰۰ */
function FreeModeCheckinDialog({
  open,
  onOpenChange,
  lastDone,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lastDone: number;
  onSubmit: (completed: number) => void;
}) {
  const [count, setCount] = useState(lastDone);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCount(Math.min(1000, Math.max(1, lastDone)));
      setLoading(false);
    }
  }, [open, lastDone]);

  const clamp = (v: number) => Math.min(1000, Math.max(1, Math.round(v)));

  const submit = async () => {
    setLoading(true);
    try {
      onSubmit(clamp(count));
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-[28px] p-5" dir="rtl">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-base">ثبت تمرین آزاد</DialogTitle>
          <DialogDescription className="text-[11.5px] leading-relaxed">
            چند تا شنا زدی؟ هر عددی ثبت کنی استریک امروزت قفل می‌شه!
          </DialogDescription>
        </DialogHeader>

        {/* شمارنده */}
        <div className="mt-1 flex items-center justify-center gap-4">
          <button
            onClick={() => setCount((c) => clamp(c - 1))}
            className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/50 transition-colors hover:bg-muted active:scale-95"
            aria-label="یکی کمتر"
          >
            <Minus className="size-4" />
          </button>
          <div className="flex min-w-[110px] flex-col items-center rounded-2xl bg-orange-50 px-4 py-2.5 dark:bg-orange-950/50">
            <span className="text-4xl font-black tabular-nums leading-none text-orange-600 dark:text-orange-400">
              {toFa(count)}
            </span>
            <span className="mt-1 text-[9.5px] font-bold text-muted-foreground">شنا سوئدی</span>
          </div>
          <button
            onClick={() => setCount((c) => clamp(c + 1))}
            className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/50 transition-colors hover:bg-muted active:scale-95"
            aria-label="یکی بیشتر"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* میانبرهای سریع */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {[-5, -1, 1, 5, 10].map((v) => (
            <button
              key={v}
              onClick={() => setCount((c) => clamp(c + v))}
              className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[11px] font-extrabold text-orange-600 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-400"
            >
              {v > 0 ? `+${toFa(v)}` : toFa(v)}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          ثبت تمرین آزاد
        </button>
      </DialogContent>
    </Dialog>
  );
}

function VictoryStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-black/15 px-2 py-2.5 backdrop-blur-sm">
      <p className="text-lg font-black tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[9.5px] font-bold text-white/80">{label}</p>
    </div>
  );
}

function WeekStrip({ state }: { state: AppStateData }) {
  return (
    <section aria-label="هفته اخیر" className="rounded-3xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold">۷ روز اخیر</h2>
        <span className="text-[10.5px] font-bold text-muted-foreground">هفته اخیر → امروز</span>
      </div>
      <div className="flex items-start justify-between px-1">
        {state.recentDays.map((d, i) => {
          const isToday = d.date === state.today;
          const doneWorkout = d.type !== null && d.type !== "rest";
          const doneRest = d.type === "rest";
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-9 items-center justify-center rounded-full transition-all ${
                  doneWorkout
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/25"
                    : doneRest
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                      : isToday
                        ? "animate-ring-pulse border-2 border-dashed border-orange-400 bg-orange-50/50 dark:bg-orange-950/30"
                        : "border-2 border-dashed border-border bg-transparent"
                }`}
                title={
                  doneWorkout
                    ? `${toFa(d.pushups)} شنا`
                    : doneRest
                      ? "استراحت"
                      : isToday
                        ? "امروز"
                        : "از دست رفت"
                }
              >
                {doneWorkout ? (
                  <DumbbellIcon className="size-4 text-white" />
                ) : doneRest ? (
                  <RestMoonIcon className="size-4 [&_path]:fill-white [&_path]:stroke-none" />
                ) : (
                  <span
                    className={`text-[10px] font-black ${isToday ? "text-orange-500" : "text-muted-foreground/50"}`}
                  >
                    {faWeekdayShort(d.date)}
                  </span>
                )}
              </div>
              <span
                className={`text-[9.5px] font-bold ${
                  isToday ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground/70"
                }`}
              >
                {i === state.recentDays.length - 1 ? "امروز" : faWeekdayShort(d.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuickStats({ state }: { state: AppStateData }) {
  return (
    <section aria-label="خلاصه آمار" className="grid grid-cols-3 gap-3">
      <QuickStat
        icon={<DumbbellIcon className="size-4" />}
        value={toFa(sumWeek(state))}
        label="شنا این هفته"
      />
      <QuickStat
        icon={<FlameIcon className="size-4" />}
        value={toFa(state.bestStreak)}
        label="بهترین استریک"
      />
      <QuickStat
        icon={<CheckBadgeIcon className="size-4" />}
        value={toFa(state.totalWorkouts)}
        label="تمرین کامل"
      />
    </section>
  );
}

function sumWeek(state: AppStateData) {
  return state.recentDays.reduce((a, d) => a + d.pushups, 0);
}

function QuickStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-2 py-3 text-center">
      <div className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
        {icon}
      </div>
      <span className="text-base font-black tabular-nums">{value}</span>
      <span className="text-[9.5px] font-bold text-muted-foreground">{label}</span>
    </div>
  );
}
