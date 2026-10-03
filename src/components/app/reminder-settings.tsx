"use client";

import { useEffect, useState } from "react";
import { BellRing, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  loadReminderSettings,
  saveReminderSettings,
  enableReminders,
  disableReminders,
  fireTestNotification,
  getPlatform,
} from "@/lib/notifications";
import { toFa } from "@/lib/dates";

const TIME_OPTIONS = [
  { value: "08:00", label: "۰۸:۰۰ — صبح" },
  { value: "12:00", label: "۱۲:۰۰ — ظهر" },
  { value: "16:00", label: "۱۶:۰۰ — عصر" },
  { value: "18:00", label: "۱۸:۰۰ — غروب" },
  { value: "20:00", label: "۲۰:۰۰ — شب" },
  { value: "22:00", label: "۲۲:۰۰ — آخر شب" },
];

export function ReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("20:00");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [platform, setPlatform] = useState<"native" | "web">("web");

  useEffect(() => {
    const s = loadReminderSettings();
    setEnabled(s.enabled);
    setTime(s.time);
    setPlatform(getPlatform());
  }, []);

  const handleToggle = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) {
        const res = await enableReminders(time);
        if (res.ok) {
          setEnabled(true);
          toast.success(
            platform === "native"
              ? `یادآوری هر روز ساعت ${toFa(time)} با صدا فعال شد! ⏰`
              : `نوتیف مرورگر فعال شد — هر روز ساعت ${toFa(time)} یادت می‌ندازیم! ⏰`
          );
        } else if (res.reason === "permission_denied") {
          toast.error("مجوز نوتیفیکیشن داده نشد — از تنظیمات مرورگر/اپ فعالش کن", {
            duration: 5000,
          });
        } else {
          toast.error("نوتیفیکیشن در این دستگاه پشتیبانی نمی‌شه");
        }
      } else {
        await disableReminders();
        setEnabled(false);
        toast.info("یادآوری روزانه خاموش شد");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleTimeChange = async (next: string) => {
    setTime(next);
    saveReminderSettings({ enabled, time: next });
    if (enabled) {
      setBusy(true);
      try {
        // زمان‌بندی دوباره با ساعت جدید
        const res = await enableReminders(next);
        if (res.ok) {
          toast.success(`یادآوری روی ساعت ${toFa(next)} تنظیم شد ⏰`);
        }
      } finally {
        setBusy(false);
      }
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // اگر هنوز فعال نیست، اول مجوز بگیر
      if (!enabled) {
        const res = await enableReminders(time);
        if (!res.ok) {
          toast.error("اول مجوز نوتیفیکیشن رو تأیید کن");
          return;
        }
        setEnabled(true);
      }
      const ok = await fireTestNotification();
      if (ok) {
        toast.success("نوتیف آزمایشی ارسال شد — ببین گوشیت! 🔔");
      } else {
        toast.error("ارسال نوتیف آزمایشی نشد");
      }
    } finally {
      setTesting(false);
    }
  };

  const timeLabel = TIME_OPTIONS.find((t) => t.value === time)?.label ?? toFa(time);

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-orange-100 to-amber-50 dark:from-orange-950/60 dark:to-amber-950/40">
            <BellRing
              className={`size-4.5 text-orange-600 dark:text-orange-400 ${enabled ? "animate-flame" : ""}`}
            />
          </div>
          <div>
            <p className="text-[12.5px] font-extrabold">یادآوری روزانه</p>
            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
              {enabled
                ? `هر روز ساعت ${timeLabel.split(" — ")[0]} با صدا یادت می‌ندازیم`
                : "استریکت نبسه! یادت بندازیم بیای شنا بزنی"}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={busy}
          aria-label="یادآوری روزانه"
        />
      </div>

      {enabled && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11.5px] font-bold text-muted-foreground">ساعت یادآوری</p>
            <Select value={time} onValueChange={handleTimeChange}>
              <SelectTrigger size="sm" className="w-40 rounded-xl text-[12px] font-extrabold">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-[12px] font-bold">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[9.5px] font-medium text-muted-foreground/70">
            {platform === "native" ? (
              <>
                <CheckCircle2 className="size-3 text-emerald-500" />
                نوتیف بومی اندروید — حتی وقتی اپ بسته است اجرا می‌شود
              </>
            ) : (
              <>
                <XCircle className="size-3 text-muted-foreground/50" />
                برای نوتیف وقتی اپ باز نیست، اپ رو با «افزودن به صفحه اصلی» نصب کن
              </>
            )}
          </p>
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleTest}
        disabled={testing || busy}
        className="mt-3 w-full gap-2 rounded-xl text-[11.5px] font-extrabold active:scale-[0.98]"
      >
        {testing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Send className="size-3.5" />
        )}
        ارسال نوتیف آزمایشی
      </Button>
    </div>
  );
}
