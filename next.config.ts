import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=true → خروجی کاملاً استاتیک (برای بیلد APK با Capacitor).
 * در این حالت مسیرهای API کنار گذاشته می‌شوند (اسکریپت CI مسیر api را موقتاً جابه‌جا می‌کند).
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
