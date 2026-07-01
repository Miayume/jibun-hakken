"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveActionReflection } from "@/app/actions/journal";
import type { AnalysisItem } from "@/lib/ai/types";

function QuestionForm({ actionPoint, question }: { actionPoint: string; question: string }) {
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    await saveActionReflection(formData);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-blue-900">{question}</p>
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1.5">
          ✓ 回答をジャーナルに記録しました
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="mt-3 space-y-2">
      <input type="hidden" name="actionPoint" value={actionPoint} />
      <input type="hidden" name="question" value={question} />
      <p className="text-sm font-medium text-blue-900">{question}</p>
      <textarea
        name="reflection"
        rows={3}
        placeholder="思いつくまま自由に書いてください。書かなくてもOKですが、書くほどあなたに合った分析の精度が上がります。"
        className="w-full rounded border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "保存中..." : "記録する"}
    </button>
  );
}

export default function NextActionsSection({ items }: { items: AnalysisItem[] }) {
  return (
    <div className="rounded border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-bold text-blue-800 mb-3">今週やってみること</h2>
      <div className="space-y-5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">{item.point}</p>
              <p className="text-xs text-blue-600 mt-0.5">{item.reason}</p>
              <p className="text-xs text-blue-500 italic mt-0.5">{item.insight}</p>
              {item.question && (
                <QuestionForm actionPoint={item.point} question={item.question} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
