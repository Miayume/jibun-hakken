import type {
  AIProvider,
  AnalysisContent,
  AnalysisTier,
  JournalEntryForAnalysis,
} from "@/lib/ai/types";

/**
 * APIキー未取得時のローカル開発用プロバイダー。
 * 実際のAI推論は行わず、記録内容から決定的な簡易集計を行い、
 * 本番のClaude/Geminiプロバイダーと同じ形のダミー分析結果を返す。
 */
export class MockAIProvider implements AIProvider {
  async analyze({
    entries,
    tier,
  }: {
    entries: JournalEntryForAnalysis[];
    tier: AnalysisTier;
  }): Promise<AnalysisContent> {
    const wakuwaku = entries.filter((e) => e.type === "wakuwaku");
    const stress = entries.filter((e) => e.type === "stress");

    const withOthers = wakuwaku.filter((e) => e.withWho && e.withWho.trim() !== "");
    const alone = wakuwaku.length - withOthers.length;

    const detailLevel = tier === "simple" ? 1 : tier === "detailed" ? 2 : 3;
    const pick = (lines: string[]) => lines.slice(0, detailLevel + 1);

    return {
      summary: `これまでに記録された${entries.length}件（ワクワク${wakuwaku.length}件・ストレス${stress.length}件）の記録から、傾向を分析しました。記録が増えるほど精度が上がります。`,
      work: {
        suitableJobs: pick(["記録内容から、企画・アイデア出しを伴う仕事との相性が良い傾向があります。"]),
        suitableRoles: pick(["教える・伝える役割に強みがある可能性があります。"]),
        suitableWorkStyle: pick(["他者と協働するスタイルに充実感を見出す可能性があります。"]),
      },
      lifestyle: {
        suitableLifestyle: pick([
          "規則的な生活リズムが幸福感の高さと結びついている可能性があります。",
        ]),
      },
      environment: {
        happyEnvironment: pick([
          "屋外や開放的な場所での記録にワクワクが多く見られる傾向があります。",
        ]),
      },
      relationships: {
        happyRelationships: pick([
          withOthers.length >= alone
            ? "一人で過ごす時間より、誰かと一緒にいる時間にワクワクを感じやすい傾向があります。"
            : "一人で過ごす時間にも十分な満足感を得られている可能性があります。",
        ]),
        compatibility: pick([
          "理解力が高いと感じる相手との対話で幸福度が上がる傾向が記録から推測されます。",
        ]),
      },
      happiness: {
        conditions: pick(["達成感を伴う出来事の記録で幸福度が高い傾向があります。"]),
        suggestions: pick([
          "ワクワクを感じる活動を週の予定に意識的に組み込むことが提案として考えられます。",
        ]),
      },
      stress: {
        commonPatterns: pick([
          stress.length > 0
            ? "予期しない変化や急な対応を求められる場面でストレスを感じやすい傾向があります。"
            : "現時点ではストレスの記録が少なく、傾向を判断するにはさらに記録が必要です。",
        ]),
        growthStress: pick(["責任を伴う課題への対応が、後に成長として振り返られている可能性があります。"]),
        avoidStress: pick(["人間関係に関するストレスは避けた方が良い傾向が記録から推測されます。"]),
      },
      values: {
        current: pick(["成長や挑戦を大切にする価値観が記録から推測されます。"]),
        changeOverTime: tier === "full" ? pick(["記録期間を通じて、挑戦を重視する価値観がより強まっている可能性があります。"]) : [],
      },
      thinkingAndAction: {
        problemApproach: pick(["課題に直面したとき、すぐに行動して解決しようとする傾向が記録から見られます。"]),
        futurePatterns: pick(["新しいことに挑戦する行動パターンが繰り返し見られます。"]),
        actionSuggestions: pick(["ワクワクを感じた活動を記録し、再現できるよう意識することが提案として考えられます。"]),
      },
      strengths: pick([
        "記録から、人に教える・伝えることに強みがある可能性があります。",
        "新しい状況に適応する力に強みがある傾向が見られます。",
      ]),
    };
  }
}
