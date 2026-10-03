"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { FlameIcon } from "./illustrations";
import { SettingsSheet } from "./settings-sheet";
import { toFa } from "@/lib/dates";
import type { AppStateData } from "./types";
import { Button } from "@/components/ui/button";

export function AppHeader({
  state,
  onReset,
}: {
  state: AppStateData;
  onReset: () => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="glass-card sticky top-0 z-40 border-b border-border/60 bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between gap-2 px-4">
        {/* لوگو و نام */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
            <FlameIcon className="size-6" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold">پوش‌آپ چلنج</p>
            <p className="text-[11px] font-medium text-muted-foreground">
              سطح {toFa(state.level.level)} · {state.level.title}
            </p>
          </div>
        </div>

        {/* استریک و تم */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm transition-colors ${
              state.currentStreak > 0
                ? "bg-gradient-to-l from-orange-100 to-amber-100 dark:from-orange-950/80 dark:to-amber-950/80"
                : "bg-muted"
            }`}
            title="استریک روزانه"
            aria-label={`استریک روزانه: ${state.currentStreak} روز`}
          >
            <FlameIcon
              className={`size-5 ${state.currentStreak > 0 ? "animate-flame" : "opacity-30 grayscale"}`}
            />
            <span
              className={`text-sm font-extrabold tabular-nums ${
                state.currentStreak > 0 ? "text-orange-700 dark:text-orange-300" : "text-muted-foreground"
              }`}
            >
              {toFa(state.currentStreak)}
            </span>
          </div>
          <SettingsSheet state={state} onReset={onReset} />
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
          >
            <Sun className="size-[18px] dark:hidden" />
            <Moon className="hidden size-[18px] dark:block" />
          </Button>
        </div>
      </div>
    </header>
  );
}
