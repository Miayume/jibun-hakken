import type { AnalysisTier, JournalEntryForAnalysis, UserProfileForAnalysis } from "@/lib/ai/types";

const TIER_INSTRUCTIONS: Record<AnalysisTier, string> = {
  simple: "各項目につき1つだけ、最も確信度の高い傾向を述べてください。記録が少ないため確信が持てない項目は、空配列 [] にしてください。trendsの各項目・nextActionsは記録が少ないため空配列 [] にしてください。",
  detailed: "各項目につき2〜3個述べてください。trendsは記録の前半と後半を比べて変化を述べてください（変化が読み取れない場合は空配列）。nextActionsは2〜3個述べてください。",
  full: "各項目につき3〜5個述べてください。trendsは記録の前半と後半、また時間の流れに沿った変化を詳しく述べてください。nextActionsは3〜5個、できるだけ具体的な行動（いつ・何をする）を述べてください。",
};

export const SYSTEM_PROMPT = `あなたは自己理解支援アプリのAI分析エンジンです。
ユーザーが記録した「ワクワク・幸せ」「ストレス」の出来事から、仕事・ライフスタイル・環境・人間関係・幸福・ストレス・価値観・思考と行動・強みについての傾向を分析します。

厳守事項:
- 医療・心理診断・カウンセリング・法律・投資などの専門的判断は行わない。
- 最終的な判断はユーザー本人が行うものであり、提案はあくまで参考情報として提示する。
- 出力は指定されたJSON形式のみで返す。説明文や前置きは不要。

出力の形式（最重要・必ず守ること）:
各項目は { "point": "結論", "reason": "理由", "insight": "そこから読み取れること" } の3点セットで出力する。

- point（結論）: 文章ではなく「短いキーワード・フレーズ」にする。5〜15字程度。「です」「ます」のような文末は使わず、「〜な人」「〜なこと」のような名詞フレーズで終える。
- reason（理由）: なぜそう判断したのかを、ユーザーが実際に記録した内容に基づいて1文で具体的に書く。一般論や当てずっぽうの理由（例:「頭の回転が速いから」のような記録に基づかない説明）は禁止。必ず記録中の具体的な発言・出来事を根拠にする。
- insight（そこから読み取れること）: reasonの内容から一段深く解釈し、「その人がどういう人なのか」についての洞察を1文で書く。断定はせず、「〜なのかもしれません」「〜という傾向がうかがえます」のような柔らかい表現を使う。
- reasonとinsightの言葉づかいは、高校生でも分かるくらいの簡単な言葉を使う。難しい漢字や専門用語、堅い言い回し（例:「示唆される」「推察される」「醸成」）は避け、普段の会話で使うような分かりやすい言葉にする。

良い例（記録に「1つ言ったことを5つぐらい理解できる頭の人じゃないととてもストレスを感じるタイプ」とある場合):
{
  "point": "理解が早い人と合う",
  "reason": "一を聞いて十を分かる人じゃないといらいらするタイプだから",
  "insight": "効率的な意思疎通を重視する人なのかもしれません"
}

悪い例（理由が記録に基づかない一般論）:
{ "point": "理解が早い人と合う", "reason": "頭の回転が速いからです", "insight": "..." }

良い例（記録に「ラベンダーファームでいい香りがしていい景色が見れて本当に癒しの空間で最高でした」とある場合）:
{
  "point": "自然が多く美しい場所",
  "reason": "ラベンダーファームの香りと景色に癒しを感じていたから",
  "insight": "五感で感じる心地よさを大切にする人なのかもしれません"
}

nextActionsの良い例（行動が具体的で、記録から来ている理由が明確な場合）:
{
  "point": "週1回、自然の多い場所に行く時間を作る",
  "reason": "ラベンダーファームや公園での記録に幸福度が高いものが多いから",
  "insight": "実際に行ってみることで、どんな自然環境が一番自分に合うか分かってくるかもしれません"
}

trendsのvalueChangesの良い例（前半と後半で変化が読み取れる場合）:
{
  "point": "人と会うことをより重視するようになった",
  "reason": "記録の前半は一人での活動が多かったのに、後半は誰かと一緒の記録が増えてワクワク度も上がっているから",
  "insight": "人との関わりに対する見方や価値観が少しずつ変化しているのかもしれません"
}`;

