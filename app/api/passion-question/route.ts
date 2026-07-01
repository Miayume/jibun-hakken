import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { answer } = await req.json();
  if (!answer?.trim()) {
    return NextResponse.json({ question: "" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ question: "" });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
  const prompt = `以下の文章の中で最も核心的な言葉やフレーズを1つ選び、「あなたにとって『〇〇』とは何ですか？」という形式の質問を1つだけ出力してください。〇〇には回答者が使った言葉をそのまま入れてください。質問文だけを出力し、それ以外は何も出力しないでください。

回答：${answer.trim()}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json({ question: "" });
  }

  const data = await response.json();
  const question = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  return NextResponse.json({ question });
}
