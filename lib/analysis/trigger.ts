import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import type { AnalysisScope, AnalysisTier, JournalEntryForAnalysis } from "@/lib/ai/types";

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

/** 記録の追加・削除のたびに呼び出し、件数に応じて3スコープぶんの分析を再生成する */
export async function runAnalysisForUser(userId: string): Promise<void> {
  const entries = (await prisma.entry.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })) as JournalEntryForAnalysis[];

  const tier = tierForCount(entries.length);
  if (!tier) return;

  const provider = getAIProvider();
  const scopes: AnalysisScope[] = ["recent30", "recent100", "all"];

  for (const scope of scopes) {
    const scopedEntries = sliceForScope(entries, scope);
    const content = await provider.analyze({ entries: scopedEntries, tier, scope });

    await prisma.analysisResult.create({
      data: {
        userId,
        scope,
        tier,
        content: JSON.stringify(content),
        basedOnEntryCount: scopedEntries.length,
      },
    });
  }
}

export function entryCountThresholds() {
  return { simple: 5, detailed: 10, full: 30 } as const;
}
