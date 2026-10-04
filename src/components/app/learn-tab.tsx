"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Flame,
  GraduationCap,
  Info,
  Layers,
  ListChecks,
  Repeat,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TriangleAlert,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toFa } from "@/lib/dates";
import {
  ANATOMY_IMAGE,
  GOLDEN_RULE,
  LEARN_CLOSING,
  LEARN_HERO,
  LEARN_MISTAKES,
  LEARN_MUSCLES,
  LEARN_STEPS,
  LEARN_TERMS,
  LEARN_VARIATIONS,
  PLAN_EXAMPLE,
  SET_DIAGRAM,
  VARIATIONS_NOTE,
} from "@/lib/learn-content";

/* ── پالت بخش‌ها — بدون آبی/بنفشِ یاسی؛ نارنجی اصلی، تیل/بنفش مکمل ── */

const SECTION_TONES = {
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
  violet:
    "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
} as const;

type Tone = keyof typeof SECTION_TONES;

const LEARN_SECTIONS: {
  id: "terms" | "muscles" | "form" | "mistakes" | "variations";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: Tone;
}[] = [
  {
    id: "terms",
    title: "اصطلاحات پایه",
    subtitle: "لغات فیتنس رو یاد بگیر",
    icon: BookOpen,
    tone: "amber",
  },
  {
    id: "muscles",
    title: "عضله‌های درگیر",
    subtitle: "کی واقعاً داره کار می‌کنه؟",
    icon: Dumbbell,
    tone: "teal",
  },
  {
    id: "form",
    title: "فرم صحیح گام‌به‌گام",
    subtitle: "۳ گام تا شنای تمیز",
    icon: ListChecks,
    tone: "emerald",
  },
  {
    id: "mistakes",
    title: "اشتباهات رایج",
    subtitle: "اینا رو نکن!",
    icon: TriangleAlert,
    tone: "rose",
  },
  {
    id: "variations",
    title: "انواع شنا",
    subtitle: "۵ نسخه برای هر سطح",
    icon: Layers,
    tone: "violet",
  },
];

const TERM_ICONS: Record<LearnTermId, LucideIcon> = {
  rep: Repeat,
  set: Layers,
  rest: Timer,
};

const TERM_TONES: Record<LearnTermId, Tone> = {
  rep: "orange",
  set: "teal",
  rest: "violet",
};

const MUSCLE_ICONS: Record<LearnMuscleId, LucideIcon> = {
  chest: Star,
  triceps: Zap,
  shoulders: Shield,
  core: Anchor,
};

type LearnTermId = (typeof LEARN_TERMS)[number]["id"];
type LearnMuscleId = (typeof LEARN_MUSCLES)[number]["id"];

/** سایز استاندارد تصاویر تولیدشده (۴:۳) — object-cover کراپ رو مدیریت می‌کنه */
const IMG_SIZES = "(max-width: 448px) 92vw, 416px";

/* ═══════════════════════════════ تب یادگیری ═══════════════════════════════ */

export function LearnTab() {
  // بخش اول به‌صورت پیش‌فرض باز است (الگوی درس دولینگو)
  const [open, setOpen] = useState<Set<string>>(
    () => new Set([LEARN_SECTIONS[0].id])
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <LearnHero />

      {LEARN_SECTIONS.map((meta, i) => (
        <LearnSection
          key={meta.id}
          meta={meta}
          index={i}
          open={open.has(meta.id)}
          onToggle={() => toggle(meta.id)}
        >
          {meta.id === "terms" && <TermsContent />}
          {meta.id === "muscles" && <MusclesContent />}
          {meta.id === "form" && <FormContent />}
          {meta.id === "mistakes" && <MistakesContent />}
          {meta.id === "variations" && <VariationsContent />}
        </LearnSection>
      ))}

      <ClosingCard />
    </div>
  );
}

/* ── کارت خوش‌آمد (گرادیان نارنجی هم‌سبک با کارت امروز) ─────────── */

