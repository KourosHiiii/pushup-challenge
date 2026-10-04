"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FlameIcon, CheckBadgeIcon, MedalIcon, TrophyIcon, DumbbellIcon } from "./illustrations";
import { createShareFile } from "./share-card";
import { toFa } from "@/lib/dates";
import { ACHIEVEMENTS } from "@/lib/plan";
import { fireCelebration, fireBigCelebration } from "@/lib/confetti";
import type { AppStateData, CelebrationData } from "./types";

/** شمارنده متحرک */
function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => toFa(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export function CelebrationOverlay({
  data,
  onClose,
  state,
}: {
  data: CelebrationData | null;
  onClose: () => void;
  /** اگر پاس شود، اشتراک با کارت تصویری انجام می‌شود (وایرینگ در page.tsx) */
  state?: AppStateData | null;
}) {
  const isRest = data?.type === "rest";
  const finished = data?.finished ?? false;

  useEffect(() => {
    if (!data) return;
    if (finished || data.newLevel) {
      fireBigCelebration();
    } else {
      fireCelebration();
    }
    // جلوگیری از اسکرول پس‌زمینه
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [data, finished]);

  const newAchievements = ACHIEVEMENTS.filter((a) =>
    data?.newAchievementIds.includes(a.id)
  );

  const shareText = data
    ? !isRest
      ? `تو «پوش‌آپ چلنج» روز ${data.dayCompleted} از چالش ۳۰ روزه شنا سوئدی رو کامل کردم — ${data.completedPushups} شنا و استریک ${data.newStreak} روزه! تو هم بیا`
      : `تو «پوش‌آپ چلنج» استریک ${data.newStreak} روزه‌ام رو با استراحت هوشمندانه حفظ کردم! تو هم بیا`
    : "";

  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!shareText || sharing) return;
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    setSharing(true);
    try {
      if (state) {
        // ۱) اشتراک کارت تصویری قهرمانی
        const file = await createShareFile(state);
        if (nav.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "پوش‌آپ چلنج",
            text: shareText,
          } as ShareData);
        } else if (typeof navigator.share === "function") {
          // ۲) جایگزین: اشتراک متن ساده
          await navigator.share({ title: "پوش‌آپ چلنج", text: shareText });
        } else {
          // ۳) جایگزین دسکتاپ: ذخیره کارت تصویری
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          toast.success("کارت قهرمانی ذخیره شد!");
        }
      } else if (typeof navigator.share === "function") {
        await navigator.share({ title: "پوش‌آپ چلنج", text: shareText });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast.success("متن دستاوردت کپی شد!");
      } else {
        toast.error("اشتراک‌گذاری پشتیبانی نمی‌شه");
      }
    } catch (e) {
      // لغو کاربر بی‌صدا؛ خطای واقعی با توست
      if (e instanceof Error && e.name !== "AbortError") {
        toast.error("اشتراک‌گذاری نشد — دوباره امتحان کن");
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="جشن تمرین کامل"
        >
          <motion.div
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-card p-6 text-center shadow-2xl"
          >
            {/* نوار رنگی بالا */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-l from-orange-400 via-amber-400 to-emerald-400" />

            {/* آیکون اصلی */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }}
              className="mx-auto mt-2"
            >
              {finished ? (
                <TrophyIcon className="size-24" />
              ) : isRest ? (
                <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <CheckBadgeIcon className="size-16" />
                </div>
              ) : (
                <FlameIcon className="animate-flame size-24" />
              )}
            </motion.div>

            <h2 className="mt-3 text-xl font-black">
              {finished
                ? "تو قهرمان چالشی!"
                : isRest
                  ? "استراحت هوشمندانه!"
                  : "ایول! روز کامل شد"}
            </h2>
            <p className="mt-0.5 text-[12px] font-bold text-muted-foreground">
              {finished
                ? "۳۰ روز، یک قهرمان جدید"
                : `روز ${toFa(data.dayCompleted)} — ${data.dayTitle}`}
            </p>

            {/* آمار جشن */}
            {!isRest && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex flex-1 flex-col items-center rounded-2xl bg-orange-50 px-3 py-3 dark:bg-orange-950/50">
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <DumbbellIcon className="size-4" />
                    <CountUp value={data.completedPushups} />
                  </div>
                  <span className="mt-0.5 text-[9.5px] font-bold text-muted-foreground">
                    شنا انجام شد
                  </span>
                </div>
                <div
                  className={`flex flex-1 flex-col items-center rounded-2xl px-3 py-3 ${
                    data.streakIncreased
                      ? "bg-amber-50 dark:bg-amber-950/50"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <FlameIcon className="size-4" />
                    <span className="text-lg font-black tabular-nums">
                      {toFa(data.newStreak)}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[9.5px] font-bold text-muted-foreground">
                    {data.streakIncreased ? "روز استریک جدید!" : "روز استریک"}
                  </span>
                </div>
              </div>
            )}

            {/* سطح جدید */}
            {data.newLevel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 rounded-2xl bg-gradient-to-l from-orange-100 to-amber-100 px-4 py-2.5 dark:from-orange-950/60 dark:to-amber-950/60"
              >
                <p className="text-[12px] font-black text-orange-700 dark:text-orange-300">
                  سطح جدید باز شد: سطح {toFa(data.newLevel.level)} — {data.newLevel.title}
                </p>
              </motion.div>
            )}

            {/* نشان‌های جدید */}
            {newAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-3 py-3 dark:border-amber-800/50 dark:bg-amber-950/40"
              >
                <p className="mb-2 text-[10.5px] font-black text-amber-700 dark:text-amber-300">
                  {newAchievements.length > 1
                    ? `${toFa(newAchievements.length)} نشان جدید گرفتی!`
                    : "نشان جدید گرفتی!"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {newAchievements.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.12, type: "spring", stiffness: 320, damping: 16 }}
                      className="flex w-[88px] flex-col items-center gap-1"
                    >
                      <MedalIcon className="size-9" />
                      <span className="text-[9px] font-extrabold leading-tight">{a.title}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {finished && (
              <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-2.5 text-[11.5px] font-bold leading-relaxed text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                از ۵ شنا در روز اول به {toFa(data.completedPushups)} شنا رسیدی. بدنت رو
                شگفت‌زده کردی!
              </p>
            )}

            {/* دکمه ادامه */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-gradient-to-l from-orange-500 to-orange-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-orange-500/30 transition-transform hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {finished ? "چه سفری بود!" : "ادامه بده!"}
            </motion.button>

            {/* اشتراک کارت قهرمانی */}
            <button
              onClick={handleShare}
              disabled={sharing}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted/40 py-2.5 text-[12px] font-extrabold text-muted-foreground transition-colors hover:bg-muted active:scale-[0.98] disabled:opacity-60"
            >
              {sharing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Share2 className="size-4" />
              )}
              {state ? "اشتراک کارت قهرمانی" : "لافتا رو بفرست بقیه هم بیان!"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
