import type { AIProvider, AnalysisContent, AnalysisTier, JournalEntryForAnalysis, UserProfileForAnalysis } from "@/lib/ai/types";
import { SYSTEM_PROMPT, buildUserPrompt, parseAnalysisJson } from "@/lib/ai/prompts";

export class GeminiAIProvider implements AIProvider {
  async analyze({
    entries,
    tier,
    profile,
  }: {
    entries: JournalEntryForAnalysis[];
    tier: AnalysisTier;
    profile?: UserProfileForAnalysis | null;
  }): Promise<AnalysisContent> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY が設定されていません。AI_PROVIDER=mock に設定するか、APIキーを設定してください。"
      );
    }

    // gemini-2.0-flash-lite は無料枠の1日あたりのリクエスト上限が高く、
    // 本サービスのような軽量なJSON抽出タスクには十分な性能のため既定値とする
    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: buildUserPrompt(entries, tier, profile) }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return parseAnalysisJson(text) as AnalysisContent;
  }
}
