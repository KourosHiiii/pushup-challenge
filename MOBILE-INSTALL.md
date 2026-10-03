# راهنمای نصب روی موبایل

## راه ۱: دانلود APK آماده (پیشنهادی — کاملاً آفلاین)

آخرین فایل APK را از بخش **[Releases](https://github.com/KourosHiiii/pushup-challenge/releases)** ریپو دانلود کن:

1. فایل `app-debug.apk` را روی گوشی دانلود کن
2. روی فایل بزن؛ اگر پرسید، «اجازه نصب از منابع ناشناس» را بده
3. تمام! اپ با آیکون شعله روی صفحه اصلی نصب می‌شود

### ویژگی‌های نسخه APK

- ✅ **کاملاً آفلاین** — همه داده‌ها (استریک، نشان‌ها، آمار) روی خود گوشی ذخیره می‌شوند
- ✅ **یادآوری روزانه بومی اندروید** — نوتیفیکیشن با صدا حتی وقتی اپ بسته است
  (بعد از اولین تمرین یا از ⚙️ تنظیمات فعالش کن و ساعتش را انتخاب کن)
- ✅ بدون نیاز به اینترنت، بدون سرور

## راه ۲: نصب به‌عنوان PWA (بدون APK)

1. اپ را با کروم (اندروید) یا سافاری (آیفون) باز کن
2. اندروید: منوی ⋮ → «Add to Home screen»
3. در این حالت نوتیف یادآوری از طریق Web Push و هنگام باز بودن سرور ارسال می‌شود

## راه ۳: بیلد خود APK

هر push به `main` به‌صورت خودکار workflow «Build Android APK» را اجرا می‌کند
(`.github/workflows/build-apk.yml`):

- خروجی استاتیک Next.js ساخته می‌شود (`STATIC_EXPORT=true`، مسیرهای API جابه‌جا می‌شوند)
- آیکون و اسپلش از `assets/icon.png` و `assets/splash.png` تولید می‌شود
- Capacitor اپ اندروید را می‌سازد و APK در **Releases** و **Artifacts** قرار می‌گیرد

بیلد دستی: تب Actions → «Build Android APK» → Run workflow

## راه ۴: بیلد محلی (روی کامپیوتر خودت)

```bash
npm install
mv src/app/api /tmp/api-backup
STATIC_EXPORT=true npm run build
mv /tmp/api-backup src/app/api
npm install -D @capacitor/cli
npm install @capacitor/core @capacitor/android @capacitor/local-notifications
npx cap add android
npx @capacitor/assets generate --android --assetPath assets
npx cap sync android
cd android && ./gradlew assembleDebug
# خروجی: android/app/build/outputs/apk/debug/app-debug.apk
```

> نسخه وب (با سرور) برای اجرا به `.env` با کلیدهای VAPID و دیتابیس نیاز دارد
> (`cp .env.example .env` و سپس `bun run db:push`). نسخه APK به هیچ‌کدام نیاز ندارد.
