"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Check, Zap, CalendarCheck2 } from "lucide-react";
import { DumbbellIcon, FlameIcon, TrophyIcon, CheckBadgeIcon } from "./illustrations";
import { faWeekdayShort, toFa } from "@/lib/dates";
import { PLAN } from "@/lib/plan";
import type { AppStateData } from "./types";
import { Progress } from "@/components/ui/progress";

export function StatsTab({ state }: { state: AppStateData }) {
  const chartData = state.recentDays.map((d) => ({
    name: d.date === state.today ? "امروز" : faWeekdayShort(d.date),
    pushups: d.pushups,
    isToday: d.date === state.today,
  }));
  const weekTotal = state.recentDays.reduce((a, d) => a + d.pushups, 0);
  const doneDays = state.planStatus.filter((d) => d.status === "done").length;
  const nextLevelLeft = Math.max(0, state.level.nextAt - state.totalPushups);

  return (
    <div className="mb-2 flex flex-col gap-4">
      {/* کارت‌های آمار */}
      <section aria-label="آمار کلی" className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<DumbbellIcon className="size-5" />}
          value={toFa(state.totalPushups)}
          label="مجموع شنا"
          tint="orange"
        />
        <StatCard
          icon={<FlameIcon className="size-5" />}
          value={toFa(state.currentStreak)}
          label="استریک فعلی"
          tint="rose"
        />
        <StatCard
          icon={<TrophyIcon className="size-5" />}
          value={toFa(state.bestStreak)}
          label="بهترین استریک"
          tint="amber"
        />
        <StatCard
          icon={<Zap className="size-5" />}
          value={toFa(bestDay(state))}
          label="رکورد یک روز"
          tint="violet"
        />
        <StatCard
          icon={<CheckBadgeIcon className="size-5" />}
          value={toFa(state.totalWorkouts)}
          label="تمرین کامل"
          tint="emerald"
        />
        <StatCard
          icon={<CalendarCheck2 className="size-5" />}
          value={toFa(doneDays)}
          label="روز کامل‌شده"
          tint="teal"
        />
      </section>

      {/* نمودار هفتگی */}
      <section aria-label="نمودار هفتگی" className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-1 flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold">شناهای این هفته</h2>
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold text-secondary-foreground">
            <Zap className="size-3" />
            {toFa(weekTotal)} شنا
          </span>
        </div>
        <div className="h-44 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 700, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={28}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => toFa(v)}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "var(--font-vazir)",
                  direction: "rtl",
                }}
                formatter={(value: number | string) => [`${toFa(Number(value))} شنا`, "انجام‌شده"]}
                labelFormatter={(label: string) => (label === "امروز" ? "امروز" : `روز ${label}`)}
              />
              <Bar dataKey="pushups" radius={[8, 8, 8, 8]} maxBarSize={34}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.isToday
                        ? "var(--chart-5)"
                        : entry.pushups > 0
                          ? "var(--chart-1)"
                          : "var(--muted)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* سطح */}
      <section aria-label="سطح فعلی" className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
            <span className="text-[9px] font-bold opacity-90">سطح</span>
            <span className="text-xl font-black leading-none">{toFa(state.level.level)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold">{state.level.title}</p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {nextLevelLeft > 0
                ? `${toFa(nextLevelLeft)} شنا تا سطح بعد`
                : "بالاترین سطح — تو یه افسانه‌ای!"}
            </p>
            <Progress
              value={state.levelProgressValue * 100}
              className="mt-2 h-2 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* تقویم ۳۰ روزه */}
      <section aria-label="تقویم چالش" className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold">نقشه ۳۰ روزه</h2>
          <span className="text-[10.5px] font-bold text-muted-foreground">
            {toFa(doneDays)} از {toFa(PLAN.length)} روز کامل شده
          </span>
        </div>
        <div className="grid grid-cols-6 justify-items-center gap-2">
          {state.planStatus.map((d) => {
            const isRest = d.type === "rest";
            const doneWorkout = d.status === "done" && !isRest;
            const doneRest = d.status === "done" && isRest;
            const isCurrent = d.status === "current";
            const isFinal = d.type === "final";
            return (
              <div
                key={d.day}
                title={`روز ${d.day} — ${d.title}`}
                className={`flex size-9 items-center justify-center rounded-full text-[10.5px] font-black transition-all ${
                  doneWorkout
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm shadow-orange-500/30"
                    : doneRest
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-500/30"
                      : isCurrent
                        ? "animate-ring-pulse bg-orange-100 text-orange-700 ring-2 ring-orange-400 dark:bg-orange-950 dark:text-orange-300"
                        : `border-2 border-dashed border-border ${
                            isFinal ? "text-amber-500/80" : "text-muted-foreground/45"
                          }`
                }`}
              >
                {doneWorkout || doneRest ? (
                  <Check className="size-4" strokeWidth={3.5} />
                ) : (
                  toFa(d.day)
                )}
              </div>
            );
          })}
        </div>
        {/* راهنما */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-3 text-[9.5px] font-bold text-muted-foreground">
          <LegendItem color="bg-gradient-to-br from-orange-400 to-orange-600" label="تمرین انجام‌شده" />
          <LegendItem color="bg-gradient-to-br from-emerald-400 to-teal-500" label="استراحت" />
          <LegendItem color="bg-orange-100 ring-1 ring-orange-400 dark:bg-orange-950" label="روز جاری" />
          <LegendItem color="border-2 border-dashed border-border" label="باقی‌مانده" />
        </div>
      </section>
    </div>
  );
}

const TINTS: Record<string, string> = {
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
};

/** بهترین رکورد شنا در یک روز */
function bestDay(state: AppStateData): number {
  return state.planStatus.reduce(
    (max, d) => Math.max(max, d.completed ?? 0),
    0
  );
}

function StatCard({
  icon,
  value,
  label,
  tint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tint: keyof typeof TINTS;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-4">
      <div className={`flex size-9 items-center justify-center rounded-xl ${TINTS[tint]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-[10.5px] font-bold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block size-3.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
