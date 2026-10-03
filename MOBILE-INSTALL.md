# راهنمای نصب روی موبایل و بیلد APK

## راه ۱: نصب مستقیم به‌عنوان PWA (سریع‌ترین راه — پیشنهادی)

این اپ به‌صورت کامل PWA ساخته شده و بدون نیاز به گوگل‌پلی، مثل یه اپ واقعی روی گوشی نصب می‌شه:

1. اپ را با کروم (اندروید) یا سافاری (آیفون) باز کن
2. اندروید: منوی ⋮ → «Add to Home screen»
   آیفون: Share → «Add to Home Screen»
3. تمام! آیکون اپ کنار بقیه اپ‌هاست، تمام‌صفحه و بدون نوار آدرس اجرا می‌شود

## راه ۲: بیلد APK با گیت‌هاب اکشنز

پروژه شامل فایل `.github/workflows/build-apk.yml` است:

1. کد را به ریپوی گیت‌هاب خودت پوش کن
2. تب Actions را باز کن و workflow «Build Android APK» را اجرا کن
3. بعد از اتمام، APK را از بخش Artifacts دانلود کن

### نکته مهم برای APK

وقتی اپ به‌صورت APK نصب می‌شود، بک‌اند (Next.js API) باید روی یک سرور
میزبانی شود (مثلاً Vercel یا VPS خودت). سپس در کد فرانت‌اند آدرس API را
به دامنه خودت تغییر بده.

## راه ۳: بیلد محلی با Capacitor (روی کامپیوتر خودت)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "PushUp Challenge" com.shanayal.pushup --web-dir=out
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
# خروجی: android/app/build/outputs/apk/debug/app-debug.apk
```

## مشخصات اپ

- **چالش ۳۰ روزه** بر پایه برنامه‌های علمی (شروع با ۵ شنا → ۵۵+ در تست نهایی)
- **استریک روزانه** سبک دولینگو + ثبت روزهای استراحت
- **۱۴ نشان** دستاورد، **۸ سطح** از تازه‌کار تا افسانه
- **آمار کامل**: نمودار هفتگی، نقشه ۳۰ روزه، مجموع شن‌ها
- کاملاً **فارسی و راست‌چین** با فونت وزیرمتن
- تم روشن و تاریک
