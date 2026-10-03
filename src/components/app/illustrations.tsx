/**
 * تصویرسازی‌های SVG اختصاصی — همه دست‌ساز و بدون ایموجی
 * با گرادیان‌های گرم و انرژی‌بخش
 */

interface IllustrationProps {
  className?: string;
}

/** آدمک در حال شنا سوئدی — تصویرسازی اصلی اپ */
export function PushUpFigure({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 260 160" className={className} role="img" aria-label="تصویر شخص در حال انجام شنا سوئدی">
      <defs>
        <linearGradient id="pu-body" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="pu-arm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <radialGradient id="pu-glow" cx="0.45" cy="0.45" r="0.55">
          <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pu-ground" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#FDBA74" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* هاله انرژی پشت */}
      <circle cx="118" cy="78" r="72" fill="url(#pu-glow)" />

      {/* خطوط سرعت */}
      <g stroke="#FB923C" strokeWidth="4" strokeLinecap="round" opacity="0.55" fill="none">
        <path d="M28 60 h18" />
        <path d="M20 82 h26" />
        <path d="M30 104 h16" />
      </g>

      {/* زمین و سایه */}
      <ellipse cx="132" cy="139" rx="102" ry="9" fill="#FB923C" opacity="0.18" />
      <line x1="14" y1="139" x2="246" y2="139" stroke="url(#pu-ground)" strokeWidth="4" strokeLinecap="round" />

      {/* کف دست روی زمین */}
      <rect x="62" y="127" width="30" height="9" rx="4.5" fill="#C2410C" />

      {/* بدن — پاها، تنه، بازو */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M212 131 L194 106 L152 97"
          stroke="url(#pu-body)"
          strokeWidth="14"
        />
        <path
          d="M152 97 L88 84"
          stroke="url(#pu-body)"
          strokeWidth="16"
        />
        <path
          d="M88 84 L84 108 L77 128"
          stroke="url(#pu-arm)"
          strokeWidth="12"
        />
      </g>

      {/* سر با هدبند */}
      <circle cx="70" cy="74" r="16" fill="url(#pu-body)" />
      <path d="M56 68 a16 16 0 0 1 28 -2 l-4 5 a12 12 0 0 0 -20 2 z" fill="#FFF7ED" opacity="0.95" />

      {/* صورت */}
      <circle cx="63" cy="76" r="1.8" fill="#7C2D12" />
      <path d="M56 84 q4 3 8 1" stroke="#7C2D12" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85" />

      {/* قطره عرق — تلاش! */}
      <path d="M96 58 q3.5 5 0 8 q-3.5 -3 0 -8" fill="#38BDF8" opacity="0.9" />
      <path d="M106 50 q2.6 3.8 0 6 q-2.6 -2.2 0 -6" fill="#38BDF8" opacity="0.7" />

      {/* پنجه پا */}
      <path d="M212 131 l16 3" stroke="#C2410C" strokeWidth="9" strokeLinecap="round" />

      {/* جرقه‌های انگیزشی */}
      <g fill="#FBBF24">
        <path d="M226 52 l2.2 5.8 5.8 2.2 -5.8 2.2 -2.2 5.8 -2.2 -5.8 -5.8 -2.2 5.8 -2.2 z" opacity="0.9" />
        <path d="M196 34 l1.7 4.4 4.4 1.7 -4.4 1.7 -1.7 4.4 -1.7 -4.4 -4.4 -1.7 4.4 -1.7 z" opacity="0.65" />
      </g>
    </svg>
  );
}

/** شعله استریک — قلب گیمیفیکیشن */
export function FlameIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="شعله استریک">
      <defs>
        <linearGradient id="fl-outer" x1="0.2" y1="1" x2="0.9" y2="0.1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="60%" stopColor="#F4511E" />
          <stop offset="100%" stopColor="#E53935" />
        </linearGradient>
        <linearGradient id="fl-inner" x1="0.3" y1="1" x2="0.7" y2="0">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fl-outer)"
        d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"
      />
      <path
        fill="url(#fl-inner)"
        d="M11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"
      />
    </svg>
  );
}

/** جام قهرمانی */
export function TrophyIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="جام قهرمانی">
      <defs>
        <linearGradient id="tr-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path
        fill="url(#tr-gold)"
        d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
      />
    </svg>
  );
}

/** مدال دستاورد با ستاره */
export function MedalIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="مدال">
      <defs>
        <linearGradient id="md-ribbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="md-ribbon2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="md-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path d="M8 1.5h3.4L12 8.6 9.2 12z" fill="url(#md-ribbon)" />
      <path d="M16 1.5h-3.4L12 8.6l2.8 3.4z" fill="url(#md-ribbon2)" />
      <circle cx="12" cy="15.5" r="6.5" fill="url(#md-gold)" />
      <circle cx="12" cy="15.5" r="4.7" fill="#FFF7ED" opacity="0.28" />
      <path
        fill="#FFF7ED"
        d="M12 11.9l1 2.02 2.23.32-1.61 1.57.38 2.22L12 17l-2 .86.38-2.22-1.61-1.57 2.23-.32z"
      />
    </svg>
  );
}

/** ماه استراحت و ریکاوری */
export function RestMoonIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="ماه استراحت">
      <defs>
        <linearGradient id="rm-moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        fill="url(#rm-moon)"
        d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-12.09-8.43-8.32-14.96z"
      />
      <g fill="#34D399">
        <path d="M18.5 3.5l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z" />
        <path d="M21 8l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" />
      </g>
    </svg>
  );
}

/** هالتر */
export function DumbbellIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="هالتر">
      <path
        fill="currentColor"
        d="M20.57 14.86 22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"
      />
    </svg>
  );
}

/** قفل برای دستاوردهای بسته */
export function LockIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="قفل">
      <path
        fill="currentColor"
        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-9H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z"
      />
    </svg>
  );
}

/** نشان تیک سبز — تمرین انجام شد */
export function CheckBadgeIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="انجام شد">
      <defs>
        <linearGradient id="cb-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#cb-green)" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="#FFF7ED"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** چهارپر ستاره‌ای درخشان */
export function SparkleIcon({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"
      />
    </svg>
  );
}

/** تصویرسازی تست نهایی — جام روی سکو با شعله */
export function FinalTestIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 260 160" className={className} role="img" aria-label="تصویرسازی تست نهایی">
      <defs>
        <linearGradient id="ft-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="ft-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="130" cy="80" r="72" fill="url(#ft-glow)" />
      {/* سکو */}
      <rect x="88" y="118" width="84" height="12" rx="6" fill="#D97706" />
      <rect x="100" y="130" width="60" height="8" rx="4" fill="#B45309" />
      {/* جام */}
      <g transform="translate(130 78)">
        <path
          fill="url(#ft-gold)"
          transform="translate(-24 -34) scale(2)"
          d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
        />
      </g>
      {/* شعله‌های اطراف */}
      <g opacity="0.9">
        <path
          transform="translate(52 84) scale(1.5)"
          fill="#F97316"
          d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"
        />
        <path
          transform="translate(178 84) scale(1.5)"
          fill="#F97316"
          d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"
        />
      </g>
      <g fill="#FBBF24">
        <path d="M42 44 l2 5.2 5.2 2 -5.2 2 -2 5.2 -2 -5.2 -5.2 -2 5.2 -2 z" opacity="0.85" />
        <path d="M218 40 l1.8 4.7 4.7 1.8 -4.7 1.8 -1.8 4.7 -1.8 -4.7 -4.7 -1.8 4.7 -1.8 z" opacity="0.7" />
      </g>
    </svg>
  );
}
