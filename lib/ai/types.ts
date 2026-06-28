export type AnalysisTier = "simple" | "detailed" | "full";
export type AnalysisScope = "recent30" | "recent100" | "all";

export interface JournalEntryForAnalysis {
  type: "wakuwaku" | "stress";
  what: string | null;
  doingWhat: string | null;
  withWho: string | null;
  whoPerson: string | null;
  whoGoodPoint: string | null;
  whyStress: string | null;
  whereWas: string | null;
  whyFeeling: string | null;
  mostImpressive: string | null;
  futureUseful: string | null;
  futureImprove: string | null;
  createdAt: Date;
}

export interface AnalysisItem {
  point: string; // 短い結論（5〜15字程度のキーワード・フレーズ）
  reason: string; // 記録の具体的な内容に基づいた、なぜそう思ったかの一文
  insight: string; // そこから読み取れる、その人についての一段深い解釈（一文）
}

export interface AnalysisContent {
  summary: string;
  work: {
    suitableJobs: AnalysisItem[]; // 自分に合う仕事
    suitableRoles: AnalysisItem[]; // 自分に合う役割
    suitableWorkStyle: AnalysisItem[]; // 自分に合う働き方
  };
  lifestyle: {
    suitableLifestyle: AnalysisItem[]; // 自分に合うライフスタイル
  };
  environment: {
    happyEnvironment: AnalysisItem[]; // 自分が幸せになれる環境
  };
  relationships: {
    happyRelationships: AnalysisItem[]; // 自分が幸せになれる人間関係
    compatibility: AnalysisItem[]; // どんな人と相性が良いか・悪いか
  };
  happiness: {
    conditions: AnalysisItem[]; // 自分が幸福を感じる条件
    suggestions: AnalysisItem[]; // 幸福を感じる時間・体験を増やす具体的な提案
  };
  stress: {
    commonPatterns: AnalysisItem[]; // ストレスを感じる共通点
    growthStress: AnalysisItem[]; // 成長につながるストレス
    avoidStress: AnalysisItem[]; // 避けるべきストレス
  };
  values: {
    current: AnalysisItem[]; // 自分の価値観
    changeOverTime: AnalysisItem[]; // 時間とともに変化した価値観
  };
  thinkingAndAction: {
    problemApproach: AnalysisItem[]; // 問題への向き合い方
    futurePatterns: AnalysisItem[]; // 将来の目標や行動パターン
    actionSuggestions: AnalysisItem[]; // 今後の行動への具体的な提案
  };
  strengths: AnalysisItem[]; // 自分の強み
}

export interface AIProvider {
  analyze(params: {
    entries: JournalEntryForAnalysis[];
    tier: AnalysisTier;
    scope: AnalysisScope;
  }): Promise<AnalysisContent>;
}
