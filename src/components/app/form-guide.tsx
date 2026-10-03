"use client";

import { useState } from "react";
import { BookOpen, Check, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** راهنمای فرم صحیح شنا سوئدی — بر پایه راهنمای NASM و تحقیقات انجام‌شده */
export function FormGuide() {
  const [open, setOpen] = useState(false);

  const principles = [
    {
      title: "بدن یک خط صاف",
      desc: "از سر تا پاشنه باید یک خط مستقیم باشه؛ شکم و باسن رو کل تمرین منقبض نگه دار.",
    },
    {
      title: "جای دست و آرنج",
      desc: "کف دست‌ها کمی بازتر از عرض شانه؛ آرنج‌ها با زاویه ۴۵ درجه نسبت به بدن، نه چسبیده نه کاملاً باز.",
    },
    {
      title: "نفس کشیدن درست",
      desc: "وقتی پایین می‌ری نفس بگیر و وقتی بالا میای آرام بیرون بده؛ هیچ‌وقت نفست رو نگه ندار.",
    },
    {
      title: "دامنه کامل با کنترل",
      desc: "سینه رو نزدیک زمین ببر و بالا آرنج رو تقریباً صاف کن؛ سرعت مهم نیست، کیفیت مهمه.",
    },
  ];

  const mistakes = [
    "شکم و کمر افتاده به سمت زمین (گود کمر)",
    "سر رو بالا نگه داشتن یا گردن خم شده",
    "نصفه پایین رفتن — دامنه ناقص",
    "پرش سریع بدون کنترل برای ثبت عدد بیشتر",
  ];

  return (
    <section aria-label="راهنمای فرم صحیح" className="overflow-hidden rounded-3xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-right transition-colors hover:bg-muted/40"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <BookOpen className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-extrabold">راهنمای فرم صحیح شنا</p>
            <p className="text-[10px] font-medium text-muted-foreground">
              ۴ اصل طلایی + اشتباهات رایج — بر پایه استاندارد NASM
            </p>
          </div>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="border-t border-border px-4 pb-4 pt-3">
              <p className="mb-2.5 text-[11px] font-black text-orange-600 dark:text-orange-400">
                ۴ اصل طلایی
              </p>
              <ul className="space-y-2.5">
                {principles.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                      <Check className="size-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </span>
                    <div className="leading-relaxed">
                      <span className="text-[12px] font-extrabold">{p.title}: </span>
                      <span className="text-[11.5px] font-medium text-muted-foreground">{p.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mb-2.5 mt-4 text-[11px] font-black text-rose-500 dark:text-rose-400">
                اشتباهات رایج — اینا رو نکن!
              </p>
              <ul className="space-y-2">
                {mistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
                      <X className="size-3 text-rose-500 dark:text-rose-400" strokeWidth={3} />
                    </span>
                    <span className="text-[11.5px] font-medium leading-relaxed text-muted-foreground">
                      {m}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-2xl bg-muted/60 px-3.5 py-2.5 text-[10.5px] font-medium leading-relaxed text-muted-foreground">
                منبع: راهنمای فرم NASM و برنامه‌های پیشرفت تدریجی — اگر درد مفصلی داری،
                قبل از ادامه با متخصص مشورت کن.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
