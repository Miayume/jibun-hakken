import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildProfileContext } from "@/lib/ai/prompts";
import type { AnalysisContent, PassionItem } from "@/lib/ai/types";

const COACH_SYSTEM_PROMPT = `あなたは「自分発見・人生設計」アプリの専属パーソナルコーチです。
ユーザーが日々の記録・プロフィール・分析結果をもとに、自分らしい生き方・仕事・人生設計を考える手助けをしてください。

会話スタイル：
- 親しみやすく、でも的確に。タメ口ではなく丁寧語で
- ユーザーの記録・分析から読み取れることを具体的に引用しながら答える
- 一般論ではなく、この人の情報をもとにした個別の回答をする
- 長すぎず、でも大事なことはしっかり伝える（200〜400字程度を目安）

禁止事項：
- 医療・心理診断・カウンセリング・法律・投資等の専門的判断は行わない
- 「絶対に〜」「必ず〜」など断言しすぎない表現は避ける`;

function buildAnalysisContext(content: AnalysisContent): string {
  const lines: string[] = ["【あなたの分析結果（要点）】"];

  if (content.summary) lines.push(`総合: ${content.summary}`);

  const strengths = content.strengths?.slice(0, 3);
  if (strengths?.length) {
    lines.push("強み: " + strengths.map((s) => s.point).join("、"));
  }

  const aptitude = content.aptitudeRanking?.slice(0, 3);
  if (aptitude?.length) {
    lines.push("適性: " + aptitude.map((a) => `${a.rank}位 ${a.type}`).join("、"));
  }

  const jobs = content.work?.suitableJobs?.slice(0, 2);
  if (jobs?.length) {
    lines.push("向いている仕事: " + jobs.map((j) => j.point).join("、"));
  }

  const workStyle = content.work?.suitableWorkStyle?.slice(0, 2);
  if (workStyle?.length) {
    lines.push("向いている働き方: " + workStyle.map((w) => w.point).join("、"));
  }

  const stress = content.stress?.avoidStress?.slice(0, 2);
  if (stress?.length) {
    lines.push("避けるべきストレス: " + stress.map((s) => s.point).join("、"));
  }

  return lines.join("\n");
}

function buildEntriesContext(entries: { type: string; what: string | null; whyFeeling: string | null; whyStress: string | null; createdAt: Date }[]): string {
  if (!entries.length) return "";
  const lines = ["【最近の記録（抜粋）】"];
  for (const e of entries.slice(-8)) {
    const label = e.type === "wakuwaku" ? "ワクワク" : "ストレス";
    const content = e.what ?? e.whyFeeling ?? e.whyStress ?? "";
    if (content) lines.push(`- [${label}] ${content}`);
  }
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { message, history } = (await req.json()) as {
    message: string;
    history: { role: "user" | "model"; content: string }[];
  };

  if (!message?.trim()) return NextResponse.json({ reply: "" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ reply: "AIキーが設定されていません。" });

  const [profileRow, latestAnalysis, entries] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.analysisResult.findFirst({
      where: { userId, scope: "recent30" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.entry.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { type: true, what: true, whyFeeling: true, whyStress: true, createdAt: true },
    }),
  ]);

  const profileContext = profileRow
    ? buildProfileContext({
        ...profileRow,
        passions: profileRow.passions ? (JSON.parse(profileRow.passions) as PassionItem[]) : null,
        personalityWords: profileRow.personalityWords ? (JSON.parse(profileRow.personalityWords) as string[]) : null,
        visionAnswers: profileRow.visionAnswers ? (JSON.parse(profileRow.visionAnswers) as Record<string, string>) : null,
      })
    : "";

  const analysisContext = latestAnalysis
    ? buildAnalysisContext(JSON.parse(latestAnalysis.content) as AnalysisContent)
    : "";

  const entriesContext = buildEntriesContext(entries);

  const userContext = [profileContext, analysisContext, entriesContext].filter(Boolean).join("\n\n");

  const systemText = userContext
    ? `${COACH_SYSTEM_PROMPT}\n\n以下はこのユーザーの情報です。これをもとに回答してください：\n\n${userContext}`
    : COACH_SYSTEM_PROMPT;

  const contents = [
    ...history.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json({ reply: "エラーが発生しました。しばらくしてから再試行してください。" });
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return NextResponse.json({ reply });
}
