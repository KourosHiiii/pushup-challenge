"use client";

import { motion } from "framer-motion";
import { Home, ListChecks, BarChart3, Trophy, GraduationCap } from "lucide-react";
import { toFa } from "@/lib/dates";
import type { TabId } from "./types";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "today", label: "امروز", icon: Home },
  { id: "plan", label: "برنامه", icon: ListChecks },
  { id: "learn", label: "یادگیری", icon: GraduationCap },
  { id: "stats", label: "آمار", icon: BarChart3 },
  { id: "awards", label: "نشان‌ها", icon: Trophy },
];

export function BottomNav({
  active,
  onChange,
  achievementsUnlocked = 0,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  achievementsUnlocked?: number;
}) {
  return (
    <nav
      className="glass-card fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 pb-[env(safe-area-inset-bottom)]"
      aria-label="ناوبری اصلی"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-5 px-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-1 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon
                className={`relative z-10 size-[22px] transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`relative z-10 text-[10.5px] font-bold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
                {tab.id === "awards" && achievementsUnlocked > 0 && (
                  <span className="absolute -top-1.5 -left-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
                    {toFa(achievementsUnlocked)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
