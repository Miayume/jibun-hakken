"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveActionReflection } from "@/app/actions/journal";
import type { AnalysisItem } from "@/lib/ai/types";

function ReflectionForm({ actionPoint }: { actionPoint: string }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    await saveActionReflection(formData);
    setSaved(true);
    setOpen(false);
  }

  if (saved) {
    return (
      <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1.5">
        ✓ ジャーナルに記録しました
      </p>
    );
  }

  return (
    <div className="mt-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-blue-500 hover:underline"
        >
          ＋ やってみた結果を書く（任意）
        </button>
      ) : (
        <form action={handleSubmit} className="space-y-2">
          <input type="hidden" name="actionPoint" value={actionPoint} />
          <textarea
            name="reflection"
            rows={2}
            placeholder="どうでしたか？気づいたことや感想を自由に書いてください"
            className="w-full rounded border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoFocus
          />
          <div className="flex gap-2 items-center">
            <SubmitButton />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
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
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">{item.point}</p>
              <p className="text-xs text-blue-600 mt-0.5">{item.reason}</p>
              <p className="text-xs text-blue-500 italic mt-0.5">{item.insight}</p>
              <ReflectionForm actionPoint={item.point} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
