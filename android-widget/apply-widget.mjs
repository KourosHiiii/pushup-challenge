#!/usr/bin/env node
/**
 * نصب ویجت بومی اندروید در پروژه‌ای که `npx cap add android` تولید کرده.
 * در GitHub Actions بعد از cap add/sync اجرا می‌شود:
 *   1) کپی Kotlin + layout + widget info + drawable داخل android/app/src/main
 *   2) تزریق receiver در AndroidManifest.xml (اگر نبود)
 *   3) افزودن رشته widget_desc به strings.xml (اگر نبود)
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const src = join(root, "android-widget");
const main = join(root, "android", "app", "src", "main");

if (!existsSync(join(root, "android", "app"))) {
  console.error("✗ android/ project not found — run `npx cap add android` first");
  process.exit(1);
}

// ── ۱) کپی فایل‌ها ──
const kotlinDir = join(main, "java", "com", "pushup", "challenge");
mkdirSync(kotlinDir, { recursive: true });
cpSync(join(src, "PushupWidgetProvider.kt"), join(kotlinDir, "PushupWidgetProvider.kt"));

mkdirSync(join(main, "res", "layout"), { recursive: true });
cpSync(join(src, "pushup_widget.xml"), join(main, "res", "layout", "pushup_widget.xml"));

mkdirSync(join(main, "res", "xml"), { recursive: true });
cpSync(join(src, "pushup_widget_info.xml"), join(main, "res", "xml", "pushup_widget_info.xml"));

mkdirSync(join(main, "res", "drawable"), { recursive: true });
cpSync(join(src, "widget_bg.xml"), join(main, "res", "drawable", "widget_bg.xml"));

// ── ۲) تزریق receiver در مانیفست ──
const manifestPath = join(main, "AndroidManifest.xml");
let manifest = readFileSync(manifestPath, "utf8");
const receiver = `        <!-- ویجت استریک (تزریق خودکار با android-widget/apply-widget.mjs) -->
        <receiver
            android:name=".PushupWidgetProvider"
            android:exported="false">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/pushup_widget_info" />
        </receiver>
`;
if (!manifest.includes("PushupWidgetProvider")) {
  manifest = manifest.replace("</application>", receiver + "    </application>");
  writeFileSync(manifestPath, manifest);
  console.log("✓ receiver injected into AndroidManifest.xml");
} else {
  console.log("• receiver already present");
}

// ── ۳) رشته widget_desc ──
const stringsPath = join(main, "res", "values", "strings.xml");
let strings = readFileSync(stringsPath, "utf8");
if (!strings.includes("widget_desc")) {
  strings = strings.replace(
    "</resources>",
    '    <string name="widget_desc">استریک و روز چالش شنا</string>\n</resources>'
  );
  writeFileSync(stringsPath, strings);
  console.log("✓ widget_desc added to strings.xml");
}

console.log("✓ Android home-screen widget installed");
