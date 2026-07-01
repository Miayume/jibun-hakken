"use client";

import { useState, useRef, useEffect } from "react";

const WORDS = [
  "挑戦する", "達成する", "実行する", "新しくする", "分析する",
  "考える", "作る", "工夫する", "解決する", "教える",
  "助ける", "支える", "育てる", "導く", "仲良くする",
  "伝える", "つなぐ", "守る", "応援する", "調整する",
];

export default function WordSelection({ initialWords }: { initialWords?: string[] | null }) {
  const [selected, setSelected] = useState<string[]>(initialWords ?? []);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(selected);
    }
  }, [selected]);

  function toggle(word: string) {
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="personalityWords" ref={hiddenRef} defaultValue={JSON.stringify(selected)} />
      <h2 className="font-medium">9. あなたらしいと思う言葉を選んでください</h2>
      <p className="text-xs text-gray-500">複数選択できます</p>
      <div className="flex flex-wrap gap-2">
        {WORDS.map((word) => {
          const isSelected = selected.includes(word);
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggle(word)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-400">{selected.length}個選択中</p>
      )}
    </div>
  );
}
