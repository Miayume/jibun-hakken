"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createAnonymousAccount,
  loginWithRecoveryCode,
  clearSessionCookie,
} from "@/lib/auth";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal/content";

/** 同意ボタン押下時：匿名アカウント発行＋同意記録、復旧コード表示ページへ */
export async function agreeAndStart() {
  const { userId, recoveryCode } = await createAnonymousAccount();
  await prisma.consent.create({
    data: { userId, termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION },
  });
  redirect(`/welcome?code=${encodeURIComponent(recoveryCode)}`);
}

export async function continueToProfile() {
  redirect("/onboarding/profile");
}

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const code = String(formData.get("recoveryCode") ?? "");
  const result = await loginWithRecoveryCode(code);
  if (!result.ok) {
    return { error: result.error };
  }
  redirect("/journal/new");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
