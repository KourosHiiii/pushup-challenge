package com.pushup.challenge

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

/**
 * ویجت صفحه‌ اصلی اندروید — استریک و روز چالش همیشه روی هوم‌اسکرین.
 *
 * داده‌ها توسط جاوااسکریپت اپ (src/lib/widget.ts) با پلاگین
 * @capacitor/preferences در SharedPreferences با نام "CapacitorStorage"
 * نوشته می‌شوند و این Provider همان فایل را می‌خواند.
 * کلیدها: widget_streak, widget_day, widget_day_total, widget_total, widget_label
 */
class PushupWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)

        val streak = prefs.getString("widget_streak", "0")?.toIntOrNull() ?: 0
        val day = prefs.getString("widget_day", "1")?.toIntOrNull() ?: 1
        val dayTotal = prefs.getString("widget_day_total", "30")?.toIntOrNull() ?: 30
        val label = prefs.getString("widget_label", "بیا شنا بزنیم!") ?: "بیا شنا بزنیم!"

        val dayShown = day.coerceIn(1, dayTotal)
        val progress = (dayShown * 100 / dayTotal)

        val views = RemoteViews(context.packageName, R.layout.pushup_widget).apply {
            setTextViewText(R.id.widget_streak, "🔥 ${fa(streak)}")
            setTextViewText(R.id.widget_day, "روز ${fa(dayShown)} از ${fa(dayTotal)}")
            setProgressBar(R.id.widget_progress, 100, progress, false)
            setTextViewText(R.id.widget_label, label)
        }

        appWidgetIds.forEach { id ->
            appWidgetManager.updateAppWidget(id, views)
        }
    }

    /** تبدیل ارقام لاتین به فارسی */
    private fun fa(n: Int): String {
        val fa = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')
        return if (n < 0) "۰" else n.toString().map { fa[Character.getNumericValue(it)] }.joinToString("")
    }
}
