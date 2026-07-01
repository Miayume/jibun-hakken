"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { runAnalysisForUser } from "@/lib/analysis/trigger";

export async function refreshAnalysis() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  after(async () => {
    await runAnalysisForUser(userId);
    revalidatePath("/analysis");
  });

  redirect("/analysis?refreshing=1");
}