function LearnHero() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      aria-label="آکادمی شنا"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 shadow-xl shadow-orange-500/20"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-14 -right-8 size-48 rounded-full bg-white/10" />

      <div className="relative px-5 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex size-12 -rotate-6 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
            <GraduationCap className="size-7" />
          </span>
          <div className="leading-tight">
            <h1 className="text-xl font-black">{LEARN_HERO.title}</h1>
            <p className="mt-1 text-[11.5px] font-bold text-white/90">
              {LEARN_HERO.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {LEARN_HERO.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold backdrop-blur-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ── آکوردئون بخش‌ها — هم‌الگو با form-guide.tsx ────────────────── */

function LearnSection({
  meta,
  index,
  open,
  onToggle,
  children,
}: {
  meta: (typeof LEARN_SECTIONS)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const Icon = meta.icon;
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3, ease: "easeOut" }}
      aria-labelledby={`learn-${meta.id}-title`}
      className="overflow-hidden rounded-3xl border border-border bg-card"
    >
      <h2 id={`learn-${meta.id}-title`} className="sr-only">
        {meta.title}
      </h2>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`learn-${meta.id}-panel`}
        className="flex w-full items-center justify-between gap-3 p-4 text-right transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-2xl",
              SECTION_TONES[meta.tone]
            )}
          >
            <Icon className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[13.5px] font-extrabold">
              {meta.title}
            </span>
            <span className="mt-0.5 block text-[10.5px] font-medium text-muted-foreground">
              {meta.subtitle}
            </span>
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`learn-${meta.id}-panel`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-border px-4 pb-4 pt-3.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* ── درس ۱: اصطلاحات پایه ──────────────────────────────────────── */

function TermsContent() {
  return (
    <div>
      <ul className="space-y-3">
        {LEARN_TERMS.map((t) => {
          const Icon = TERM_ICONS[t.id];
          return (
            <li key={t.id} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
                  SECTION_TONES[TERM_TONES[t.id]]
                )}
              >
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-[12px] font-extrabold">
                  {t.term}{" "}
                  <span className="text-[9.5px] font-bold text-muted-foreground">
                    ({t.latin})
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-muted-foreground">
                  {t.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* نمودار دیداری «۲ ست ۱۰تایی» */}
      <SetsDiagram />

      {/* اتصال به برنامه واقعی کاربر */}
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-orange-200/70 bg-orange-50/60 px-3.5 py-2.5 dark:border-orange-900/50 dark:bg-orange-950/30">
        <Dumbbell className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-400" />
        <p className="text-[11px] font-bold leading-relaxed text-orange-800 dark:text-orange-300">
          {PLAN_EXAMPLE}
        </p>
      </div>
    </div>
  );
}

function SetsDiagram() {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-3.5">
      <h3 className="text-[12px] font-extrabold">{SET_DIAGRAM.title}</h3>

      {[1, 2].map((setNo) => (
        <div key={setNo} className={setNo === 2 ? "mt-3" : "mt-2.5"}>
          <p className="mb-1.5 text-[10px] font-black text-orange-600 dark:text-orange-400">
            ست {toFa(setNo)}
          </p>
          <div className="flex items-center justify-between">
            {Array.from({ length: SET_DIAGRAM.perSet }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="size-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/30 dark:bg-orange-400"
              />
            ))}
          </div>
          {/* شکاف استراحت فقط بین دو ست */}
          {setNo === 1 && (
            <div className="my-2.5 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-300 bg-teal-50 px-3 py-1.5 dark:border-teal-800 dark:bg-teal-950/40">
              <Clock className="size-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400">
                {SET_DIAGRAM.restLabel}
              </span>
            </div>
          )}
        </div>
      ))}

      <p className="mt-3 text-[10.5px] font-medium leading-relaxed text-muted-foreground">
        {SET_DIAGRAM.caption}
      </p>
    </div>
  );
}

/* ── درس ۲: عضله‌های درگیر ─────────────────────────────────────── */

