"use client";

import { useState } from "react";

interface PassionItem {
  item?: string;
  why1?: string;
  why2?: string;
  why3?: string;
}

function PassionCard({
  index,
  initial,
}: {
  index: number;
  initial?: PassionItem;
}) {
  const [q3Label, setQ3Label] = useState("2で答えた内容は、なぜ好きだったと思いますか？");
  const [q4Label, setQ4Label] = useState("3で答えた内容は、なぜ好きだったと思いますか？");
  const [q3Loading, setQ3Loading] = useState(false);
  const [q4Loading, setQ4Loading] = useState(false);

  async function generateQ3(answer: string) {
    if (!answer.trim()) return;
    setQ3Loading(true);
    try {
      const res = await fetch("/api/passion-question", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const { question } = await res.json();
      if (question) setQ3Label(question);
    } finally {
      setQ3Loading(false);
    }
  }

  async function generateQ4(answer: string) {
    if (!answer.trim()) return;
    setQ4Loading(true);
    try {
      const res = await fetch("/api/passion-question", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const { question } = await res.json();
      if (question) setQ4Label(question);
    } finally {
      setQ4Loading(false);
    }
  }

  return (
    <div className="rounded border border-gray-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-700">
        {index + 1}つ目{index === 0 ? "（必須）" : "（任意）"}
      </p>

      <div>
        <label className="block text-sm mb-1">今まで時間を忘れて没頭したものは何ですか？</label>
        <input
          type="text"
          name={`p${index}_item`}
          defaultValue={initial?.item ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="例：恐竜の図鑑、ゲーム、料理"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">なぜ、それに魅力を感じていたと思いますか？</label>
        <input
          type="text"
          name={`p${index}_why1`}
          defaultValue={initial?.why1 ?? ""}
          onBlur={(e) => generateQ3(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">
          {q3Loading ? "質問を生成中..." : q3Label}
        </label>
        <input
          type="text"
          name={`p${index}_why2`}
          defaultValue={initial?.why2 ?? ""}
          onBlur={(e) => generateQ4(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">
          {q4Loading ? "質問を生成中..." : q4Label}
        </label>
        <input
          type="text"
          name={`p${index}_why3`}
          defaultValue={initial?.why3 ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

export default function PassionSection({
  initialPassions,
}: {
  initialPassions?: PassionItem[] | null;
}) {
  const [count, setCount] = useState(
    initialPassions && initialPassions.length > 0 ? initialPassions.length : 1
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-700 leading-relaxed mb-4 p-4 bg-amber-50 rounded border border-amber-100">
          好きだと感じるものには、あなた自身の価値観や感性が表れています。何が好きなのかを深く知ることで、自分らしさが見えてきます。そして、その自分らしさの中に、あなたの才能があります。
        </p>
        <h2 className="font-medium mb-3">8. 時間を忘れて没頭したもの</h2>

        <div className="space-y-5">
          {Array.from({ length: count }, (_, i) => (
            <PassionCard key={i} index={i} initial={initialPassions?.[i]} />
          ))}
        </div>

        {count < 3 && (
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="mt-3 text-sm text-gray-500 border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-50"
          >
            ＋ {count + 1}つ目を追加（任意）
          </button>
        )}
      </div>
    </div>
  );
}
