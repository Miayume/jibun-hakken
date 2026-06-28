import type { AnalysisTier, JournalEntryForAnalysis } from "@/lib/ai/types";

const TIER_INSTRUCTIONS: Record<AnalysisTier, string> = {
  simple: "各項目につき1つだけ、最も確信度の高い傾向を簡潔に述べてください。記録が少ないため確信が持てない項目は、空配列 [] にしてください。",
  detailed: "各項目につき2〜3個、記録の根拠が分かるように具体的に述べてください。",
  full: "各項目につき3〜5個、時系列の変化や複数の記録の組み合わせも踏まえて詳細に述べてください。「時間とともに変化した価値観」は、記録の前半と後半を比較して変化があれば具体的に述べてください。",
};

export const SYSTEM_PROMPT = `あなたは自己理解支援アプリのAI分析エンジンです。
ユーザーが記録した「ワクワク・幸せ」「ストレス」の出来事から、仕事・ライフスタイル・環境・人間関係・幸福・ストレス・価値観・思考と行動・強みについての傾向を分析します。

厳守事項:
- 医療・心理診断・カウンセリング・法律・投資などの専門的判断は行わない。
- 断定的な表現（"〜です" "絶対に" "必ず"）は使わず、「傾向があります」「可能性があります」「記録から推測されます」という表現を必ず使う。
- 最終的な判断はユーザー本人が行うものであり、提案はあくまで参考情報として提示する。
- 出力は指定されたJSON形式のみで返す。説明文や前置きは不要。`;

export function buildUserPrompt(
  entries: JournalEntryForAnalysis[],
  tier: AnalysisTier
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

  return `以下はユーザーの記録です。${TIER_INSTRUCTIONS[tier]}

${entriesText}

次のJSON形式のみで出力してください。各項目名の意味は日本語コメントの通りです:
{
  "summary": "string",
  "work": {
    "suitableJobs": ["string"],       // 自分に合う仕事
    "suitableRoles": ["string"],      // 自分に合う役割
    "suitableWorkStyle": ["string"]   // 自分に合う働き方
  },
  "lifestyle": {
    "suitableLifestyle": ["string"]   // 自分に合うライフスタイル
  },
  "environment": {
    "happyEnvironment": ["string"]    // 自分が幸せになれる環境
  },
  "relationships": {
    "happyRelationships": ["string"], // 自分が幸せになれる人間関係
    "compatibility": ["string"]       // どんな人と相性が良いか・悪いか
  },
  "happiness": {
    "conditions": ["string"],         // 自分が幸福を感じる条件
    "suggestions": ["string"]         // 幸福を感じる時間・体験を日常生活で増やすための具体的な提案
  },
  "stress": {
    "commonPatterns": ["string"],     // ストレスを感じる共通点
    "growthStress": ["string"],       // 成長につながるストレス
    "avoidStress": ["string"]         // 避けるべきストレス
  },
  "values": {
    "current": ["string"],            // 自分の価値観
    "changeOverTime": ["string"]      // 時間とともに変化した価値観（記録が少ない場合は空配列）
  },
  "thinkingAndAction": {
    "problemApproach": ["string"],    // 問題への向き合い方
    "futurePatterns": ["string"],     // 将来の目標や行動パターン
    "actionSuggestions": ["string"]   // 今後の行動への具体的な提案
  },
  "strengths": ["string"]             // 自分の強み
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
