"use client";

import { toFa, faDate, tehranToday } from "@/lib/dates";
import { getMascotStage, mascotSvgDataUrl } from "./mascot";
import type { AppStateData } from "./types";

/**
 * ─────────────────────────────────────────────────────────────
 *  کارت اشتراک بدنسازی 🏋️ — پوستر سینمایی 1080×1350 (۴:۵ اینستاگرام)
 *  روی canvas رندر می‌شود: پس‌زمینه تاریک باشگاه + شعله + عدد استریک
 * ─────────────────────────────────────────────────────────────
 */

const W = 1080;
const H = 1350;

/** رنگ‌های برند — بدون آبی/بنفش */
const GOLD = "#FFD54A";
const GOLD_DEEP = "#FF9800";
const WHITE = "#FFFFFF";

/** لود تصویر با تایم‌اوت — شکست = null (پس‌زمینه جایگزین) */
function loadImage(src: string, timeoutMs = 4000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    let done = false;
    const finish = (ok: boolean) => {
      if (!done) {
        done = true;
        resolve(ok ? img : null);
      }
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = src;
    setTimeout(() => finish(false), timeoutMs);
  });
}

/**
 * فونت فارسی برای canvas — فونت اپ (next/font) با document.fonts لود شده؛
 * خانواده واقعی را از computed style بدنه می‌خوانیم و «Vazirmatn» را هم امتحان می‌کنیم.
 */
async function resolveFontFamily(): Promise<string> {
  try {
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.load('900 100px "Vazirmatn"').catch(() => undefined);
      await document.fonts.ready;
    }
  } catch {
    // بی‌خیال فونت — Tahoma جایگزین می‌شود
  }
  let computed = "";
  try {
    computed = typeof document !== "undefined" ? getComputedStyle(document.body).fontFamily : "";
  } catch {
    computed = "";
  }
  if (computed && computed !== "none") return `"Vazirmatn", ${computed}, Tahoma, sans-serif`;
  return `"Vazirmatn", Tahoma, sans-serif`;
}

/** مستطیل گرد — با جایگزین برای مرورگرهای بدون roundRect */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, rad);
  } else {
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
}

/** رسم تصویر به سبک cover (وسط‌چین، بدون کشیدگی) */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(W / iw, H / ih);
  const w = iw * s;
  const h = ih * s;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

/** رسم ماسکوت از data URL — شکست بی‌صدا رد می‌شود */
async function drawMascot(ctx: CanvasRenderingContext2D, stage: number, size: number) {
  const url = mascotSvgDataUrl(stage, "happy");
  const img = await loadImage(url, 3000);
  if (!img) return;
  const w = Math.round(size * (200 / 220));
  ctx.drawImage(img, Math.round((W - w) / 2), 148, w, size);
}

/** یک چیپ آمار گرد با مقدار و برچسب */
function drawChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  font: string
) {
  roundedRect(ctx, x, y, w, h, 26);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,190,80,0.45)";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = `900 44px ${font}`;
  ctx.fillText(value, x + w / 2, y + 56);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `600 27px ${font}`;
  ctx.fillText(label, x + w / 2, y + 94);
}

/**
 * ساخت کارت اشتراک به‌صورت Blob تصویر (JPEG کیفیت ۹۰)
 * همه متن‌ها فارسی و ارقام فارسی — فونت Vazirmatn قبل از رسم لود می‌شود.
 */
