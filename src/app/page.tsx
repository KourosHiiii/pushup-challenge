"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/app/header";
import { BottomNav } from "@/components/app/bottom-nav";
import { TodayTab } from "@/components/app/today-tab";
import { PlanTab } from "@/components/app/plan-tab";
import { StatsTab } from "@/components/app/stats-tab";
import { AwardsTab, FinishedHero } from "@/components/app/awards-tab";
import { CelebrationOverlay } from "@/components/app/celebration-overlay";
import { CheckinDialog } from "@/components/app/checkin-dialog";
import { FlameIcon, TrophyIcon } from "@/components/app/illustrations";
import type { AppStateData, CelebrationData, TabId } from "@/components/app/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [state, setState] = useState<AppStateData | null>(null);
  const [tab, setTab] = useState<TabId>("today");
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error("خطا در دریافت وضعیت");
      const data = (await res.json()) as AppStateData;
      setState(data);
    } catch {
      toast.error("اتصال برقرار نشد — یه بار دیگه امتحان کن");
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleCheckin = useCallback(
    async (completed?: number) => {
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "ثبت نشد — دوباره امتحان کن");
          return;
        }
        setDialogOpen(false);
        setState(data.state as AppStateData);
        setCelebration(data.celebration as CelebrationData);
        // هپتیک موفقیت (اندروید/مرورگرهای پشتیبان)
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([110, 60, 110, 60, 180]);
        }
      } catch {
        toast.error("ارتباط با سرور قطع شد");
      }
    },
    []
  );

  const handleReset = useCallback(async () => {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setState(data.state as AppStateData);
      setTab("today");
      toast.success("چالش ریست شد — از روز ۱ شروع کن!");
    } catch {
      toast.error("ریست نشد");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50/80 via-background to-background dark:from-orange-950/20">
      {state ? <AppHeader state={state} /> : <HeaderSkeleton />}

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        {!state ? (
          <LoadingSkeleton />
        ) : (
          <>
            {tab === "today" && (
              <>
                {state.finished && <FinishedHero state={state} />}
                <TodayTab
                  state={state}
                  onCheckin={() => {
                    if (!state.finished) setDialogOpen(true);
                  }}
                  onReset={handleReset}
                />
              </>
            )}
            {tab === "plan" && <PlanTab state={state} />}
            {tab === "stats" && <StatsTab state={state} />}
            {tab === "awards" && <AwardsTab state={state} onReset={handleReset} />}
          </>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={setTab}
        achievementsUnlocked={state?.achievements.filter((a) => a.unlocked).length ?? 0}
      />

      {state && (
        <CheckinDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          state={state}
          onSubmit={handleCheckin}
        />
      )}

      <CelebrationOverlay data={celebration} onClose={() => setCelebration(null)} />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="border-b border-border/60 bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-5">
        <div className="flex justify-center py-4">
          <FlameIcon className="size-24 opacity-70" />
        </div>
        <Skeleton className="mx-auto h-4 w-28 bg-white/30" />
        <div className="mx-auto mt-3 flex h-12 w-40 items-center justify-center">
          <TrophyIcon className="size-8 opacity-40" />
        </div>
        <Skeleton className="mx-auto mt-4 h-12 w-full rounded-2xl bg-white/25" />
      </div>
      <Skeleton className="h-28 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
          در حال آماده‌سازی چالش...
        </Button>
      </div>
    </div>
  );
}
