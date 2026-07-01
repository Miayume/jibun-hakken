import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import type {
  AnalysisContent,
  AnalysisScope,
  AnalysisTier,
  JournalEntryForAnalysis,
  PassionItem,
  UserProfileForAnalysis,
} from "@/lib/ai/types";

function tierForCount(count: number): AnalysisTier | null {
  if (count >= 30) return "full";
  if (count >= 10) return "detailed";
  if (count >= 5) return "simple";
  return null;
}

function sliceForScope(
  entriesAsc: JournalEntryForAnalysis[],
  scope: AnalysisScope
): JournalEntryForAnalysis[] {
  if (scope === "all") return entriesAsc;
  const n = scope === "recent30" ? 30 : 100;
  return entriesAsc.slice(Math.max(0, entriesAsc.length - n));
}

/**
 * 記録の追加・削除のたびに呼び出し、件数に応じて3スコープぶんの分析を再生成する。
 * recent30/recent100/allが同じ記録セットになる場合（総件数が少ない場合）はAPI呼び出しを共有し、
 * 異なるセットになる分だけ並列でAI分析を呼び出す。
 */
export async function runAnalysisForUser(userId: string): Promise<void> {
  try {
    const entries = (await prisma.entry.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    })) as JournalEntryForAnalysis[];

    const tier = tierForCount(entries.length);
    if (!tier) return;

    const provider = getAIProvider();
    const scopes: AnalysisScope[] = ["recent30", "recent100", "all"];

    // プロフィール情報を取得してAIに渡す
    const profileRow = await prisma.profile.findUnique({ where: { userId } });
    const profile: UserProfileForAnalysis | null = profileRow
      ? {
          ...profileRow,
          passions: profileRow.passions
            ? (JSON.parse(profileRow.passions) as PassionItem[])
            : null,
          personalityWords: profileRow.personalityWords
            ? (JSON.parse(profileRow.personalityWords) as string[])
            : null,
          visionAnswers: profileRow.visionAnswers
            ? (JSON.parse(profileRow.visionAnswers) as Record<string, string>)
            : null,
        }
      : null;

    // 同じ件数(=同じ記録セット)のスコープはAPI呼び出しを1回にまとめる
    const sliceLengthByScope = new Map(scopes.map((s) => [s, sliceForScope(entries, s).length]));
    const uniqueLengths = [...new Set(sliceLengthByScope.values())];

    const contentByLength = new Map<number, AnalysisContent>(
      await Promise.all(
        uniqueLengths.map(async (length) => {
          const scopedEntries = entries.slice(entries.length - length);
          const content = await provider.analyze({ entries: scopedEntries, tier, scope: "all", profile });
          return [length, content] as const;
        })
      )
    );

    await Promise.all(
      scopes.map((scope) => {
        const length = sliceLengthByScope.get(scope)!;
        const content = contentByLength.get(length)!;
        return prisma.analysisResult.create({
          data: {
            userId,
            scope,
            tier,
            content: JSON.stringify(content),
            basedOnEntryCount: length,
          },
        });
      })
    );
  } catch (error) {
    // 分析が失敗しても記録の保存自体は成功させる（AI側の一時的な障害・無料枠の上限などで
    // ユーザーの記録が失われることがあってはならないため）
    console.error("AI分析に失敗しました（記録の保存には影響しません）:", error);
  }
}

export function entryCountThresholds() {
  return { simple: 5, detailed: 10, full: 30 } as const;
}
