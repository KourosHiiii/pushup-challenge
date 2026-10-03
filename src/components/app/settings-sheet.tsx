"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Info,
  Monitor,
  Moon,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldAlert,
  Sun,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toFa } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { FlameIcon } from "./illustrations";
import type { AppStateData } from "./types";

const THEME_OPTIONS = [
  { value: "light", label: "روشن", icon: Sun },
  { value: "dark", label: "تاریک", icon: Moon },
  { value: "system", label: "سیستم", icon: Monitor },
] as const;

export function SettingsSheet({
  state,
  onReset,
}: {
  state: AppStateData;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const activeTheme = theme ?? "system";

  const handleReset = () => {
    // هپتیک تأیید عملیات مخرب
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([60, 40, 60]);
    }
    setOpen(false);
    onReset();
  };

  const hasProgress = state.totalPushups > 0 || state.currentStreak > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full"
          aria-label="تنظیمات"
        >
          <SettingsIcon className="size-[18px]" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-h-[88dvh] overflow-y-auto rounded-t-4xl px-5 pb-8 pt-2 outline-none"
      >
        {/* دستگیره کشیدنی */}
        <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/25" aria-hidden />

        <SheetHeader className="gap-1 text-right">
          <SheetTitle className="flex items-center gap-2 text-base font-extrabold">
            <SettingsIcon className="size-4.5 text-muted-foreground" />
            تنظیمات
          </SheetTitle>
          <SheetDescription className="text-[11.5px]">
            ظاهر اپ، اطلاعات چالش و شروع دوباره
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-5">
          {/* خلاصه پیشرفت فعلی */}
          <section aria-label="پیشرفت فعلی">
            <SectionTitle icon={FlameIcon}>پیشرفت فعلی</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              <ProgressChip label="روز" value={toFa(state.currentDay)} tone="orange" />
              <ProgressChip label="استریک" value={toFa(state.currentStreak)} tone="amber" />
              <ProgressChip label="شنا مجموع" value={toFa(state.totalPushups)} tone="teal" />
            </div>
          </section>

          <Separator />

          {/* ظاهر */}
          <section aria-label="ظاهر برنامه">
            <SectionTitle icon={Sun}>ظاهر برنامه</SectionTitle>
            <div
              role="radiogroup"
              aria-label="انتخاب تم"
              className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-muted/50 p-1.5"
            >
              {THEME_OPTIONS.map((opt) => {
                const active = activeTheme === opt.value;
                return (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-extrabold transition-all active:scale-95",
                      active
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <opt.icon className="size-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* منطقه خطر — ریست کامل */}
          <section aria-label="شروع دوباره چالش">
            <SectionTitle icon={ShieldAlert} danger>
              منطقه خطر
            </SectionTitle>
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
              <p className="text-[12.5px] font-extrabold text-destructive">
                ریست همه روزها و شروع از اول
              </p>
              <p className="mt-1 text-[10.5px] font-medium leading-relaxed text-muted-foreground">
                {hasProgress
                  ? `با ریست کردن، ${toFa(state.totalPushups)} شنا، استریک ${toFa(state.currentStreak)} روزه و همه نشان‌هات پاک می‌شن و از روز ۱ شروع می‌کنی.`
                  : "همه روزهای برنامه، استریک و نشان‌ها پاک می‌شن و از روز ۱ شروع می‌کنی."}
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="mt-3 w-full gap-2 rounded-xl active:scale-[0.98]"
                  >
                    <RotateCcw className="size-4" />
                    ریست کامل چالش
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-sm rounded-3xl">
                  <AlertDialogHeader className="text-right">
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Trash2 className="size-4.5 text-destructive" />
                      مطمئنی همه‌چیز پاک بشه؟
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      این کار برگشتی نداره! هر ۳۰ روز برنامه، استریک‌ها،{" "}
                      {toFa(state.totalPushups)} شنا، بهترین استریک{" "}
                      {toFa(state.bestStreak)} روزه و همه نشان‌هات برای همیشه حذف
                      می‌شن و از روز ۱ شروع می‌کنی.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse justify-start gap-2">
                    <AlertDialogAction
                      className="rounded-xl bg-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        handleReset();
                      }}
                    >
                      آره، همه‌چیز رو پاک کن
                    </AlertDialogAction>
                    <AlertDialogCancel className="rounded-xl">
                      نه، پشیمون شدم
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>

          <Separator />

          {/* درباره */}
          <section aria-label="درباره برنامه">
            <SectionTitle icon={Info}>درباره چالش</SectionTitle>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-extrabold">پوش‌آپ چلنج ۳۰ روزه</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-extrabold text-secondary-foreground">
                  نسخه {toFa("۱٫۰")}
                </span>
              </div>
              <p className="mt-1.5 text-[10.5px] font-medium leading-relaxed text-muted-foreground">
                برنامه بر پایه اصل پیش‌بار تدریجی (Progressive Overload) و الگوی
                چالش‌های معتبر ۳۰ روزه طراحی شده: شروع با ۵ شنا، رشد هفتگی ۱۰ تا ۱۵
                درصد، روزهای ریکاوری هر ۷ روز و تست نهایی روز ۳۰.
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <p
      className={cn(
        "mb-2 flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-wide",
        danger ? "text-destructive" : "text-muted-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </p>
  );
}

const TONES = {
  orange: "from-orange-100 to-amber-50 text-orange-700 dark:from-orange-950/60 dark:to-amber-950/40 dark:text-orange-300",
  amber: "from-amber-100 to-yellow-50 text-amber-700 dark:from-amber-950/60 dark:to-yellow-950/40 dark:text-amber-300",
  teal: "from-teal-100 to-emerald-50 text-teal-700 dark:from-teal-950/60 dark:to-emerald-950/40 dark:text-teal-300",
} as const;

function ProgressChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-b p-3 text-center ring-1 ring-border/50",
        TONES[tone]
      )}
    >
      <p className="text-lg font-black tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-bold opacity-80">{label}</p>
    </div>
  );
}
