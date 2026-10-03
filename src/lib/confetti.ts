"use client";

import confetti from "canvas-confetti";

const COLORS = ["#F97316", "#FBBF24", "#34D399", "#FDE047", "#FB923C", "#F4511E"];

/** جشن کاغذرنگی سبک دولینگو */
export function fireCelebration() {
  const defaults: confetti.Options = {
    colors: COLORS,
    zIndex: 9999,
    disableForReducedMotion: true,
  };
  confetti({
    ...defaults,
    particleCount: 90,
    spread: 80,
    startVelocity: 42,
    origin: { y: 0.7 },
  });
  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 55,
      spread: 120,
      startVelocity: 35,
      origin: { x: 0.15, y: 0.65 },
      angle: 60,
    });
  }, 220);
  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 55,
      spread: 120,
      startVelocity: 35,
      origin: { x: 0.85, y: 0.65 },
      angle: 120,
    });
  }, 420);
}

/** جشن بزرگ برای تکمیل چالش / سطح جدید */
export function fireBigCelebration() {
  const defaults: confetti.Options = {
    colors: COLORS,
    zIndex: 9999,
    disableForReducedMotion: true,
  };
  confetti({
    ...defaults,
    particleCount: 160,
    spread: 100,
    startVelocity: 50,
    origin: { y: 0.6 },
  });
  window.setTimeout(() => confetti({ ...defaults, particleCount: 120, spread: 160, origin: { y: 0.5 } }), 350);
  window.setTimeout(() => confetti({ ...defaults, particleCount: 100, spread: 120, origin: { y: 0.55 } }), 700);
}