function MusclesContent() {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
        <Image
          src={ANATOMY_IMAGE.src}
          alt={ANATOMY_IMAGE.alt}
          width={1152}
          height={864}
          loading="lazy"
          className="h-auto w-full"
        />
      </div>
      <p className="mt-1.5 text-center text-[9.5px] font-bold text-muted-foreground">
        {ANATOMY_IMAGE.caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {LEARN_MUSCLES.map((m) => {
          const Icon = MUSCLE_ICONS[m.id];
          return (
            <div
              key={m.id}
              className="rounded-2xl border border-border bg-muted/30 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-xl",
                    SECTION_TONES[m.tone]
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <p className="text-[11px] font-extrabold leading-tight">
                  {m.name}
                  {m.star && (
                    <Star
                      aria-label="ستاره اصلی"
                      className="ms-1 inline size-3 fill-amber-400 text-amber-400"
                    />
                  )}
                </p>
              </div>
              <p className="mt-1 text-[9px] font-bold text-muted-foreground/80">
                {m.latin}
              </p>
              <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-muted-foreground">
                {m.role}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── درس ۳: فرم صحیح گام‌به‌گام ────────────────────────────────── */

function FormContent() {
  return (
    <div>
      <ol className="space-y-3">
        {LEARN_STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border/70 bg-muted/30 p-3"
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[12px] font-black text-white shadow-md shadow-orange-500/30">
                {toFa(i + 1)}
              </span>
              <h3 className="text-[12.5px] font-extrabold">{step.title}</h3>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={step.image}
                alt={step.imageAlt}
                fill
                sizes={IMG_SIZES}
                loading="lazy"
                className="object-cover"
              />
            </div>
            <p className="mt-2.5 text-[11px] font-medium leading-relaxed text-muted-foreground">
              {step.desc}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-[11.5px] font-bold leading-relaxed text-emerald-800 dark:text-emerald-300">
          {GOLDEN_RULE}
        </p>
      </div>
    </div>
  );
}

/* ── درس ۴: اشتباهات رایج ──────────────────────────────────────── */

function MistakesContent() {
  return (
    <div className="space-y-3">
      {LEARN_MISTAKES.map((m) => (
        <article
          key={m.title}
          className="overflow-hidden rounded-2xl border border-rose-200/70 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20"
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={m.image}
              alt={m.imageAlt}
              fill
              sizes={IMG_SIZES}
              loading="lazy"
              className="object-cover"
            />
            <span
              aria-hidden
              className="absolute end-2 top-2 flex size-7 items-center justify-center rounded-full bg-rose-500 shadow-md shadow-rose-500/40"
            >
              <X className="size-4 text-white" strokeWidth={3} />
            </span>
          </div>
          <div className="p-3.5">
            <h3 className="text-[12.5px] font-extrabold">{m.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                مشکلش چیه؟{" "}
              </span>
              {m.problem}
            </p>
            <p className="mt-2 flex items-start gap-1.5">
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                strokeWidth={3}
              />
              <span className="text-[11px] font-bold leading-relaxed text-emerald-700 dark:text-emerald-400">
                <span className="font-extrabold">درستش: </span>
                {m.fix}
              </span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── درس ۵: انواع شنا ──────────────────────────────────────────── */

function VariationsContent() {
  return (
    <div>
      <div className="space-y-3">
        {LEARN_VARIATIONS.map((v) => (
          <article
            key={v.name}
            className="overflow-hidden rounded-3xl border border-border bg-muted/30"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={v.image}
                alt={v.imageAlt}
                fill
                sizes={IMG_SIZES}
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-extrabold">{v.name}</h3>
                <Difficulty level={v.difficulty} />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {v.desc}
              </p>
              <p className="mt-2 flex items-start gap-1.5 text-[10.5px] font-bold leading-relaxed text-teal-700 dark:text-teal-300">
                <Target className="mt-0.5 size-3.5 shrink-0" />
                <span>کی استفاده کنم؟ {v.whenToUse}</span>
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[10.5px] font-bold leading-relaxed text-amber-800 dark:text-amber-300">
          {VARIATIONS_NOTE}
        </p>
      </div>
    </div>
  );
}

/** سطح سختی ۱ تا ۳ با شعله‌های توپر/توخالی */
function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span
      className="flex shrink-0 items-center gap-0.5"
      role="img"
      aria-label={`سختی ${toFa(level)} از ${toFa(3)}`}
    >
      {[1, 2, 3].map((i) => (
        <Flame
          key={i}
          aria-hidden
          className={cn(
            "size-3.5",
            i <= level
              ? "fill-orange-500 text-orange-500"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

/* ── کارت پایانی ───────────────────────────────────────────────── */

function ClosingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="mb-2 flex items-center gap-3 rounded-3xl border border-orange-200 bg-gradient-to-l from-orange-50 to-amber-50 p-4 dark:border-orange-900/60 dark:from-orange-950/40 dark:to-amber-950/30"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/30">
        <ArrowLeft className="size-5" />
      </span>
      <p className="text-[11.5px] font-bold leading-relaxed">
        {LEARN_CLOSING.text}
      </p>
    </motion.div>
  );
}
