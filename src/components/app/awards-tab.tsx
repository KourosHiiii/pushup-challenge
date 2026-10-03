"use client";

import { MedalIcon, LockIcon, TrophyIcon, SparkleIcon } from "./illustrations";
import { toFa } from "@/lib/dates";
import { ACHIEVEMENTS } from "@/lib/plan";
import type { AppStateData, AchievementDef } from "./types";
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

const GROUPS: AchievementDef["group"][] = ["شروع", "استریک", "حجم", "مسیر"];
const GROUP_DESC: Record<AchievementDef["group"], string> = {
  "شروع": "قدم‌های اول همیشه ویژه‌ان",
  "استریک": "ثبات روزانه، راز قهرمان‌ها",
  "حجم": "هر تکرار یک قدم به جلو",
  "مسیر": "سفر ۳۰ روزه رو کامل کن",
};

export function AwardsTab({
  state,
  onReset,
}: {
  state: AppStateData;
  onReset: () => void;
}) {
  const unlockedCount = state.achievements.filter((a) => a.unlocked).length;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="mb-2 flex flex-col gap-4">
      {/* هدر */}
      <section className="rounded-3xl border border-border bg-gradient-to-l from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MedalIcon className="size-14" />
            <SparkleIcon className="absolute -left-1.5 -top-1.5 size-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-extrabold">گنجینه نشان‌ها</h1>
            <p className="mt-0.5 text-[11.5px] font-medium text-muted-foreground">
              {unlockedCount === 0
                ? "اولین نشان با اولین تمرین توست!"
                : `${toFa(unlockedCount)} نشان از ${toFa(total)} جمع کردی`}
            </p>
          </div>
          <span className="text-2xl font-black tabular-nums text-amber-600 dark:text-amber-400">
            {toFa(unlockedCount)}
            <span className="text-sm text-muted-foreground">/{toFa(total)}</span>
          </span>
        </div>
      </section>

      {/* گروه‌ها */}
      {GROUPS.map((g) => {
        const items = state.achievements.filter((a) => a.def.group === g);
        return (
          <section key={g} aria-label={`نشان‌های ${g}`}>
            <div className="mb-2 px-1">
              <h2 className="text-sm font-extrabold">{g}</h2>
              <p className="text-[10.5px] font-medium text-muted-foreground">{GROUP_DESC[g]}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((a) => (
                <AchievementCard key={a.id} unlocked={a.unlocked} def={a.def} />
              ))}
            </div>
          </section>
        );
      })}

      {/* منطقه خطر — ریست */}
      <section className="rounded-3xl border border-destructive/25 bg-destructive/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-extrabold text-destructive">شروع دوباره چالش</p>
            <p className="mt-0.5 text-[10.5px] font-medium leading-relaxed text-muted-foreground">
              همه پیشرفت، استریک و نشان‌ها پاک می‌شن و از روز ۱ شروع می‌کنی.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="shrink-0 rounded-xl">
                ریست
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm rounded-3xl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>مطمئنی همه‌چیز پاک بشه؟</AlertDialogTitle>
                <AlertDialogDescription>
                  این کار برگشتی نداره! {toFa(state.totalPushups)} شنا،{" "}
                  {toFa(state.bestStreak)} روز بهترین استریک و همه نشان‌هات حذف می‌شن.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse justify-start gap-2">
                <AlertDialogAction
                  className="rounded-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    onReset();
                  }}
                >
                  آره، پاکش کن
                </AlertDialogAction>
                <AlertDialogCancel className="rounded-xl">نه، پشیمون شدم</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* امضای برنامه */}
      <p className="pb-1 text-center text-[10px] font-medium leading-relaxed text-muted-foreground/70">
        برنامه طراحی‌شده بر پایه اصول پیش‌بار تدریجی و برنامه‌های معروف ۳۰ روزه —
        مشاوره پزشکی جایگزین این برنامه نیست.
      </p>
    </div>
  );
}

function AchievementCard({ unlocked, def }: { unlocked: boolean; def: AchievementDef }) {
  if (unlocked) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/70 bg-gradient-to-b from-amber-50 to-orange-50/60 p-4 text-center shadow-sm dark:border-amber-700/50 dark:from-amber-950/40 dark:to-orange-950/30">
        <div className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full bg-amber-300/25 dark:bg-amber-500/15" />
        <MedalIcon className="mx-auto size-12 drop-shadow-md" />
        <p className="mt-2 text-[12.5px] font-extrabold">{def.title}</p>
        <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-muted-foreground">
          {def.description}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-border bg-muted/40 p-4 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <LockIcon className="size-5 text-muted-foreground/50" />
      </div>
      <p className="mt-2 text-[12.5px] font-extrabold text-muted-foreground/70">{def.title}</p>
      <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-muted-foreground/50">
        {def.description}
      </p>
    </div>
  );
}

export function FinishedHero({ state }: { state: AppStateData }) {
  return (
    <section className="flex items-center gap-3 rounded-3xl border-2 border-amber-300 bg-gradient-to-l from-amber-50 to-orange-50 p-5 dark:border-amber-700 dark:from-amber-950/50 dark:to-orange-950/40">
      <TrophyIcon className="size-14 shrink-0" />
      <div>
        <p className="text-base font-black text-amber-700 dark:text-amber-300">
          چالش ۳۰ روزه کامل شد!
        </p>
        <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-amber-700/80 dark:text-amber-400/80">
          {toFa(state.totalPushups)} شنا در {toFa(state.totalWorkouts)} تمرین — از ۵ شنا در
          روز اول تا ۵۵+ در تست نهایی. تو رسماً یه قهرمانی!
        </p>
      </div>
    </section>
  );
}
