import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFullState } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await db.dayRecord.deleteMany({ where: { stateId: "main" } });
    await db.maxRepTest.deleteMany({ where: { stateId: "main" } });
    await db.weightEntry.deleteMany({ where: { stateId: "main" } });
    await db.bodyPhoto.deleteMany({ where: { stateId: "main" } });
    await db.appState.update({
      where: { id: "main" },
      data: {
        currentDay: 1,
        currentStreak: 0,
        bestStreak: 0,
        lastCheckinDate: null,
        totalPushups: 0,
        totalWorkouts: 0,
        freezeUsedDate: null,
        freeMode: false,
      },
    });
    const state = await getFullState();
    return NextResponse.json({ state });
  } catch (error) {
    console.error("POST /api/reset failed:", error);
    return NextResponse.json({ error: "خطا در ریست کردن" }, { status: 500 });
  }
}
