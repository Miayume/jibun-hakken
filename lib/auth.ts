import "server-only";
import { cookies } from "next/headers";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "jh_session";
const RECOVERY_CODE_WORD_COUNT = 4;

// 人が書き写しやすい単語（個人情報に繋がらない一般名詞のみ）
const RECOVERY_WORDS = [
  "あさひ", "いずみ", "うみそら", "えがお", "おひさま", "かぜ", "きぼう", "くも",
  "けやき", "こもれび", "さくら", "しずく", "すずか", "せかい", "そよかぜ", "たいよう",
  "つばさ", "てんき", "とびら", "なぎさ", "にじ", "ぬくもり", "ねいろ", "のはら",
  "はなび", "ひかり", "ふうせん", "へいわ", "ほし", "まなび", "みらい", "むぎ",
  "めぐみ", "もみじ", "やくそく", "ゆめ", "よあけ", "らいおん", "りんご", "るり",
  "れんげ", "ろけっと", "わかば",
];

function hashRecoveryCode(code: string): string {
  const salt = process.env.RECOVERY_CODE_SALT ?? "dev-only-change-me";
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

function generateRecoveryCode(): string {
  const words: string[] = [];
  for (let i = 0; i < RECOVERY_CODE_WORD_COUNT; i++) {
    words.push(RECOVERY_WORDS[randomInt(RECOVERY_WORDS.length)]);
  }
  return words.join("-");
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** 同意済みの新規利用者ぶんの匿名アカウントを発行し、復旧コードを一度だけ返す */
export async function createAnonymousAccount(): Promise<{
  userId: string;
  recoveryCode: string;
}> {
  let recoveryCode = generateRecoveryCode();
  let recoveryCodeHash = hashRecoveryCode(recoveryCode);

  // 衝突した場合は再生成（語数が多いため極めて稀）
  while (await prisma.user.findUnique({ where: { recoveryCodeHash } })) {
    recoveryCode = generateRecoveryCode();
    recoveryCodeHash = hashRecoveryCode(recoveryCode);
  }

  const user = await prisma.user.create({ data: { recoveryCodeHash } });
  await setSessionCookie(user.id);
  return { userId: user.id, recoveryCode };
}

/** 復旧コードで別デバイスから再ログイン */
export async function loginWithRecoveryCode(
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return { ok: false, error: "復旧コードを入力してください。" };

  const user = await prisma.user.findUnique({
    where: { recoveryCodeHash: hashRecoveryCode(normalized) },
  });
  if (!user) {
    return { ok: false, error: "復旧コードが見つかりません。入力内容をご確認ください。" };
  }
  await setSessionCookie(user.id);
  return { ok: true };
}

export async function hasAgreedToConsent(userId: string): Promise<boolean> {
  const consent = await prisma.consent.findFirst({ where: { userId } });
  return consent !== null;
}

/** 復旧コードを忘れた場合の再発行。古いコードは即座に無効化される */
export async function rotateRecoveryCode(userId: string): Promise<string> {
  let recoveryCode = generateRecoveryCode();
  let recoveryCodeHash = hashRecoveryCode(recoveryCode);

  while (await prisma.user.findUnique({ where: { recoveryCodeHash } })) {
    recoveryCode = generateRecoveryCode();
    recoveryCodeHash = hashRecoveryCode(recoveryCode);
  }

  await prisma.user.update({ where: { id: userId }, data: { recoveryCodeHash } });
  return recoveryCode;
}
