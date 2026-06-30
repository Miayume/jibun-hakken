"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { addEntry } from "@/app/actions/journal";

const FUTURE_USEFUL_OPTIONS = [
  "とてもそう思う",
  "少しそう思う",
  "わからない",
  "あまりそう思わない",
  "全くそう思わない",
];

interface Props {
  defaultType: "wakuwaku" | "stress";
  showSaved: boolean;
  showDuplicate: boolean;
}

export default function JournalForm({ defaultType, showSaved, showDuplicate }: Props) {
  const [type, setType] = useState<"wakuwaku" | "stress">(defaultType);

  // URLが変わったとき（保存後リダイレクト）にタイプを切り替える
  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  return (
    <form action={addEntry} className="space-y-5">
      <input type="hidden" name="type" value={type} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("wakuwaku")}
          className={`flex-1 rounded py-2.5 font-medium ${
            type === "wakuwaku" ? "bg-amber-500 text-white" : "bg-gray-100"
          }`}
        >
          ワクワク・幸せの記録
        </button>
        <button
          type="button"
          onClick={() => setType("stress")}
          className={`flex-1 rounded py-2.5 font-medium ${
            type === "stress" ? "bg-slate-600 text-white" : "bg-gray-100"
          }`}
        >
          ストレスの記録
        </button>
      </div>

      <p className="text-xs text-gray-500">
        質問には思いつくままに気軽に記入してください。自由入力欄には本名、住所、電話番号、勤務先名など個人が特定される情報を書かないようご注意ください。
      </p>

      {type === "wakuwaku" ? (
        <div className="space-y-4">
          <Field label="今日、ワクワクした出来事、または、幸せと感じたことを書いてください。" name="what" />
          <Field label="ワクワク・幸せと感じた時、何をしていましたか？" name="doingWhat" />
          <Field label="ワクワク・幸せと感じた時、誰と一緒にいましたか？" name="withWho" />
          <Field label="一緒にいた人はどんな人でしたか？" name="whoPerson" />
          <Field label="相手の、どんなところが良かったですか？" name="whoGoodPoint" />
          <Field label="ワクワク・幸せと感じた時、どこにいましたか？" name="whereWas" />
          <Field label="なぜワクワク・幸せを感じましたか？" name="whyFeeling" />
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="今日、ストレスを感じた出来事を書いてください。" name="what" />
          <Field label="ストレスを感じた時、何をしていましたか？" name="doingWhat" />
          <Field label="ストレスを感じた時、誰と一緒にいましたか？" name="withWho" />
          <Field label="一緒にいた人はどんな人でしたか？" name="whoPerson" />
          <Field label="ストレスを感じた時、なぜストレスを感じましたか？" name="whyStress" />
          <Field label="一番印象に残ったことは何ですか？" name="mostImpressive" />

          <div>
            <label className="block text-sm font-medium mb-1">
              この出来事は、将来の自分のために必要だったと思いますか？
            </label>
            <div className="flex flex-wrap gap-2">
              {FUTURE_USEFUL_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer"
                >
                  <input type="radio" name="futureUseful" value={opt} className="accent-black" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <Field
            label="今日ストレスを感じた出来事を、将来的に良い経験と思えるようにするには、どうすればよいと思いますか？"
            name="futureImprove"
          />
        </div>
      )}

      <SubmitButton showSaved={showSaved} showDuplicate={showDuplicate} />
    </form>
  );
}

function SubmitButton({ showSaved, showDuplicate }: { showSaved: boolean; showDuplicate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "保存中..." : "記録を保存する"}
      </button>
      {!pending && showSaved && (
        <p className="rounded bg-green-50 border border-green-200 text-green-800 px-3 py-2 text-sm font-medium text-center">
          ✓ 記録を保存しました。
        </p>
      )}
      {!pending && showDuplicate && (
        <p className="rounded bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 text-sm font-medium text-center">
          この内容はすでに記録されています（保存されませんでした）。
        </p>
      )}
    </div>
  );
}

function Field({ label, name, hint }: { label: string; name: string; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea
        name={name}
        rows={2}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
    </div>
  );
}
