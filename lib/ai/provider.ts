import type { AIProvider } from "@/lib/ai/types";
import { MockAIProvider } from "@/lib/ai/mockProvider";
import { ClaudeAIProvider } from "@/lib/ai/claudeProvider";

export function getAIProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER ?? "mock";
  switch (providerName) {
    case "claude":
      return new ClaudeAIProvider();
    case "mock":
    default:
      return new MockAIProvider();
  }
}
