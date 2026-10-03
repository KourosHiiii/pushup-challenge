"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { CheckBadgeIcon, RestMoonIcon, FlameIcon, TrophyIcon } from "./illustrations";
import { toFa, faDate } from "@/lib/dates";
import { PLAN } from "@/lib/plan";
import type { AppStateData, PlanDayStatus } from "./types";
import { Progress } from "@/components/ui/progress";

const WEEK_PHASES = ["", "پایه‌سازی", "ساخت قدرت", "اوج قدرت", "فولاد شدن", "هفته فینال"];

export function PlanTab({ state }: { state: AppStateData }) {
  const doneCount = state.planStatus.filter((d) => d.status === "done").length;
  const pct = Math.round((doneCount / PLAN.length) * 100);

  const weeks: { week: number; days: PlanDayStatus[] }[] = [];
  for (const d of state.planStatus) {
    let w = weeks.find((x) => x.week === d.week);
    if (!w) {
      w = { week: d.week, days: [] };
      weeks.push(w);
    }
    w.days.push(d);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* کارت پیشرفت کلی */}
      <section
        aria-label="پیشرفت برنامه"
        className="rounded-3xl border border-border bg-card p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold">پیشرفت چالش ۳۰ روزه</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {doneCount === 0
                ? "سفرت رو همین امروز شروع کن!"
                : doneCount === PLAN.length
                  ? "تو کاملش کردی — افتخار!"
                  : `${toFa(PLAN.length - doneCount)} روز تا قهرمانی`}
            </p>
          </div>
          <span className="text-2xl font-black tabular-nums text-primary">%{toFa(pct)}</span>
        </div>
        <Progress value={pct} className="h-3 rounded-full" />
        <div className="mt-2 flex justify-between text-[10px] font-bold text-muted-foreground">
          <span>روز {toFa(doneCount)}</span>
          <span>روز {toFa(PLAN.length)}</span>
        </div>
      </section>

      {/* هفته‌ها */}
      {weeks.map((w, wi) => (
        <section key={w.week} aria-label={`هفته ${w.week}`} className="rounded-3xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold">
              هفته {toFa(w.week)}
              <span className="mr-2 text-[11px] font-bold text-muted-foreground">
                {WEEK_PHASES[w.week] ?? ""}
              </span>
            </h2>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold text-secondary-foreground">
              {toFa(w.days.filter((d) => d.status === "done").length)}/{toFa(w.days.length)} روز
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {w.days.map((d, i) => (
              <DayRow key={d.day} d={d} state={state} last={i === w.days.length - 1} index={wi * 10 + i} />
            ))}
          </div>
        </section>
      ))}

      {/* کارت پایان */}
      <section className="mb-2 flex items-center gap-3 rounded-3xl border border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 p-4 dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/40">
        <TrophyIcon className="size-10 shrink-0" />
        <div>
          <p className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
            جایزه پایان مسیر
          </p>
          <p className="text-[11px] font-medium leading-relaxed text-amber-700/80 dark:text-amber-400/80">
            با تکمیل هر ۳۰ روز، از ۵ شنا به آمادگی ۵۵ شنای پیوسته می‌رسی — افزایشی
            بیش از ۱۰ برابر!
          </p>
        </div>
      </section>
    </div>
  );
}

function DayRow({
  d,
  state,
  last,
  index,
}: {
  d: PlanDayStatus;
  state: AppStateData;
  last: boolean;
  index: number;
}) {
  const isRest = d.type === "rest";
  const isFinal = d.type === "final";
  const isCurrent = d.status === "current";
  const isDone = d.status === "done";
  const isLocked = d.status === "upcoming";

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.3 }}
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
        isCurrent
          ? "bg-gradient-to-l from-orange-50 to-amber-50 ring-2 ring-orange-400/70 dark:from-orange-950/50 dark:to-amber-950/30"
          : isDone
            ? "bg-muted/40"
            : "bg-transparent"
      } ${last ? "" : "mb-0.5"}`}
    >
      {/* نشان وضعیت */}
      <div className="shrink-0">
        {isDone ? (
          isRest ? (
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <RestMoonIcon className="size-5" />
            </div>
          ) : (
            <CheckBadgeIcon className="size-9" />
          )
        ) : isCurrent ? (
          <div className="animate-ring-pulse flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/30">
            <FlameIcon className="size-5" />
          </div>
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground/40">
            {isRest ? (
              <RestMoonIcon className="size-4 opacity-40 grayscale" />
            ) : (
              <Lock className="size-4" />
            )}
          </div>
        )}
      </div>

      {/* متن */}
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-center gap-2">
          <p
            className={`text-[13px] font-extrabold ${
              isLocked ? "text-muted-foreground/60" : ""
            }`}
          >
            روز {toFa(d.day)}
            {isCurrent && (
              <span className="mr-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[8.5px] font-black text-white">
                امروز
              </span>
            )}
          </p>
        </div>
        <p
          className={`truncate text-[11px] font-medium ${
            isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
          }`}
        >
          {isDone && d.date ? `${d.title} · ${faDate(d.date)}` : d.title}
        </p>
      </div>

      {/* هدف */}
      <div className="shrink-0 text-left">
        {isRest ? (
          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            ریکاوری
          </span>
        ) : isFinal ? (
          <span className="text-[12px] font-black text-amber-600 dark:text-amber-400">
            {toFa(d.target)}+ شنا
          </span>
        ) : (
          <span
            className={`text-[13px] font-black tabular-nums ${
              isDone
                ? "text-orange-600 dark:text-orange-400"
                : isCurrent
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground/60"
            }`}
          >
            {toFa(isDone && d.completed !== undefined ? d.completed : d.target)}
            <span className="text-[9px] font-bold"> شنا</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
