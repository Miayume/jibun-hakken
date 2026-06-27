"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId, clearSessionCookie, rotateRecoveryCode } from "@/lib/auth";

export async function deleteAllData() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  // onDelete: Cascade により entries / analyses / profile / consents もまとめて削除される
  await prisma.user.delete({ where: { id: userId } });
  await clearSessionCookie();
  redirect("/");
}

export async function regenerateRecoveryCode(): Promise<{ code: string }> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");
  const code = await rotateRecoveryCode(userId);
  return { code };
}
