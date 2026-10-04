import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/body — دفتر بدن: وزن‌ها (۳۶۵ روز آخر، صعودی بر اساس تاریخ) + عکس قبل/بعد */
export async function GET() {
  try {
    const [weightsDesc, photos] = await Promise.all([
      db.weightEntry.findMany({
        where: { stateId: "main" },
        orderBy: { date: "desc" },
        take: 365,
      }),
      db.bodyPhoto.findMany({ where: { stateId: "main" } }),
    ]);
    const before = photos.find((p) => p.slot === "before") ?? null;
    const after = photos.find((p) => p.slot === "after") ?? null;
    return NextResponse.json({
      weights: weightsDesc.reverse().map((w) => ({ date: w.date, kg: w.kg })),
      photos: {
        before: before ? { image: before.image, date: before.date } : null,
        after: after ? { image: after.image, date: after.date } : null,
      },
    });
  } catch (error) {
    console.error("GET /api/body failed:", error);
    return NextResponse.json({ error: "خطا در دریافت دفتر بدن" }, { status: 500 });
  }
}
