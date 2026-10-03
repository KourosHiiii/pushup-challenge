"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Lightbulb, Info } from "lucide-react";
import {
  RestMoonIcon,
  FlameIcon,
  CheckBadgeIcon,
  DumbbellIcon,
} from "./illustrations";
import { faDate, faWeekdayShort, toFa } from "@/lib/dates";
import type { AppStateData } from "./types";

interface TodayTabProps {
  state: AppStateData;
  onCheckin: () => void;
}

export function TodayTab({ state, onCheckin }: TodayTabProps) {
  const task = state.currentTask;
  const isRest = task.type === "rest";
  const isFinal = task.type === "final";

  return (
    <div className="flex flex-col gap-4">
      {/* نوار تاریخ و شماره روز */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-extrabold">
            {state.finished ? "چالش کامل شد!" : isRest ? "امروز ریکاوریه" : "سلام قهرمان!"}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">{faDate(state.today)}</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-extrabold text-secondary-foreground">
          روز {toFa(task.day)} از {toFa(30)}
        </span>
      </div>

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
              {isRest || task.type !== "rest"
                ? "اگر می‌تونی، روز بعدی رو هم امروز بزن — ولی بدنت روجا بد."
                : "زیر ۷-۸ ساعت خواب خوبه!"}
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
            onClick={onCheckin}
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

      {/* نوار هفتگی — ۷ روز اخیر */}
      <section aria-label="هفته اخیر" className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold">۷ روز اخیر</h2>
          <span className="text-[10.5px] font-bold text-muted-foreground">دوشنبه → امروز</span>
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

      {/* خلاصه سریع */}
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
