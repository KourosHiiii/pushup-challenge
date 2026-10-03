"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toFa } from "@/lib/dates";
import type { AppStateData } from "./types";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  state: AppStateData;
  onSubmit: (completed?: number) => Promise<void>;
}

export function CheckinDialog({ open, onOpenChange, state, onSubmit }: CheckinDialogProps) {
  const task = state.currentTask;
  const isRest = task.type === "rest";
  const [count, setCount] = useState(task.target);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCount(task.target);
      setLoading(false);
    }
  }, [open, task.target]);

  const clamp = (v: number) => Math.min(500, Math.max(1, Math.round(v)));

  const submit = async () => {
    setLoading(true);
    try {
      await onSubmit(isRest ? undefined : count);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-[28px] p-5" dir="rtl">
        {isRest ? (
          <>
            <DialogHeader className="items-center text-center">
              <div className="mx-auto overflow-hidden rounded-2xl shadow-md ring-1 ring-emerald-200 dark:ring-emerald-800">
                <Image
                  src="/images/rest-hero.png"
                  alt="عکس استراحت و ریکاوری ورزشکار"
                  width={1152}
                  height={864}
                  className="h-28 w-full object-cover"
                />
              </div>
              <DialogTitle className="mt-2 text-base">
                روز استراحت — {task.title}
              </DialogTitle>
              <DialogDescription className="text-[11.5px] leading-relaxed">
                ثبت استراحت هم استریک امروزت رو نگه می‌داره. عضله‌ها در ریکاوری ساخته
                می‌شن!
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={submit}
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-emerald-500/25 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              تایید استراحت امروز
            </button>
          </>
        ) : (
          <>
            <DialogHeader className="items-center text-center">
              <div className="mx-auto w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-orange-200 dark:ring-orange-800">
                <Image
                  src={task.type === "final" ? "/images/final-hero.png" : "/images/pushup-hero.png"}
                  alt={
                    task.type === "final"
                      ? "عکس تمرین نهایی با نورپردازی طلایی"
                      : "عکس ورزشکار در حال انجام شنا سوئدی"
                  }
                  width={1152}
                  height={864}
                  className="h-28 w-full object-cover"
                />
              </div>
              <DialogTitle className="mt-1 text-base">
                روز {toFa(task.day)}: {task.title}
              </DialogTitle>
              <DialogDescription className="text-[11.5px] leading-relaxed">
                چند تا شنا زدی؟ همون {toFa(task.target)} تای برنامه عالیه، ولی هر عددی
                ثبت کنی پیشرفته!
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

            {/* میانبر */}
            <div className="mt-2 flex items-center justify-center gap-2">
              {[task.target, task.target + 2, task.target + 5].map((v, i) => (
                <button
                  key={i}
                  onClick={() => setCount(clamp(v))}
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-extrabold text-orange-600 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-400"
                >
                  {i === 0 ? `هدف: ${toFa(v)}` : `+${toFa(v - task.target)}`}
                </button>
              ))}
            </div>

            {/* ست‌ها */}
            {task.sets.length > 1 && (
              <p className="mt-1.5 text-center text-[10.5px] font-bold text-muted-foreground">
                یادت نره: {task.sets.map((s) => toFa(s)).join(" + ")} در {toFa(task.sets.length)} ست با
                استراحت کوتاه بین ست‌ها
              </p>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              ثبت تمرین روز {toFa(task.day)}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
