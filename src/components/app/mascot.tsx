"use client";

import { useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  ماسکوت شعله — تکامل ۵ مرحله‌ای (جرقه تا آتشین افسانه‌ای)
 *  یک رندرکننده داخلی (markup رشته‌ای) هم برای کامپوننت React
 *  و هم برای سریالایز SVG → data URL (کارت اشتراک) استفاده می‌شود.
 * ─────────────────────────────────────────────────────────────
 */

export type MascotMood = "happy" | "neutral" | "sad";

export interface MascotStageInfo {
  stage: 0 | 1 | 2 | 3 | 4;
  name: string;
  /** استریک لازم برای مرحله بعد (null = آخرین مرحله) */
  nextAt: number | null;
}

const STAGE_NAMES = ["جرقه", "شعله‌چه", "شعله", "شعله‌ور", "آتشین افسانه‌ای"];
/** آستانه استریک برای رسیدن به مرحله ۱ تا ۴ */
const STAGE_THRESHOLDS = [1, 3, 7, 14];

export function getMascotStage(streak: number): MascotStageInfo {
  const stage = (streak < 1 ? 0 : streak < 3 ? 1 : streak < 7 ? 2 : streak < 14 ? 3 : 4) as 0 | 1 | 2 | 3 | 4;
  return {
    stage,
    name: STAGE_NAMES[stage],
    nextAt: stage < 4 ? STAGE_THRESHOLDS[stage] : null,
  };
}

// ── پارامترهای رندر هر مرحله ──
interface StageRender {
  scale: number; // بزرگ‌نمایی شعله داخل viewBox
  tipY: number; // ارتفاع نوک شعله (کمتر = کشیده‌تر)
  lobes: boolean; // لبه‌های کناری (زبانه اضافه)
  spike: boolean; // زبانه پشتی بالا
  embers: boolean; // ذرات اخگر شناور
  crown: boolean; // تاج کوچک
  sparkles: boolean; // ستاره‌های درخشان
}

const STAGE_RENDER: StageRender[] = [
  { scale: 0.58, tipY: 78, lobes: false, spike: false, embers: false, crown: false, sparkles: false },
  { scale: 0.72, tipY: 56, lobes: false, spike: false, embers: false, crown: false, sparkles: false },
  { scale: 0.86, tipY: 36, lobes: true, spike: false, embers: false, crown: false, sparkles: false },
  { scale: 0.96, tipY: 28, lobes: true, spike: true, embers: true, crown: false, sparkles: false },
  { scale: 1.0, tipY: 24, lobes: true, spike: true, embers: true, crown: true, sparkles: true },
];

// ── هندسه شعله (تمام مختصات در viewBox 200×220) ──

/** بدنه اصلی — قطره‌وار با نوک نرم؛ هرچه tipY بیشتر، گردتر (جرقه) */
function flameMainPath(tipY: number): string {
  const c1y = tipY + 30;
  const c2y = Math.min(tipY + 64, 128);
  return (
    `M 100 ${tipY} ` +
    `C 116 ${c1y} 142 ${c2y} 146 130 ` +
    `C 149 172 128 202 100 202 ` +
    `C 72 202 51 172 54 130 ` +
    `C 58 ${c2y} 84 ${c1y} 100 ${tipY} Z`
  );
}

/** شعله داخلی روشن‌تر — فقط برای شعله‌های کشیده */
function flameInnerPath(tipY: number): string {
  const t = Math.min(Math.max(tipY + 54, 80), 126);
  return (
    `M 100 ${t} ` +
    `C 112 ${t + 24} 126 ${t + 46} 128 ${t + 64} ` +
    `C 130 ${t + 88} 116 ${t + 102} 100 ${t + 102} ` +
    `C 84 ${t + 102} 70 ${t + 88} 72 ${t + 64} ` +
    `C 74 ${t + 46} 88 ${t + 24} 100 ${t} Z`
  );
}

/** زبانه راست — شعله‌چه توپُر پشت بدنه (فقط بیرون‌زدگی‌اش دیده می‌شود) */
const LOBE_RIGHT =
  "M 132 42 C 144 56 158 82 162 110 C 165 138 154 158 134 156 " +
  "C 120 154 114 142 117 128 C 120 114 124 92 127 70 C 129 58 130 48 132 42 Z";
/** زبانه چپ (آینه راست) */
const LOBE_LEFT =
  "M 68 42 C 56 56 42 82 38 110 C 35 138 46 158 66 156 " +
  "C 80 154 86 142 83 128 C 80 114 76 92 73 70 C 71 58 70 48 68 42 Z";
/** زبانه پشتی بالای نوک — توپُر تا همیشه به بدنه بچسبد */
const SPIKE_BACK =
  "M 118 28 C 130 38 140 54 145 72 C 148 84 143 92 134 90 " +
  "C 125 88 122 78 124 66 C 126 52 121 38 118 28 Z";

/** چهارپر ستاره‌ای */
function starPath(cx: number, cy: number, r: number): string {
  const s = r * 0.38;
  return (
    `M ${cx} ${cy - r} L ${cx + s} ${cy - s} L ${cx + r} ${cy} L ${cx + s} ${cy + s} ` +
    `L ${cx} ${cy + r} L ${cx - s} ${cy + s} L ${cx - r} ${cy} L ${cx - s} ${cy - s} Z`
  );
}

// ── چهره بر اساس حالت ──
function faceMarkup(stage: number, mood: MascotMood): string {
  // جای چشم‌ها برای مراحل کوچک کمی جمع‌تر
  const young = stage <= 1;
  const lx = young ? 84 : 82;
  const rx = young ? 116 : 118;
  const eyeR = young ? 8.6 : 9.5;

  const blushOpacity = mood === "happy" ? 0.5 : mood === "neutral" ? 0.26 : 0.16;
  const blush =
    `<ellipse cx="${lx - 14}" cy="159" rx="6.4" ry="4" fill="#FF7043" opacity="${blushOpacity}"/>` +
    `<ellipse cx="${rx + 14}" cy="159" rx="6.4" ry="4" fill="#FF7043" opacity="${blushOpacity}"/>`;

  let eyes = "";
  let mouth = "";

  if (mood === "sad") {
    // چشم‌های نیمه‌بسته با پلک افتاده
    eyes =
      `<path d="M ${lx - eyeR} 147 A ${eyeR} 7.5 0 0 0 ${lx + eyeR} 147 Z" fill="#FFFFFF"/>` +
      `<path d="M ${rx - eyeR} 147 A ${eyeR} 7.5 0 0 0 ${rx + eyeR} 147 Z" fill="#FFFFFF"/>` +
      `<circle cx="${lx}" cy="150.8" r="3.4" fill="#4E342E"/>` +
      `<circle cx="${rx}" cy="150.8" r="3.4" fill="#4E342E"/>` +
      `<path d="M ${lx - eyeR - 1.5} 146.6 L ${lx + eyeR + 1.5} 146.6" stroke="#4E342E" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M ${rx - eyeR - 1.5} 146.6 L ${rx + eyeR + 1.5} 146.6" stroke="#4E342E" stroke-width="2.4" stroke-linecap="round"/>`;
    mouth =
      `<path d="M 89 172 Q 100 162.5 111 172" stroke="#4E342E" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  } else if (mood === "happy") {
    // چشم‌های گرد براق + لبخند بزرگ
    eyes =
      `<ellipse cx="${lx}" cy="146" rx="${eyeR}" ry="${eyeR + 1}" fill="#FFFFFF"/>` +
      `<ellipse cx="${rx}" cy="146" rx="${eyeR}" ry="${eyeR + 1}" fill="#FFFFFF"/>` +
      `<circle cx="${lx + 1}" cy="147" r="5" fill="#4E342E"/>` +
      `<circle cx="${rx - 1}" cy="147" r="5" fill="#4E342E"/>` +
      `<circle cx="${lx - 2}" cy="143.4" r="1.9" fill="#FFFFFF"/>` +
      `<circle cx="${rx - 4}" cy="143.4" r="1.9" fill="#FFFFFF"/>` +
      `<circle cx="${lx + 3.4}" cy="150.4" r="1" fill="#FFFFFF" opacity="0.85"/>` +
      `<circle cx="${rx + 1.4}" cy="150.4" r="1" fill="#FFFFFF" opacity="0.85"/>`;
    mouth =
      `<path d="M 85 160 Q 100 177 115 160 Q 100 166.5 85 160 Z" fill="#4E342E"/>`;
  } else {
    // معمولی
    eyes =
      `<ellipse cx="${lx}" cy="146" rx="${eyeR - 0.6}" ry="${eyeR + 0.4}" fill="#FFFFFF"/>` +
      `<ellipse cx="${rx}" cy="146" rx="${eyeR - 0.6}" ry="${eyeR + 0.4}" fill="#FFFFFF"/>` +
      `<circle cx="${lx}" cy="146.4" r="4.3" fill="#4E342E"/>` +
      `<circle cx="${rx}" cy="146.4" r="4.3" fill="#4E342E"/>` +
      `<circle cx="${lx - 1.8}" cy="143.2" r="1.3" fill="#FFFFFF" opacity="0.9"/>` +
      `<circle cx="${rx - 1.8}" cy="143.2" r="1.3" fill="#FFFFFF" opacity="0.9"/>`;
    mouth =
      `<path d="M 90 165 Q 100 172.5 110 165" stroke="#4E342E" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  }

  const tear =
    mood === "sad" && stage === 0
      ? `<path d="M 85 153 q 4.6 7.2 0 10.8 q -4.6 -3.6 0 -10.8 Z" fill="#81D4FA"/>`
      : "";

  return `<g>${blush}${eyes}${mouth}${tear}</g>`;
}

// ── گرادیان‌ها (یک‌بار برای هر SVG) ──
function defsMarkup(): string {
  return (
    `<defs>` +
    // بدنه: کهربایی → نارنجی → قرمز (روشن به تاریک از بالا)
    `<linearGradient id="m-outer" x1="100" y1="24" x2="100" y2="205" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#FFC53D"/><stop offset="42%" stop-color="#FB8C00"/><stop offset="100%" stop-color="#E53935"/>` +
    `</linearGradient>` +
    // زبانه‌های پشتی — کمی تیره‌تر برای عمق
    `<linearGradient id="m-lobes" x1="0" y1="0" x2="0.4" y2="1">` +
    `<stop offset="0%" stop-color="#F4511E"/><stop offset="100%" stop-color="#D84315"/>` +
    `</linearGradient>` +
    // شعله داخلی زرد گرم
    `<linearGradient id="m-inner" x1="100" y1="84" x2="100" y2="198" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0%" stop-color="#FFF59D"/><stop offset="55%" stop-color="#FFE082"/><stop offset="100%" stop-color="#FFB300"/>` +
    `</linearGradient>` +
    // هاله نور پشت
    `<radialGradient id="m-glow" cx="0.5" cy="0.5" r="0.5">` +
    `<stop offset="0%" stop-color="#FFB74D" stop-opacity="0.35"/><stop offset="100%" stop-color="#FFB74D" stop-opacity="0"/>` +
    `</radialGradient>` +
    // تاج طلایی
    `<linearGradient id="m-crown" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="#FFE082"/><stop offset="100%" stop-color="#FFB300"/>` +
    `</linearGradient>` +
    `</defs>`
  );
}

/** انیمیشن CSS اخگرها — فقط در نسخه DOM (نه سریالایز) */
function emberStyle(): string {
  return (
    `<style>` +
    `@media (prefers-reduced-motion: no-preference){` +
    `.m-emb{animation:m-emb 2.3s ease-in-out infinite alternate}` +
    `.m-emb2{animation:m-emb 2.9s ease-in-out .6s infinite alternate}` +
    `.m-emb3{animation:m-emb 2.1s ease-in-out 1.2s infinite alternate}` +
    `}` +
    `@keyframes m-emb{from{opacity:.35;transform:translateY(3px)}to{opacity:.95;transform:translateY(-5px)}}` +
    `</style>`
  );
}

/**
 * بدنه کامل ماسکوت (همه‌چیز جز چهره) — گروه مقیاس‌پذیر بر اساس مرحله
 * لنگر مقیاس نقطه (100,168) است تا شعله‌های کوچک پایین بمانند.
 */
function bodyMarkup(stage: number, animated: boolean): string {
  const cfg = STAGE_RENDER[Math.min(Math.max(stage, 0), 4)];
  const s = cfg.scale;
  const tx = 100 * (1 - s);
  const ty = 168 * (1 - s);
  const young = cfg.tipY >= 56;

  const inner = young
    ? `<ellipse cx="100" cy="158" rx="30" ry="30" fill="url(#m-inner)"/>`
    : `<path d="${flameInnerPath(cfg.tipY)}" fill="url(#m-inner)"/>`;

  const lobes = cfg.lobes
    ? `<path d="${LOBE_RIGHT}" fill="url(#m-lobes)"/><path d="${LOBE_LEFT}" fill="url(#m-lobes)"/>`
    : "";
  const spike = cfg.spike ? `<path d="${SPIKE_BACK}" fill="url(#m-lobes)"/>` : "";

  const crown = cfg.crown
    ? `<g>` +
      `<path d="M 87 28 L 89.5 13 L 95.5 19.5 L 100 9 L 104.5 19.5 L 110.5 13 L 113 28 Z" fill="url(#m-crown)"/>` +
      `<circle cx="100" cy="12" r="1.7" fill="#FF7043"/>` +
      `<rect x="86.5" y="24.5" width="27" height="4.8" rx="2.4" fill="#FFB300"/>` +
      `</g>`
    : "";

  const embers = cfg.embers
    ? `<g>${animated ? emberStyle() : ""}` +
      `<circle class="m-emb" cx="36" cy="76" r="4" fill="#FFB74D"/>` +
      `<circle class="m-emb2" cx="166" cy="60" r="3" fill="#FFCC80"/>` +
      `<circle class="m-emb3" cx="30" cy="130" r="2.6" fill="#FF8A65"/>` +
      `<circle class="m-emb2" cx="172" cy="122" r="2.4" fill="#FFB74D"/>` +
      `</g>`
    : "";

  const sparkles = cfg.sparkles
    ? `<g fill="#FDD835">` +
      `<path d="${starPath(34, 40, 7)}"/>` +
      `<path d="${starPath(170, 84, 5)}" opacity="0.85"/>` +
      `<path d="${starPath(46, 176, 4)}" opacity="0.7"/>` +
      `</g>`
    : "";

  const glow = `<circle cx="100" cy="122" r="92" fill="url(#m-glow)"/>`;

  return (
    defsMarkup() +
    glow +
    embers +
    sparkles +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s})">` +
    lobes +
    spike +
    `<path d="${flameMainPath(cfg.tipY)}" fill="url(#m-outer)"/>` +
    inner +
    `<ellipse cx="100" cy="181" rx="22" ry="11" fill="#FFFDE7" opacity="0.6"/>` +
    crown +
    `</g>`
  );
}