export async function generateShareBlob(state: AppStateData): Promise<Blob> {
  if (typeof document === "undefined") throw new Error("کارت اشتراک فقط در مرورگر ساخته می‌شود");

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas پشتیبانی نمی‌شود");

  const font = await resolveFontFamily();

  // ── پس‌زمینه: عکس باشگاه یا گرادیان تاریک جایگزین ──
  const bg = await loadImage("/images/share-bg.png");
  if (bg) {
    drawCover(ctx, bg);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1c0f06");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // ── لایه تیره برای خوانایی متن ──
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0, "rgba(0,0,0,0.55)");
  overlay.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  try {
    (ctx as CanvasRenderingContext2D & { direction: string }).direction = "rtl";
  } catch {
    // مرورگر قدیمی — بی‌اهمیت
  }

  // ── بالای کارت: عنوان طلایی + خط جداکننده ──
  ctx.fillStyle = GOLD;
  ctx.font = `700 34px ${font}`;
  ctx.fillText("چالش ۳۰ روزه شنا", W / 2, 96);
  ctx.strokeStyle = "rgba(255,213,74,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 110, 122);
  ctx.lineTo(W / 2 + 110, 122);
  ctx.stroke();

  // ── ماسکوت شعله (مرحله فعلی استریک) ──
  const mascotStage = getMascotStage(state.currentStreak).stage;
  await drawMascot(ctx, mascotStage, 185);

  // ── عدد بزرگ استریک با گرادیان طلایی ──
  const numY = 600;
  const numGrad = ctx.createLinearGradient(0, numY - 210, 0, numY);
  numGrad.addColorStop(0, "#FFD54A");
  numGrad.addColorStop(1, "#FF9800");
  ctx.fillStyle = numGrad;
  ctx.font = `900 230px ${font}`;
  ctx.fillText(toFa(state.currentStreak), W / 2, numY);

  ctx.fillStyle = WHITE;
  ctx.font = `800 46px ${font}`;
  ctx.fillText("روز استریک 🔥", W / 2, 660);

  // ── نوار پیشرفت طلایی «روز X از ۳۰» ──
  const dayShown = Math.min(state.currentDay, 30);
  ctx.fillStyle = GOLD;
  ctx.font = `700 34px ${font}`;
  ctx.fillText(`روز ${toFa(dayShown)} از ${toFa(30)}`, W / 2, 722);

  const barX = 190;
  const barW = W - barX * 2;
  const barY = 744;
  const barH = 24;
  roundedRect(ctx, barX, barY, barW, barH, 12);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fill();
  const pct = Math.min(1, Math.max(dayShown / 30, dayShown > 0 ? 0.04 : 0));
  if (pct > 0) {
    const fillW = Math.max(barW * pct, 24);
    roundedRect(ctx, barX, barY, fillW, barH, 12);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, "#FFB300");
    barGrad.addColorStop(1, "#FF8F00");
    ctx.fillStyle = barGrad;
    ctx.fill();
  }

  // ── دو چیپ آمار کنار هم (RTL: مجموع شنا سمت راست) ──
  const chipW = 432;
  const chipH = 118;
  const chipY = 812;
  const rightX = W - 96 - chipW;
  const leftX = 96;
  drawChip(ctx, rightX, chipY, chipW, chipH, toFa(state.totalPushups), "مجموع شنا", font);
  drawChip(ctx, leftX, chipY, chipW, chipH, `سطح ${toFa(state.level.level)}`, state.level.title, font);

  // ── شعار ──
  ctx.fillStyle = WHITE;
  ctx.font = `900 52px ${font}`;
  ctx.fillText("قوی‌تر از دیروز 💪", W / 2, 1022);

  // ── برند و تاریخ شمسی ──
  ctx.fillStyle = GOLD;
  ctx.font = `900 40px ${font}`;
  ctx.fillText("پوش‌آپ چلنج", W / 2, 1236);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `500 30px ${font}`;
  ctx.fillText(faDate(tehranToday()), W / 2, 1284);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );
  if (!blob) throw new Error("ساخت تصویر کارت شکست خورد");
  return blob;
}

/** نام فایل کارت — بدون کاراکتر فارسی برای سازگاری اشتراک‌گذاری */
export function shareCardFilename(state: AppStateData): string {
  return `pushup-streak-${state.currentStreak}.jpg`;
}

/** Blob → File آماده navigator.share (به‌همراه نام فایل) */
export async function createShareFile(state: AppStateData): Promise<File> {
  const blob = await generateShareBlob(state);
  return new File([blob], shareCardFilename(state), { type: "image/jpeg" });
}
