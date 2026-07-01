"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
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
  const nextType = type === "wakuwaku" ? "stress" : "wakuwaku";

  const what = emptyToNull(formData.get("what"));
  const doingWhat = emptyToNull(formData.get("doingWhat"));
  const withWho = emptyToNull(formData.get("withWho"));
  const whoPerson = emptyToNull(formData.get("whoPerson"));
  const whoGoodPoint = emptyToNull(formData.get("whoGoodPoint"));
  const whereWas = emptyToNull(formData.get("whereWas"));
  const whyFeeling = emptyToNull(formData.get("whyFeeling"));
  const whyStress = emptyToNull(formData.get("whyStress"));
  const mostImpressive = emptyToNull(formData.get("mostImpressive"));
  const futureUseful = emptyToNull(formData.get("futureUseful"));
  const futureImprove = emptyToNull(formData.get("futureImprove"));

  // 全フィールドが一致する記録が既にある場合は重複として保存しない
  const duplicate = await prisma.entry.findFirst({
    where: { userId, type, what, doingWhat, withWho, whoPerson, whoGoodPoint, whereWas, whyFeeling, whyStress, mostImpressive, futureUseful, futureImprove },
  });
  if (duplicate) {
    redirect(`/journal/new?duplicate=1&type=${nextType}`);
  }

  await prisma.entry.create({
    data: { userId, type, what, doingWhat, withWho, whoPerson, whoGoodPoint, whereWas, whyFeeling, whyStress, mostImpressive, futureUseful, futureImprove },
  });

  // 分析完了後にキャッシュ更新（完了前に更新すると古い結果が表示される）
  after(async () => {
    await runAnalysisForUser(userId);
    revalidatePath("/analysis");
  });

  revalidatePath("/journal/new");
  revalidatePath("/journal/calendar");
  redirect(`/journal/new?saved=1&type=${nextType}`);
}

export async function saveActionReflection(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const actionPoint = (formData.get("actionPoint") as string)?.trim();
  const question = (formData.get("question") as string)?.trim();
  const reflection = (formData.get("reflection") as string)?.trim() || null;
  const questionIndex = parseInt((formData.get("questionIndex") as string) ?? "", 10);

  if (isNaN(questionIndex) || questionIndex < 0) return;

  // 回答済みマーカー（インデックスのみ。分析IDが変わっても追跡できる）
  await prisma.entry.create({
    data: { userId, type: "action_answered", what: String(questionIndex), whyFeeling: reflection },
  });

  // 振り返り内容があればwakuwakuエントリーとしても記録（AI分析に使う）
  if (reflection) {
    const what = question
      ? `【週次の問い】${question}`
      : `【今週やってみること】${actionPoint}`;
    await prisma.entry.create({
      data: { userId, type: "wakuwaku", what, whyFeeling: reflection },
    });
  }

  revalidatePath("/analysis");
}

export async function deleteEntry(entryId: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  await prisma.entry.deleteMany({ where: { id: entryId, userId } });

  revalidatePath("/journal/calendar");
  revalidatePath("/journal/day/[date]", "page");
  revalidatePath("/analysis");
}
