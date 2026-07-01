"use client";

import { useState } from "react";

const QUESTIONS = [
  "最高に自分らしく生きている自分は、どのような状況ですか？",
  "その時のあなたは、どのような表情をしていますか？好きな芸能人や有名人でも構いませんので、一番近い表情を書いてください。",
  "その時、あなたの隣には誰がいますか？",
  "あなたはどこにいますか？",
  "あなたの周りには何が見えますか？",
  "どんな音が聞こえますか？",
  "どんな香りがしますか？",
  "その空間には何が置いてありますか？",
];

export default function VisionSection({ initialAnswers }: { initialAnswers?: Record<string, string> | null }) {
  const [answers, setAnswers] = useState<string[]>(
    Array(8).fill("").map((_, i) => initialAnswers?.[`q${i + 1}`] ?? "")
  );

  function update(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="visionAnswers"
        value={JSON.stringify(
          Object.fromEntries(answers.map((a, i) => [`q${i + 1}`, a]))
        )}
      />
      <h2 className="font-medium">10. 最高の自分をイメージしてください</h2>
      <div className="space-y-4">
        {QUESTIONS.map((q, i) => (
          <div key={i}>
            <label className="block text-sm mb-1">{q}</label>
            <input
              type="text"
              value={answers[i]}
              onChange={(e) => update(i, e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
