import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tehranToday } from "@/lib/dates";

export const dynamic = "force-dynamic";

/** GET /api/max-reps — تاریخچه تست حداکثر شنا (۵۰ تست آخر، جدیدترین اول) + بهترین رکورد */
export async function GET() {
  try {
    const [tests, bestRow] = await Promise.all([
      db.maxRepTest.findMany({
        where: { stateId: "main" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.maxRepTest.findFirst({
        where: { stateId: "main" },
        orderBy: { count: "desc" },
      }),
    ]);
    return NextResponse.json({
      tests: tests.map((t) => ({ id: t.id, count: t.count, date: t.date })),
      best: bestRow?.count ?? null,
    });
  } catch (error) {
    console.error("GET /api/max-reps failed:", error);
    return NextResponse.json({ error: "خطا در دریافت تست‌های ماکس" }, { status: 500 });
  }
}

/** POST /api/max-reps — ثبت نتیجه جدید تست حداکثر شنا */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { count?: unknown };
    const count = Math.round(Number(body.count));
    if (!Number.isFinite(count) || count < 1 || count > 1000) {
      return NextResponse.json({ error: "تعداد شنا نامعتبر است (۱ تا ۱۰۰۰)" }, { status: 400 });
    }

    // بهترین رکورد قبل از ثبت (برای تشخیص رکورد جدید)
    const prevBest = await db.maxRepTest.findFirst({
      where: { stateId: "main" },
      orderBy: { count: "desc" },
    });
    const isRecord = prevBest === null || count > prevBest.count;

    await db.maxRepTest.create({
      data: { count, date: tehranToday(), stateId: "main" },
    });

    const tests = await db.maxRepTest.findMany({
      where: { stateId: "main" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      tests: tests.map((t) => ({ id: t.id, count: t.count, date: t.date })),
      best: prevBest === null ? count : Math.max(prevBest.count, count),
      isRecord,
    });
  } catch (error) {
    console.error("POST /api/max-reps failed:", error);
    return NextResponse.json({ error: "خطا در ثبت تست ماکس" }, { status: 500 });
  }
}
