import type { CapacitorConfig } from "@capacitor/cli";

/**
 * تنظیمات Capacitor — اپ اندروید کاملاً آفلاین است:
 * خروجی استاتیک Next.js در webDir و همه داده‌ها در localStorage
 * + نوتیفیکیشن لوکال بومی برای یادآوری روزانه.
 */
const config: CapacitorConfig = {
  appId: "com.pushup.challenge",
  appName: "PushUp Challenge",
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_launcher",
      iconColor: "#f97316",
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#f97316",
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
    },
  },
};

export default config;
