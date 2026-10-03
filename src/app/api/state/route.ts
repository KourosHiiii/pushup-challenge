import { NextResponse } from "next/server";
import { getFullState } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getFullState();
    return NextResponse.json(state);
  } catch (error) {
    console.error("GET /api/state failed:", error);
    return NextResponse.json({ error: "خطا در دریافت وضعیت" }, { status: 500 });
  }
}
