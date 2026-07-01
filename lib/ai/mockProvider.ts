import type {
  AIProvider,
  AnalysisContent,
  AnalysisItem,
  AnalysisTier,
  JournalEntryForAnalysis,
  UserProfileForAnalysis,
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
    profile?: UserProfileForAnalysis | null;
  }): Promise<AnalysisContent> {
    const wakuwaku = entries.filter((e) => e.type === "wakuwaku");
    const stress = entries.filter((e) => e.type === "stress");

    const withOthers = wakuwaku.filter((e) => e.withWho && e.withWho.trim() !== "");
    const alone = wakuwaku.length - withOthers.length;

    const detailLevel = tier === "simple" ? 1 : tier === "detailed" ? 2 : 3;
    const pick = (items: AnalysisItem[]) => items.slice(0, detailLevel + 1);

    return {
      summary: `これまでに記録された${entries.length}件（ワクワク${wakuwaku.length}件・ストレス${stress.length}件）の記録から、傾向を分析しました。記録が増えるほど精度が上がります。`,
      work: {
        suitableJobs: pick([
          { point: "企画・アイデア出しの仕事", reason: "ワクワクの記録に企画関連の出来事が多いから", insight: "そういう傾向が記録から読み取れます" },
        ]),
        suitableRoles: pick([{ point: "教える・伝える役割", reason: "知識を共有する出来事に満足度が高いから", insight: "そういう傾向が記録から読み取れます" }]),
        suitableWorkStyle: pick([{ point: "協働するスタイル", reason: "他者と一緒に取り組む記録に充実感が見られるから", insight: "そういう傾向が記録から読み取れます" }]),
      },
      lifestyle: {
        suitableLifestyle: pick([
          { point: "規則的な生活リズム", reason: "生活リズムに関する記録と幸福感が結びついているから", insight: "そういう傾向が記録から読み取れます" },
        ]),
      },
      environment: {
        happyEnvironment: pick([
          { point: "屋外や開放的な場所", reason: "屋外での記録にワクワクが多く見られるから", insight: "そういう傾向が記録から読み取れます" },
        ]),
      },
      relationships: {
        happyRelationships: pick([
          withOthers.length >= alone
            ? { point: "誰かと一緒にいる時間", reason: "一人より誰かと一緒の記録にワクワクが多いから", insight: "そういう傾向が記録から読み取れます" }
            : { point: "一人で過ごす時間", reason: "一人の記録でも満足度が高いから", insight: "そういう傾向が記録から読み取れます" },
        ]),
        compatibility: pick([
          { point: "理解力が高い人と合う", reason: "対話が深い記録ほど幸福度が高いから", insight: "そういう傾向が記録から読み取れます" },
        ]),
      },
      happiness: {
        conditions: pick([{ point: "達成感のある出来事", reason: "達成に関する記録で幸福度が高いから", insight: "そういう傾向が記録から読み取れます" }]),
        suggestions: pick([
          { point: "ワクワクを予定に組み込む", reason: "ワクワクした活動の記録が幸福度と結びついているから", insight: "そういう傾向が記録から読み取れます" },
        ]),
      },
      stress: {
        commonPatterns: pick([
          stress.length > 0
            ? { point: "予期しない変化", reason: "急な対応を求められた記録にストレスが多いから", insight: "そういう傾向が記録から読み取れます" }
            : { point: "判断にはまだ記録が必要", reason: "ストレスの記録がまだ少ないから", insight: "そういう傾向が記録から読み取れます" },
        ]),
        growthStress: pick([
          { point: "責任を伴う課題", reason: "対応後に成長として振り返られている記録があるから", insight: "そういう傾向が記録から読み取れます" },
        ]),
        avoidStress: pick([
          { point: "人間関係のストレス", reason: "人間関係に関するストレスの記録が見られるから", insight: "そういう傾向が記録から読み取れます" },
        ]),
      },
      values: {
        current: pick([{ point: "成長や挑戦", reason: "挑戦に関する記録が複数あるから", insight: "そういう傾向が記録から読み取れます" }]),
        changeOverTime:
          tier === "full"
            ? pick([{ point: "挑戦をより重視する変化", reason: "記録期間の後半に挑戦への言及が増えているから", insight: "そういう傾向が記録から読み取れます" }])
            : [],
      },
      thinkingAndAction: {
        problemApproach: pick([
          { point: "すぐに行動して解決", reason: "課題への対応を記録した内容に行動の早さが見られるから", insight: "そういう傾向が記録から読み取れます" },
        ]),
        futurePatterns: pick([{ point: "新しいことへの挑戦", reason: "挑戦に関する記録が繰り返し見られるから", insight: "そういう傾向が記録から読み取れます" }]),
        actionSuggestions: pick([
          { point: "ワクワクの記録を増やす", reason: "ワクワクした活動の記録が幸福度と結びついているから", insight: "そういう傾向が記録から読み取れます" },
        ]),
      },
      strengths: pick([
        { point: "教える・伝える力", reason: "知識を共有する記録に満足度が高いから", insight: "そういう傾向が記録から読み取れます" },
        { point: "新しい状況への適応力", reason: "変化のある記録にも前向きな反応が見られるから", insight: "そういう傾向が記録から読み取れます" },
      ]),
      trends: {
        valueChanges:
          tier === "simple"
            ? []
            : pick([
                { point: "人との関わりをより重視するようになった", reason: "記録の後半ほど他者との交流に関するワクワクが増えているから", insight: "人との関わりに対する価値観が少しずつ変化しているのかもしれません" },
              ]),
        stressPatterns:
          tier === "simple"
            ? []
            : pick([
                { point: "予期しない変化が続くとつらくなる", reason: "急な対応を求められた記録が時系列で増えている時期にストレス記録も多いから", insight: "変化が重なる時期を事前に把握しておくと、自分を守りやすくなるかもしれません" },
              ]),
        bestDayTraits: pick([
          { point: "達成感＋誰かとの共有", reason: "ワクワク記録の中で満足度が特に高いものは、何かを達成して誰かに話した日が多いから", insight: "成果を一人で終わらせずに共有できる環境が、一番充実感につながるのかもしれません" },
        ]),
      },
      nextActions:
        tier === "simple"
          ? []
          : pick([
              { point: "今週1回、誰かに近況を話す時間を作る", reason: "他者との対話に関する記録でワクワク度が高いものが多いから", insight: "やってみることで、どんな相手や話題が自分に合うか分かってくるかもしれません" },
              { point: "「良かったこと」を記録した直後にその理由も1行追記する", reason: "理由まで書いた記録ほど後から読み返したときの気づきが多い傾向があるから", insight: "習慣にすると、自分のワクワクのパターンがより見えやすくなるかもしれません" },
            ]),
    };
  }
}