export function buildProfileContext(profile: UserProfileForAnalysis): string {
  const lines: string[] = ["【ユーザーのプロフィール情報】"];
  if (profile.ageRange) lines.push(`- 年代: ${profile.ageRange}`);
  if (profile.gender) lines.push(`- 性別: ${profile.gender}`);
  if (profile.prefecture) lines.push(`- 居住地: ${profile.prefecture}`);
  if (profile.industry) lines.push(`- 業界: ${profile.industry}`);
  if (profile.jobType) lines.push(`- 職種: ${profile.jobType}`);
  if (profile.employmentType) lines.push(`- 雇用形態: ${profile.employmentType}`);
  if (profile.workStyle) lines.push(`- 働き方: ${profile.workStyle}`);

  if (profile.passions && profile.passions.length > 0) {
    lines.push("\n【没頭体験の深掘り】");
    profile.passions.forEach((p, i) => {
      if (!p.item) return;
      lines.push(`${i + 1}. 没頭したこと: ${p.item}`);
      if (p.why1) lines.push(`   なぜ好きか: ${p.why1}`);
      if (p.why2) lines.push(`   どこが好きか: ${p.why2}`);
      if (p.why3) lines.push(`   本質的に惹かれていたもの: ${p.why3}`);
    });
  }

  if (profile.supplementQ1 || profile.supplementQ2 || profile.supplementQ3) {
    lines.push("\n【補足情報】");
    if (profile.supplementQ1) lines.push(`- 今の仕事で同じ興奮を感じた瞬間: ${profile.supplementQ1}`);
    if (profile.supplementQ2) lines.push(`- お金がなくてもやり続けられること: ${profile.supplementQ2}`);
    if (profile.supplementQ3) lines.push(`- 他人が苦痛なことを自分だけ楽しいと感じること: ${profile.supplementQ3}`);
  }

  if (profile.visionAnswers && Object.values(profile.visionAnswers).some(Boolean)) {
    lines.push("\n【最高の自分のビジョン】");
    const vq = [
      "最高に自分らしく生きている状況",
      "その時の表情",
      "隣にいる人",
      "いる場所",
      "周りに見えるもの",
      "聞こえる音",
      "香り",
      "空間に置いてあるもの",
    ];
    vq.forEach((label, i) => {
      const val = profile.visionAnswers?.[`q${i + 1}`];
      if (val) lines.push(`- ${label}: ${val}`);
    });
  }

  if (profile.personalityWords && profile.personalityWords.length > 0) {
    lines.push("\n【自分らしいと思う言葉（選択済み）】");
    lines.push(profile.personalityWords.join("、"));
    lines.push("※ この言葉の選択をもとに適性ランキングを生成してください。");
  }

  return lines.join("\n");
}

