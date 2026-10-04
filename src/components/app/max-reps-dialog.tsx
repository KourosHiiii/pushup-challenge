"use client";

import { useEffect, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { toFa } from "@/lib/dates";
import { getPlatform } from "@/lib/notifications";
import { localMaxReps } from "@/lib/offline-state";
import { fireCelebration } from "@/lib/confetti";

interface MaxRepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** بهترین رکورد قبلی (null = هنوز تستی ثبت نشده) */
  previousBest: number | null;
  /** پس از ثبت موفق — والد دیتا را دوباره می‌گیرد */
  onSuccess: () => void;
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** ارقام فارسی/عربی → لاتین برای پارس ورودی */
function toEnDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

const clamp = (v: number) => Math.min(500, Math.max(1, Math.round(v)));

export function MaxRepsDialog({
  open,
  onOpenChange,
  previousBest,
  onSuccess,
}: MaxRepsDialogProps) {
  const [count, setCount] = useState(30);
  const [text, setText] = useState("۳۰");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initial = clamp(previousBest ?? 30);
      setCount(initial);
      setText(toFa(initial));
      setSaving(false);
    }
  }, [open, previousBest]);

  const bump = (delta: number) => {
    const next = clamp(count + delta);
    setCount(next);
    setText(toFa(next));
  };

  const onTextChange = (v: string) => {
    setText(v);
    const parsed = parseInt(toEnDigits(v).replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(parsed) && parsed >= 1) setCount(clamp(parsed));
  };

  const save = async () => {
    setSaving(true);
    try {
      const hadPrevious = previousBest !== null;
      let isRecord = false;
      if (getPlatform() === "native") {
        // APK آفلاین: localStorage → { tests, best, isRecord }
        const res = localMaxReps.save(count);
        isRecord = Boolean(res?.isRecord);
      } else {
        const res = await fetch("/api/max-reps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          isRecord?: boolean;
        };
        if (!res.ok) throw new Error(json.error ?? "ثبت تست ناموفق بود");
        isRecord = Boolean(json.isRecord);
      }
      if (isRecord && hadPrevious) {
        fireCelebration();
        toast.success("رکورد جدید! 🔥");
      } else {
        toast.success("ثبت شد");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ثبت تست ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-[28px] p-5" dir="rtl">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-base">تست حداکثر شنا</DialogTitle>
          <DialogDescription className="text-[11.5px] leading-relaxed">
            یه ست کامل بزن — تا جایی که دیگه نمی‌تونی! فرم صحیح یادت نره.
          </DialogDescription>
        </DialogHeader>

        {previousBest !== null && (
          <p className="-mt-1 text-center text-[10.5px] font-bold text-muted-foreground">
            رکورد قبلی تو:{" "}
            <span className="text-orange-600 dark:text-orange-400">
              {toFa(previousBest)} شنا
            </span>{" "}
            — بشکنش! 💪
          </p>
        )}

        {/* شمارنده */}
        <div className="mt-1 flex items-center justify-center gap-3" dir="ltr">
          <button
            onClick={() => bump(-1)}
            className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/50 transition-colors hover:bg-muted active:scale-95"
            aria-label="یکی کمتر"
          >
            <Minus className="size-4" />
          </button>
          <input
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={() => setText(toFa(count))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
            }}
            inputMode="numeric"
            aria-label="تعداد شنا در یک ست"
            className="h-16 w-24 rounded-2xl border-0 bg-orange-50 text-center text-3xl font-black tabular-nums text-orange-600 ring-orange-400 transition-shadow focus-visible:outline-none focus-visible:ring-2 dark:bg-orange-950/50 dark:text-orange-400"
          />
          <button
            onClick={() => bump(1)}
            className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/50 transition-colors hover:bg-muted active:scale-95"
            aria-label="یکی بیشتر"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <p className="text-center text-[9.5px] font-bold text-muted-foreground">
          بین {toFa(1)} تا {toFa(500)} شنا
        </p>

        <button
          onClick={() => void save()}
          disabled={saving}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-orange-500/25 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          ثبت تست
        </button>
      </DialogContent>
    </Dialog>
  );
}
