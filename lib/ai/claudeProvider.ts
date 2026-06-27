import type {
  AIProvider,
  AnalysisContent,
  AnalysisTier,
  JournalEntryForAnalysis,
} from "@/lib/ai/types";

const TIER_INSTRUCTIONS: Record<AnalysisTier, string> = {
  simple: "各カテゴリにつき1つだけ、最も確信度の高い傾向を簡潔に述べてください。",
  detailed: "各カテゴリにつき2〜3個、記録の根拠が分かるように具体的に述べてください。",
  full: "各カテゴリにつき3〜5個、時系列の変化や複数の記録の組み合わせも踏まえて詳細に述べてください。",
};

const SYSTEM_PROMPT = `あなたは自己理解支援アプリのAI分析エンジンです。
ユーザーが記録した「ワクワク・幸せ」「ストレス」の出来事から、仕事・ライフスタイル・環境・人間関係・幸福・ストレス・価値観・思考と行動・強みについての傾向を分析します。

厳守事項:
- 医療・心理診断・カウンセリング・法律・投資などの専門的判断は行わない。
- 断定的な表現（"〜です" "絶対に" "必ず"）は使わず、「傾向があります」「可能性があります」「記録から推測されます」という表現を必ず使う。
- 最終的な判断はユーザー本人が行うものであり、提案はあくまで参考情報として提示する。
- 出力は指定されたJSON形式のみで返す。説明文や前置きは不要。`;

function buildUserPrompt(
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

次のJSON形式のみで出力してください:
{
  "summary": "string",
  "work": ["string"],
  "lifestyle": ["string"],
  "environment": ["string"],
  "relationships": ["string"],
  "happiness": ["string"],
  "stress": ["string"],
  "values": ["string"],
  "thinkingAndAction": ["string"],
  "strengths": ["string"]
}`;
}

export class ClaudeAIProvider implements AIProvider {
  async analyze({
    entries,
    tier,
  }: {
    entries: JournalEntryForAnalysis[];
    tier: AnalysisTier;
  }): Promise<AnalysisContent> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY が設定されていません。AI_PROVIDER=mock に設定するか、APIキーを設定してください。"
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(entries, tier) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";
    return JSON.parse(text) as AnalysisContent;
  }
}
