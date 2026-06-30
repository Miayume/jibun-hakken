"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { runAnalysisForUser } from "@/lib/analysis/trigger";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value;
}

export async function addEntry(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const type = formData.get("type") === "stress" ? "stress" : "wakuwaku";

  await prisma.entry.create({
    data: {
      userId,
      type,
      what: emptyToNull(formData.get("what")),
      doingWhat: emptyToNull(formData.get("doingWhat")),
      withWho: emptyToNull(formData.get("withWho")),
      whoPerson: emptyToNull(formData.get("whoPerson")),
      whoGoodPoint: emptyToNull(formData.get("whoGoodPoint")),
      whereWas: emptyToNull(formData.get("whereWas")),
      whyFeeling: emptyToNull(formData.get("whyFeeling")),
      whyStress: emptyToNull(formData.get("whyStress")),
      mostImpressive: emptyToNull(formData.get("mostImpressive")),
      futureUseful: emptyToNull(formData.get("futureUseful")),
      futureImprove: emptyToNull(formData.get("futureImprove")),
    },
  });

  // 閾値を超えた瞬間だけ分析を実行（毎回呼ぶと無料枠をすぐに消費するため）
  // 対象: 5件・10件・30件の初回到達時、以降は30件を超えて20件ごと（50・70・90...）
  const count = await prisma.entry.count({ where: { userId } });
  const atThreshold = [5, 10, 30].includes(count);
  const periodicAfter30 = count > 30 && (count - 30) % 20 === 0;
  if (atThreshold || periodicAfter30) {
    await runAnalysisForUser(userId);
  }

  revalidatePath("/journal/new");
  revalidatePath("/journal/calendar");
  revalidatePath("/analysis");
  redirect("/journal/new?saved=1");
}

export async function deleteEntry(entryId: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  await prisma.entry.deleteMany({ where: { id: entryId, userId } });

  revalidatePath("/journal/calendar");
  revalidatePath("/journal/day/[date]", "page");
  revalidatePath("/analysis");
}
