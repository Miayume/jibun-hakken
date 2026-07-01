"use client";

import { useState } from "react";

interface PassionItem {
  item: string;
  why1: string;
  why2: string;
  why3: string;
}

const empty = (): PassionItem => ({ item: "", why1: "", why2: "", why3: "" });

export default function PassionSection() {
  const [passions, setPassions] = useState<PassionItem[]>([empty()]);

  function update(index: number, field: keyof PassionItem, value: string) {
    setPassions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  return (
    <div className="space-y-6">
      <input
        type="hidden"
        name="passions"
        value={JSON.stringify(passions)}
      />

      <div>
        <p className="text-sm text-gray-700 leading-relaxed mb-4 p-4 bg-amber-50 rounded border border-amber-100">
          好きだと思えるのは、あなたの中にもその感性があるから好きになれるんです。何が自分の好きなのかが分かると、自分らしさの形が見えてきて、自分の才能が見えてくるんです。
        </p>
        <h2 className="font-medium mb-1">8. 時間を忘れて没頭したもの</h2>
        <p className="text-xs text-gray-500 mb-3">
          今でも昔でも構いません。好きなキャラクター、集めていたもの、繰り返しやっていたこと、何でも。
        </p>

        <div className="space-y-5">
          {passions.map((p, i) => (
            <div key={i} className="rounded border border-gray-200 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {i + 1}つ目{i === 0 ? "（必須）" : "（任意）"}
              </p>
              <div>
                <label className="block text-sm mb-1">没頭したこと</label>
                <input
                  type="text"
                  value={p.item}
                  onChange={(e) => update(i, "item", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="例：恐竜の図鑑、ゲーム、料理"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">なぜそれに没頭しましたか？</label>
                <input
                  type="text"
                  value={p.why1}
                  onChange={(e) => update(i, "why1", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">そのどこが好きでしたか？</label>
                <input
                  type="text"
                  value={p.why2}
                  onChange={(e) => update(i, "why2", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  さらに深く考えると、何に惹かれていたと思いますか？
                </label>
                <input
                  type="text"
                  value={p.why3}
                  onChange={(e) => update(i, "why3", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="例：誰も答えを知らない謎に触れる感覚"
                />
              </div>
            </div>
          ))}
        </div>

        {passions.length < 3 && (
          <button
            type="button"
            onClick={() => setPassions((prev) => [...prev, empty()])}
            className="mt-3 text-sm text-gray-500 border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-50"
          >
            ＋ {passions.length + 1}つ目を追加（任意）
          </button>
        )}
      </div>

      <div>
        <h2 className="font-medium mb-1">補足質問（任意）</h2>
        <p className="text-xs text-gray-500 mb-3">
          答えが重なる部分が、あなたにとって大切にすべき領域です。
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              今の仕事や日常で、同じ興奮・ワクワクを感じた瞬間はいつですか？
            </label>
            <textarea
              name="supplementQ1"
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              お金をもらわなくてもやり続けられることは何ですか？
            </label>
            <textarea
              name="supplementQ2"
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              他の人が苦痛に感じることを、自分だけ楽しいと感じることは何ですか？
            </label>
            <textarea
              name="supplementQ3"
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
