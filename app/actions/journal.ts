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

  await runAnalysisForUser(userId);

  revalidatePath("/journal/new");
  revalidatePath("/journal/calendar");
  revalidatePath("/analysis");
  redirect("/journal/new?saved=1");
}

export async function deleteEntry(entryId: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  await prisma.entry.deleteMany({ where: { id: entryId, userId } });
  await runAnalysisForUser(userId);

  revalidatePath("/journal/calendar");
  revalidatePath("/journal/day/[date]", "page");
  revalidatePath("/analysis");
}