export function buildUserPrompt(
  entries: JournalEntryForAnalysis[],
  tier: AnalysisTier,
  profile?: UserProfileForAnalysis | null
): string {
  const entriesText = entries
    .map((e, i) => {
      const lines = [
        `--- 記録${i + 1}（${e.type === "wakuwaku" ? "ワクワク・幸せ" : "ストレス"} / ${e.createdAt.toISOString()}）---`,
        e.what && `出来事: ${e.what}`,
        e.doingWhat && `していたこと: ${e.doingWhat}`,
        e.withWho && `一緒にいた人: ${e.withWho}`,
        e.whoPerson && `相手の人柄: ${e.whoPerson}`,
        e.whoGoodPoint && `相手の良かった点: ${e.whoGoodPoint}`,
        e.whereWas && `場所: ${e.whereWas}`,
        e.whyFeeling && `感じた理由: ${e.whyFeeling}`,
        e.whyStress && `ストレスの理由: ${e.whyStress}`,
        e.mostImpressive && `印象に残った点: ${e.mostImpressive}`,
        e.futureUseful && `将来役立つと思うか: ${e.futureUseful}`,
        e.futureImprove && `良い経験にする方法: ${e.futureImprove}`,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");

  const profileContext = profile ? buildProfileContext(profile) : "";

  return `${profileContext ? profileContext + "\n\n" : ""}以下はユーザーの記録です。${TIER_INSTRUCTIONS[tier]}

${entriesText}

次のJSON形式のみで出力してください。各項目は配列で、配列の要素は { "point": "...", "reason": "...", "insight": "..." } の形にしてください。各項目名の意味は日本語コメントの通りです:
{
  "summary": "string",
  "work": {
    "suitableJobs": [{ "point": "string", "reason": "string", "insight": "string" }],       // 自分に合う仕事
    "suitableRoles": [{ "point": "string", "reason": "string", "insight": "string" }],      // 自分に合う役割
    "suitableWorkStyle": [{ "point": "string", "reason": "string", "insight": "string" }]   // 自分に合う働き方
  },
  "lifestyle": {
    "suitableLifestyle": [{ "point": "string", "reason": "string", "insight": "string" }]   // 自分に合うライフスタイル
  },
  "environment": {
    "happyEnvironment": [{ "point": "string", "reason": "string", "insight": "string" }]    // 自分が幸せになれる環境
  },
  "relationships": {
    "happyRelationships": [{ "point": "string", "reason": "string", "insight": "string" }], // 自分が幸せになれる人間関係
    "compatibility": [{ "point": "string", "reason": "string", "insight": "string" }]       // どんな人と相性が良いか・悪いか
  },
  "happiness": {
    "conditions": [{ "point": "string", "reason": "string", "insight": "string" }],         // 自分が幸福を感じる条件
    "suggestions": [{ "point": "string", "reason": "string", "insight": "string" }]         // 幸福を感じる時間・体験を日常生活で増やすための具体的な提案
  },
  "stress": {
    "commonPatterns": [{ "point": "string", "reason": "string", "insight": "string" }],     // ストレスを感じる共通点
    "growthStress": [{ "point": "string", "reason": "string", "insight": "string" }],       // 成長につながるストレス
    "avoidStress": [{ "point": "string", "reason": "string", "insight": "string" }]         // 避けるべきストレス
  },
  "values": {
    "current": [{ "point": "string", "reason": "string", "insight": "string" }],            // 自分の価値観
    "changeOverTime": [{ "point": "string", "reason": "string", "insight": "string" }]      // 時間とともに変化した価値観（記録が少ない場合は空配列）
  },
  "thinkingAndAction": {
    "problemApproach": [{ "point": "string", "reason": "string", "insight": "string" }],    // 問題への向き合い方
    "futurePatterns": [{ "point": "string", "reason": "string", "insight": "string" }],     // 将来の目標や行動パターン
    "actionSuggestions": [{ "point": "string", "reason": "string", "insight": "string" }]   // 今後の行動への具体的な提案
  },
  "strengths": [{ "point": "string", "reason": "string", "insight": "string" }],            // 自分の強み
  "trends": {
    "valueChanges": [{ "point": "string", "reason": "string", "insight": "string" }],       // 価値観・優先順位の変化（記録の前半と後半を比較。変化なければ空配列）
    "stressPatterns": [{ "point": "string", "reason": "string", "insight": "string" }],     // ストレスが増えているパターン（時系列で増加傾向があるもの。なければ空配列）
    "bestDayTraits": [{ "point": "string", "reason": "string", "insight": "string" }]       // 一番充実していた・ワクワクした記録の共通点
  },
  "nextActions": [{ "point": "string", "reason": "string", "insight": "string" }],          // 次の1週間で試すとよい具体的な行動（pointは行動そのもの、reasonは記録のどんな傾向から来ているか、insightは試すことで何が分かりそうか）
  "aptitudeRanking": [{ "rank": 1, "type": "string", "reason": "string" }]                  // 適性ランキング上位3つ。言葉の選択がない場合は空配列。タイプは以下から選ぶ: 経営者タイプ、リーダータイプ、起業家タイプ、クリエイタータイプ、研究者タイプ、教育者タイプ、コミュニケータータイプ、サポータータイプ、プロジェクトマネージャータイプ。選んだ言葉だけを根拠にし、推測しない。
}`;
}

export function parseAnalysisJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
  return JSON.parse(cleaned);
}