// ── کامپوننت React ──

interface MascotProps {
  stage: number;
  mood: MascotMood;
  className?: string;
}

/** ماسکوت شعله با شنای ملایم و سوسوی نوک — احترام به prefers-reduced-motion */
export function Mascot({ stage, mood, className }: MascotProps) {
  const reduced = useReducedMotion();
  const st = Math.min(Math.max(stage, 0), 4);
  const body = useMemo(() => bodyMarkup(st, true), [st]);
  const face = useMemo(() => faceMarkup(st, mood), [st, mood]);

  return (
    <motion.div
      className={`relative ${className ?? ""}`}
      animate={reduced ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* بدنه با سوسوی عمودی نرم */}
      <motion.div
        className="size-full"
        style={{ transformOrigin: "50% 92%" }}
        animate={reduced ? undefined : { scaleY: [1, 1.035, 1] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 220" className="size-full" role="img" aria-label={`شعله — مرحله ${STAGE_NAMES[st]}`}>
          <g dangerouslySetInnerHTML={{ __html: body }} />
        </svg>
      </motion.div>
      {/* چهره — لایه جدا برای ترنزیشن حالت */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.svg
            key={mood}
            viewBox="0 0 200 220"
            className="size-full"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.75 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.75 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          >
            <g dangerouslySetInnerHTML={{ __html: face }} />
          </motion.svg>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── سریالایز برای کارت اشتراک (canvas) ──

/**
 * SVG مستقل ماسکوت به شکل data URL — برای draw روی canvas کارت اشتراک.
 * ابعاد ثابت روی ریشه SVG برای رستر صحیح در همه مرورگرها.
 */
export function mascotSvgDataUrl(stage: number, mood: MascotMood): string {
  const st = Math.min(Math.max(stage, 0), 4);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="400" height="440">` +
    bodyMarkup(st, false) +
    faceMarkup(st, mood) +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
