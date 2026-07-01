import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { entryCountThresholds } from "@/lib/analysis/trigger";
import type { AnalysisContent, AnalysisItem, AnalysisScope } from "@/lib/ai/types";
import { format as formatTz } from "date-fns-tz";
import { JST_TZ } from "@/lib/datetime";
import Link from "next/link";
import NextActionsSection from "./NextActionsSection";
import RefreshButton from "./RefreshButton";

const SCOPE_LABELS: Record<AnalysisScope, string> = {
  recent30: "最近30件",
  recent100: "最近100件",
  all: "全期間",
};

const TIER_LABELS: Record<string, string> = {
  simple: "簡易分析",
  detailed: "詳細分析",
  full: "本格分析",
};

const SECTIONS: {
  label: string;
  parts: { label: string; get: (c: AnalysisContent) => AnalysisItem[] }[];
}[] = [
  {
    label: "変化・成長",
    parts: [
      { label: "価値観・優先順位の変化", get: (c) => c.trends?.valueChanges ?? [] },
      { label: "ストレスが増えているパターン", get: (c) => c.trends?.stressPatterns ?? [] },
      { label: "充実していた日の共通点", get: (c) => c.trends?.bestDayTraits ?? [] },
    ],
  },
  {
    label: "仕事",
    parts: [
      { label: "自分に合う仕事", get: (c) => c.work.suitableJobs },
      { label: "自分に合う役割", get: (c) => c.work.suitableRoles },
      { label: "自分に合う働き方", get: (c) => c.work.suitableWorkStyle },
    ],
  },
  {
    label: "ライフスタイル",
    parts: [{ label: "自分に合うライフスタイル", get: (c) => c.lifestyle.suitableLifestyle }],
  },
  {
    label: "環境",
    parts: [{ label: "自分が幸せになれる環境", get: (c) => c.environment.happyEnvironment }],
  },
  {
    label: "人間関係",
    parts: [
      { label: "自分が幸せになれる人間関係", get: (c) => c.relationships.happyRelationships },
      { label: "相性が良い人", get: (c) => c.relationships.compatibilityGood ?? [] },
      { label: "相性が悪い人", get: (c) => c.relationships.compatibilityBad ?? c.relationships.compatibility ?? [] },
    ],
  },
  {
    label: "幸福",
    parts: [
      { label: "幸福を感じる条件", get: (c) => c.happiness.conditions },
      { label: "幸福を感じる時間・体験を増やす提案", get: (c) => c.happiness.suggestions },
    ],
  },
  {
    label: "ストレス",
    parts: [
      { label: "ストレスを感じる共通点", get: (c) => c.stress.commonPatterns },
      { label: "成長につながるストレス", get: (c) => c.stress.growthStress },
      { label: "避けるべきストレス", get: (c) => c.stress.avoidStress },
    ],
  },
  {
    label: "価値観",
    parts: [
      { label: "自分の価値観", get: (c) => c.values.current },
      { label: "時間とともに変化した価値観", get: (c) => c.values.changeOverTime },
    ],
  },
  {
    label: "思考・行動",
    parts: [
      { label: "問題への向き合い方", get: (c) => c.thinkingAndAction.problemApproach },
      { label: "将来の目標・行動パターン", get: (c) => c.thinkingAndAction.futurePatterns },
      { label: "今後の行動への具体的な提案", get: (c) => c.thinkingAndAction.actionSuggestions },
    ],
  },
  {
    label: "強み",
    parts: [{ label: "自分の強み", get: (c) => c.strengths }],
  },
];

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

  // DB上の回答済みエントリーをチェック（localStorage依存をなくすため）
  const answeredWhats: string[] = [];
  if (content?.nextActions?.length && userId) {
    const whats = content.nextActions.map((item) =>
      item.question ? `【週次の問い】${item.question}` : `【今週やってみること】${item.point}`
    );
    const answeredEntries = await prisma.entry.findMany({
      where: { userId, type: "wakuwaku", what: { in: whats } },
      select: { what: true },
    });
    answeredEntries.forEach((e) => { if (e.what) answeredWhats.push(e.what); });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-bold mb-4">分析結果</h1>


<div className="flex gap-2 mb-6 flex-wrap items-center justify-between">
        <div className="flex gap-2">
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
        <RefreshButton />
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
              {formatTz(latest!.createdAt, "yyyy/MM/dd HH:mm", { timeZone: JST_TZ })}時点
            </p>
            <p>{content.summary}</p>
          </div>

          {content.aptitudeRanking && content.aptitudeRanking.length > 0 && (
            <div className="rounded border border-purple-200 bg-purple-50 p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-4">適性ランキング</h2>
              <div className="space-y-4">
                {content.aptitudeRanking.map((item) => (
                  <div key={item.rank} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-800 text-xs flex items-center justify-center font-bold">
                      {item.rank}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-purple-900">{item.type}</p>
                      <p className="text-xs text-purple-700">{item.reason}</p>
                      {item.insight && (
                        <p className="text-xs text-purple-500 italic">{item.insight}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.nextActions && content.nextActions.length > 0 && (
            <NextActionsSection items={content.nextActions} answeredWhats={answeredWhats} />
          )}

          <div className="divide-y divide-gray-200 border border-gray-200 rounded">
            {SECTIONS.map((section) => {
              const parts = section.parts
                .map((part) => ({ label: part.label, items: part.get(content) }))
                .filter((part) => part.items && part.items.length > 0);
              if (parts.length === 0) return null;
              const totalCount = parts.reduce((sum, p) => sum + p.items.length, 0);
              return (
                <details key={section.label} className="group">
                  <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3 font-semibold">
                    <span>{section.label}</span>
                    <span className="text-xs text-gray-400 font-normal">
                      {totalCount}件 ・ タップで開く
                    </span>
                  </summary>
                  <div className="px-4 pb-4 space-y-4">
                    {parts.map((part) => (
                      <div key={part.label}>
                        <h3 className="text-xs font-medium text-gray-500 mb-2">{part.label}</h3>
                        <div className="space-y-3">
                          {part.items.map((item, i) => (
                            <div key={i} className="border-l-2 border-gray-200 pl-3">
                              <p className="text-sm font-semibold">{item.point}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                              <p className="text-xs text-gray-400 italic mt-0.5">{item.insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 pt-4 border-t">
            ※ この分析結果は、入力された記録のみに基づく参考情報です。医療・心理診断・カウンセリング・法律・投資等の専門的判断ではありません。最終的な判断はご自身でお願いします。
          </p>
        </div>
      )}
    </main>
  );
}
