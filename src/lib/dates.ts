/** ابزارهای تاریخ — همه چیز بر اساس منطقه زمانی تهران */

const TZ = "Asia/Tehran";

/** تاریخ امروز به فرمت YYYY-MM-DD بر اساس ساعت تهران */
export function tehranToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** دیروز YYYY-MM-DD بر اساس ساعت تهران */
export function tehranYesterday(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** فاصله روز بین دو تاریخ YYYY-MM-DD (b - a) */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00Z").getTime();
  const db = new Date(b + "T12:00:00Z").getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

/** تبدیل ارقام لاتین به فارسی */
export function toFa(input: number | string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  return String(input).replace(/\d/g, (d) => fa[Number(d)]);
}

/** نام روز هفته فارسی برای تاریخ YYYY-MM-DD */
export function faWeekday(dateStr: string): string {
  const names = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
  const d = new Date(dateStr + "T12:00:00Z");
  return names[d.getUTCDay()];
}

/** حرف اول روز هفته (برای نوار هفتگی) */
export function faWeekdayShort(dateStr: string): string {
  const names = ["ی", "د", "س", "چ", "پ", "ج", "ش"];
  const d = new Date(dateStr + "T12:00:00Z");
  return names[d.getUTCDay()];
}

/** تاریخ شمسی خوانا برای تاریخ YYYY-MM-DD */
export function faDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr + "T12:00:00Z"));
  } catch {
    return dateStr;
  }
}

/** ساعت و دقیقه فعلی تهران (۲۴ ساعته) */
export function tehranNowParts(): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const [hour, minute] = parts.split(":").map(Number);
  return { hour, minute };
}

/** n روز اخیر به فرمت YYYY-MM-DD (از قدیمی به جدید، شامل امروز) */
export function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    out.push(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d)
    );
  }
  return out;
}
