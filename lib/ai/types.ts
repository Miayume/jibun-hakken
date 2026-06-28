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

export interface AnalysisContent {
  summary: string;
  work: {
    suitableJobs: string[]; // 自分に合う仕事
    suitableRoles: string[]; // 自分に合う役割
    suitableWorkStyle: string[]; // 自分に合う働き方
  };
  lifestyle: {
    suitableLifestyle: string[]; // 自分に合うライフスタイル
  };
  environment: {
    happyEnvironment: string[]; // 自分が幸せになれる環境
  };
  relationships: {
    happyRelationships: string[]; // 自分が幸せになれる人間関係
    compatibility: string[]; // どんな人と相性が良いか・悪いか
  };
  happiness: {
    conditions: string[]; // 自分が幸福を感じる条件
    suggestions: string[]; // 幸福を感じる時間・体験を増やす具体的な提案
  };
  stress: {
    commonPatterns: string[]; // ストレスを感じる共通点
    growthStress: string[]; // 成長につながるストレス
    avoidStress: string[]; // 避けるべきストレス
  };
  values: {
    current: string[]; // 自分の価値観
    changeOverTime: string[]; // 時間とともに変化した価値観
  };
  thinkingAndAction: {
    problemApproach: string[]; // 問題への向き合い方
    futurePatterns: string[]; // 将来の目標や行動パターン
    actionSuggestions: string[]; // 今後の行動への具体的な提案
  };
  strengths: string[]; // 自分の強み
}

export interface AIProvider {
  analyze(params: {
    entries: JournalEntryForAnalysis[];
    tier: AnalysisTier;
    scope: AnalysisScope;
  }): Promise<AnalysisContent>;
}
