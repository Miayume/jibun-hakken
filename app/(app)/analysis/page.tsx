import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { entryCountThresholds } from "@/lib/analysis/trigger";
import type { AnalysisContent, AnalysisScope } from "@/lib/ai/types";
import { format } from "date-fns";
import Link from "next/link";

const SCOPE_LABELS: Record<AnalysisScope, string> = {
  recent30: "最近30件",
  recent100: "最近100件",
  all: "全期間",
};

const CATEGORY_LABELS: { key: keyof AnalysisContent; label: string }[] = [
  { key: "work", label: "仕事" },
  { key: "lifestyle", label: "ライフスタイル" },
  { key: "environment", label: "環境" },
  { key: "relationships", label: "人間関係" },
  { key: "happiness", label: "幸福" },
  { key: "stress", label: "ストレス" },
  { key: "values", label: "価値観" },
  { key: "thinkingAndAction", label: "思考・行動" },
  { key: "strengths", label: "強み" },
];

const TIER_LABELS: Record<string, string> = {
  simple: "簡易分析",
  detailed: "詳細分析",
  full: "本格分析",
};

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const userId = await getCurrentUserId();
  const { scope: scopeParam } = await searchParams;
  const scope: AnalysisScope =
    scopeParam === "recent100" || scopeParam === "all" ? scopeParam : "recent30";

  const entryCount = userId ? await prisma.entry.count({ where: { userId } }) : 0;
  const thresholds = entryCountThresholds();

  const latest = userId
    ? await prisma.analysisResult.findFirst({
        where: { userId, scope },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const content = latest ? (JSON.parse(latest.content) as AnalysisContent) : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-bold mb-4">分析結果</h1>

      <div className="flex gap-2 mb-6">
        {(["recent30", "recent100", "all"] as AnalysisScope[]).map((s) => (
          <Link
            key={s}
            href={`/analysis?scope=${s}`}
            className={`rounded px-3 py-1.5 text-sm border ${
              scope === s ? "bg-black text-white border-black" : "border-gray-300"
            }`}
          >
            {SCOPE_LABELS[s]}
          </Link>
        ))}
      </div>

      {!content && (
        <div className="rounded border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          {entryCount === 0
            ? "まだ記録がありません。記録を追加すると分析が始まります。"
            : `あと${Math.max(0, thresholds.simple - entryCount)}件記録すると簡易分析が表示されます（現在${entryCount}件）。`}
        </div>
      )}

      {content && (
        <div className="space-y-6">
          <div className="rounded border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="text-xs text-gray-500 mb-1">
              {TIER_LABELS[latest!.tier]} ・ {latest!.basedOnEntryCount}件の記録に基づく ・{" "}
              {format(latest!.createdAt, "yyyy/MM/dd HH:mm")}時点
            </p>
            <p>{content.summary}</p>
          </div>

          {CATEGORY_LABELS.map(({ key, label }) => {
            const items = content[key];
            if (!Array.isArray(items) || items.length === 0) return null;
            return (
              <div key={key}>
                <h2 className="font-semibold mb-2">{label}</h2>
                <ul className="space-y-1 text-sm list-disc list-inside text-gray-700">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}

          <p className="text-xs text-gray-400 pt-4 border-t">
            ※ この分析結果は、入力された記録のみに基づく参考情報です。医療・心理診断・カウンセリング・法律・投資等の専門的判断ではありません。最終的な判断はご自身でお願いします。
          </p>
        </div>
      )}
    </main>
  );
}
