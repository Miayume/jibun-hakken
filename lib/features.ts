import { prisma } from "@/lib/db";

/**
 * 機能ごとの有料/無料を切り替えるための仕組み。
 * MVPでは全機能 isPremium=false（無料開放）。将来、特定のキーを
 * isPremium=true にし、userPlan が "free" のユーザーにはロック画面を出す想定。
 */
export async function isFeatureEnabledForUser(
  featureKey: string,
  userPlan: string
): Promise<boolean> {
  if (userPlan === "premium") return true;
  const feature = await prisma.feature.findUnique({ where: { key: featureKey } });
  if (!feature) return true; // 未登録の機能は無料開放扱い
  return !feature.isPremium;
}
