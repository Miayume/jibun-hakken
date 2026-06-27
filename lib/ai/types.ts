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
  work: string[];
  lifestyle: string[];
  environment: string[];
  relationships: string[];
  happiness: string[];
  stress: string[];
  values: string[];
  thinkingAndAction: string[];
  strengths: string[];
  summary: string;
}

export interface AIProvider {
  analyze(params: {
    entries: JournalEntryForAnalysis[];
    tier: AnalysisTier;
    scope: AnalysisScope;
  }): Promise<AnalysisContent>;
}
