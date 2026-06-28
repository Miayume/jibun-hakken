import type { AIProvider, AnalysisContent, AnalysisTier, JournalEntryForAnalysis } from "@/lib/ai/types";
import { SYSTEM_PROMPT, buildUserPrompt, parseAnalysisJson } from "@/lib/ai/prompts";

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
    return parseAnalysisJson(text) as AnalysisContent;
  }
}
