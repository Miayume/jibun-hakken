import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import { runAnalysisForUser } from "@/lib/analysis/trigger";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  waitUntil(
    runAnalysisForUser(userId).then(() => {
      revalidatePath("/analysis");
    })
  );

  return NextResponse.json({ ok: true });
}
