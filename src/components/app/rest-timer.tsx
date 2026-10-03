"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { toFa } from "@/lib/dates";

const R = 34;
const CIRC = 2 * Math.PI * R;

/** تایمر استراحت بین ست‌ها — ۶۰-۹۰ ثانیه طبق برنامه‌های علمی */
export function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setFinished(true);
            // هپتیک پایان استراحت
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate([220, 110, 220, 110, 320]);
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const pick = (d: number) => {
    setDuration(d);
    setRemaining(d);
    setRunning(false);
    setFinished(false);
  };

  const reset = () => {
    setRemaining(duration);
    setRunning(false);
    setFinished(false);
  };

  const progress = duration > 0 ? remaining / duration : 0;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <section
      aria-label="تایمر استراحت بین ست‌ها"
      className="rounded-3xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
            <Timer className="size-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-extrabold leading-tight">تایمر استراحت بین ست‌ها</h2>
            <p className="text-[10px] font-medium text-muted-foreground">
              بین هر ست ۶۰ تا ۹۰ ثانیه استراحت کن
            </p>
          </div>
        </div>
        {/* انتخاب مدت */}
        <div className="flex items-center gap-1.5">
          {[60, 90, 120].map((d) => (
            <button
              key={d}
              onClick={() => pick(d)}
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold transition-colors ${
                duration === d
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              aria-pressed={duration === d}
            >
              {toFa(d)}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 py-1">
        {/* حلقه شمارش */}
        <div className="relative size-24">
          <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" strokeWidth="7" className="stroke-muted" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${
                finished ? "stroke-emerald-500" : "stroke-primary"
              }`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {finished ? (
              <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                بزن بریم!
              </span>
            ) : (
              <>
                <span className="text-xl font-black tabular-nums leading-none">
                  {toFa(mm)}:{toFa(ss)}
                </span>
                <span className="mt-0.5 text-[8.5px] font-bold text-muted-foreground">
                  {running ? "در حال استراحت" : "آماده"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* کنترل‌ها */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (finished) reset();
              else setRunning((r) => !r);
            }}
            className={`flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-2xl px-4 text-[13px] font-black text-white shadow-md transition-all active:scale-95 ${
              finished
                ? "bg-gradient-to-l from-emerald-500 to-teal-600 shadow-emerald-500/25"
                : "bg-gradient-to-l from-orange-500 to-orange-600 shadow-orange-500/25"
            }`}
          >
            {finished ? (
              <>
                <RotateCcw className="size-4" />
                استراحت دوباره
              </>
            ) : running ? (
              <>
                <Pause className="size-4" />
                توقف
              </>
            ) : (
              <>
                <Play className="size-4" />
                شروع استراحت
              </>
            )}
          </button>
          <button
            onClick={reset}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-muted active:scale-95"
          >
            <RotateCcw className="size-3.5" />
            ریست
          </button>
        </div>
      </div>
    </section>
  );
}
