"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Camera,
  Loader2,
  Minus,
  Scale,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { faDate, tehranToday, toFa } from "@/lib/dates";
import { getPlatform } from "@/lib/notifications";
import { localBody } from "@/lib/offline-state";
import type { BodyData, BodyPhotoItem } from "./types";

type PhotoSlotId = "before" | "after";

const EMPTY_BODY: BodyData = {
  weights: [],
  photos: { before: null, after: null },
};

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** ارقام فارسی/عربی → لاتین + ممیز فارسی → نقطه */
function toEnDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[٫,]/g, ".");
}

/** عدد → رشته فارسی با ممیز «٫» (صفرهای انتهای اعشار حذف می‌شود) */
function faKg(kg: number, decimals = 1): string {
  let s = kg.toFixed(decimals);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return toFa(s.replace(".", "٫"));
}

/** «۱۵ تیر» — برچسب کوتاه نمودار */
function faDateShort(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr + "T12:00:00Z"));
  } catch {
    return dateStr;
  }
}

/** فشرده‌سازی عکس سمت کلاینت: حداکثر ۷۲۰px و JPEG با کیفیت ۰٫۷۵ */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("خواندن عکس ناموفق بود"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("عکس نامعتبر است"));
      img.onload = () => {
        try {
          const maxSide = 720;
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("پردازش عکس ناموفق بود"));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        } catch {
          reject(new Error("پردازش عکس ناموفق بود"));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** کارت «وزن و عکس پیشرفت» — دیتای خودش را جدا می‌گیرد (وب یا APK آفلاین) */
export function BodyLogCard() {
  const [data, setData] = useState<BodyData | null>(null);
  const [loading, setLoading] = useState(true);

  // دیالوگ وزن
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [weightSaving, setWeightSaving] = useState(false);

  // عکس‌ها
  const [photoBusy, setPhotoBusy] = useState<PhotoSlotId | null>(null);
  const [deleteSlot, setDeleteSlot] = useState<PhotoSlotId | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      if (getPlatform() === "native") {
        // APK آفلاین: localStorage
        setData(localBody.get());
      } else {
        const res = await fetch("/api/body");
        const json = (await res.json().catch(() => ({}))) as BodyData & {
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "دریافت اطلاعات ناموفق بود");
        setData({
          weights: json.weights ?? [],
          photos: {
            before: json.photos?.before ?? null,
            after: json.photos?.after ?? null,
          },
        });
      }
    } catch {
      setData(EMPTY_BODY);
      toast.error("دریافت وزن و عکس‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openWeightDialog = () => {
    const weights = data?.weights ?? [];
    const today = tehranToday();
    const current = weights.find((w) => w.date === today) ?? weights.at(-1);
    setWeightInput(current ? String(current.kg) : "");
    setWeightOpen(true);
  };

  const saveWeight = async () => {
    const kg = parseFloat(toEnDigits(weightInput).trim());
    if (!Number.isFinite(kg)) {
      toast.error("وزن را وارد کن");
      return;
    }
    if (kg < 20 || kg > 400) {
      toast.error("وزن باید بین ۲۰ تا ۴۰۰ کیلوگرم باشد");
      return;
    }
    setWeightSaving(true);
    try {
      if (getPlatform() === "native") {
        // APK آفلاین: localStorage → { weights }
        const { weights } = localBody.saveWeight(kg);
        setData((d) => ({ ...(d ?? EMPTY_BODY), weights }));
      } else {
        const res = await fetch("/api/body/weight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kg }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(json.error ?? "ثبت وزن ناموفق بود");
        await load();
      }
      toast.success("وزن امروز ثبت شد 💪");
      setWeightOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ثبت وزن ناموفق بود");
    } finally {
      setWeightSaving(false);
    }
  };

  const handlePhoto = async (slot: PhotoSlotId, file: File) => {
    setPhotoBusy(slot);
    try {
      const image = await compressImage(file);
      if (getPlatform() === "native") {
        // APK آفلاین: localStorage → { photos }
        const { photos } = localBody.savePhoto(slot, image);
        setData((d) => ({ ...(d ?? EMPTY_BODY), photos }));
      } else {
        const res = await fetch("/api/body/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot, image }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(json.error ?? "ذخیره عکس ناموفق بود");
        await load();
      }
      toast.success("عکس ذخیره شد 📸");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره عکس ناموفق بود");
    } finally {
      setPhotoBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteSlot) return;
    setDeleteBusy(true);
    try {
      if (getPlatform() === "native") {
        const { photos } = localBody.deletePhoto(deleteSlot);
        setData((d) => ({ ...(d ?? EMPTY_BODY), photos }));
      } else {
        const res = await fetch(`/api/body/photo?slot=${deleteSlot}`, {
          method: "DELETE",
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(json.error ?? "پاک کردن عکس ناموفق بود");
        await load();
      }
      toast.success("عکس پاک شد");
      setDeleteSlot(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "پاک کردن عکس ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  };

  // ── مشتق‌ها ──
  const weights = data?.weights ?? [];
  const latest = weights.length > 0 ? weights[weights.length - 1] : null;
  const first = weights.length > 0 ? weights[0] : null;
  const delta =
    latest && first && weights.length > 1 ? latest.kg - first.kg : null;
  const chartData = weights.map((w) => ({
    date: w.date,
    kg: w.kg,
    label: faDateShort(w.date),
  }));

  return (
    <section
      aria-label="وزن و عکس پیشرفت"
      className="rounded-3xl border border-border bg-card p-5"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold">وزن و عکس پیشرفت</h2>
      </div>

      {!data ? (
        /* اسکلتون هنگام لود */
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-[120px] w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
            <Skeleton className="aspect-[3/4] rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {/* ── وزن ── */}
          <div className="flex items-end justify-between px-1">
            {latest ? (
              <div>
                <p className="text-3xl font-black tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
                  {faKg(latest.kg)}
                  <span className="mr-1.5 text-xs font-bold text-muted-foreground">
                    کیلوگرم
                  </span>
                </p>
                <p className="mt-1.5 text-[10px] font-bold text-muted-foreground">
                  آخرین ثبت: {faDate(latest.date)}
                </p>
              </div>
            ) : (
              <p className="py-2 text-[11.5px] font-bold text-muted-foreground">
                هنوز وزنی ثبت نکردی — اولین وزنت رو ثبت کن!
              </p>
            )}

            {delta !== null && (
              <DeltaChip delta={delta} />
            )}
          </div>

          {/* نمودار وزن (وقتی حداقل ۲ ثبت باشد) */}
          {chartData.length >= 2 ? (
            <div className="mt-3 h-[120px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      fill: "var(--muted-foreground)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    width={32}
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 9.5, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => toFa(Math.round(v))}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)" }}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "var(--font-vazir)",
                      direction: "rtl",
                    }}
                    formatter={(value: number | string) => [
                      `${faKg(Number(value))} کیلوگرم`,
                      "وزن",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="kg"
                    stroke="var(--chart-2)"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: "var(--chart-2)", strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            latest && (
              <p className="mt-2 px-1 text-[10px] font-bold text-muted-foreground">
                با ثبت وزن روزهای بعدی، نمودار پیشرفتت اینجا ساخته می‌شه 📈
              </p>
            )
          )}

          <button
            onClick={openWeightDialog}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 py-3 text-[13px] font-black text-white shadow-lg shadow-emerald-500/25 transition-transform active:scale-[0.98]"
          >
            <Scale className="size-4" />
            ثبت وزن امروز
          </button>

          {/* ── عکس پیشرفت ── */}
          <div className="mt-5 border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-3">
              <PhotoSlot
                slot="before"
                label="عکس قبل"
                photo={data.photos.before}
                busy={photoBusy === "before"}
                onFile={(slot, file) => void handlePhoto(slot, file)}
                onRequestDelete={setDeleteSlot}
              />
              <PhotoSlot
                slot="after"
                label="عکس بعد"
                photo={data.photos.after}
                busy={photoBusy === "after"}
                onFile={(slot, file) => void handlePhoto(slot, file)}
                onRequestDelete={setDeleteSlot}
              />
            </div>
            <p className="mt-2.5 text-center text-[9.5px] font-bold text-muted-foreground">
              عکس‌ها فقط رو دستگاه خودت ذخیره می‌شه 🔒
            </p>
          </div>
        </>
      )}

      {/* دیالوگ ثبت وزن */}
      <Dialog open={weightOpen} onOpenChange={setWeightOpen}>
        <DialogContent className="max-w-[320px] rounded-[28px] p-5" dir="rtl">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-base">ثبت وزن امروز</DialogTitle>
            <DialogDescription className="text-[11.5px] leading-relaxed">
              ثبت جدید برای امروز، قبلی رو جایگزین می‌کنه.
            </DialogDescription>
          </DialogHeader>
          <div className="relative" dir="ltr">
            <input
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveWeight();
              }}
              inputMode="decimal"
              placeholder="مثلاً ۷۲٫۵"
              aria-label="وزن به کیلوگرم"
              className="h-14 w-full rounded-2xl border border-border bg-muted/50 text-center text-2xl font-black tabular-nums outline-none ring-emerald-400 transition-shadow focus-visible:ring-2"
            />
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[11px] font-bold text-muted-foreground">
              کیلوگرم
            </span>
          </div>
          <p className="text-center text-[9.5px] font-bold text-muted-foreground">
            مجاز: {toFa(20)} تا {toFa(400)} کیلوگرم
          </p>
          <button
            onClick={() => void saveWeight()}
            disabled={weightSaving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 py-3.5 text-[14px] font-black text-white shadow-lg shadow-emerald-500/25 transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {weightSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            ثبت وزن
          </button>
        </DialogContent>
      </Dialog>

      {/* تایید پاک کردن عکس */}
      <AlertDialog
        open={deleteSlot !== null}
        onOpenChange={(v) => {
          if (!v) setDeleteSlot(null);
        }}
      >
        <AlertDialogContent className="max-w-[320px] rounded-[24px]" dir="rtl">
          <AlertDialogHeader className="items-center text-center">
            <AlertDialogTitle>این عکس پاک بشه؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عکس برای همیشه پاک می‌شه و برگشتی در کار نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteBusy}
              className="rounded-2xl"
            >
              بی‌خیال
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              disabled={deleteBusy}
              className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleteBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              پاک کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/** چیپ تغییر وزن نسبت به اولین ثبت (کاهش سبز / افزایش رز) */
function DeltaChip({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.05) {
    return (
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-extrabold text-muted-foreground">
        <Minus className="size-3" />
        بدون تغییر
      </span>
    );
  }
  const loss = delta < 0;
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${
        loss
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      }`}
    >
      {loss ? (
        <TrendingDown className="size-3" />
      ) : (
        <TrendingUp className="size-3" />
      )}
      <span dir="ltr" className="tabular-nums">
        {loss ? "−" : "+"}
        {faKg(Math.abs(delta))}
      </span>
      کیلو
    </span>
  );
}

/** اسلات عکس قبل/بعد — آپلود فشرده‌شده یا نمایش عکس فعلی با پاک کردن */
function PhotoSlot({
  slot,
  label,
  photo,
  busy,
  onFile,
  onRequestDelete,
}: {
  slot: PhotoSlotId;
  label: string;
  photo: BodyPhotoItem | null;
  busy: boolean;
  onFile: (slot: PhotoSlotId, file: File) => void;
  onRequestDelete: (slot: PhotoSlotId) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative aspect-[3/4]">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(slot, file);
          e.target.value = "";
        }}
      />
      {photo ? (
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-sm">
          <img
            src={photo.image}
            alt={`عکس ${label}`}
            className="absolute inset-0 size-full object-cover"
          />
          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
            {faDate(photo.date)}
          </span>
          <button
            onClick={() => onRequestDelete(slot)}
            aria-label={`پاک کردن ${label}`}
            className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-all hover:bg-black/75 active:scale-95"
          >
            <X className="size-3.5" strokeWidth={3} />
          </button>
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Camera className="size-6" />
          )}
          <span className="text-[11.5px] font-extrabold">{label}</span>
          <span className="text-[9px] font-bold opacity-70">انتخاب عکس</span>
        </button>
      )}
    </div>
  );
}
