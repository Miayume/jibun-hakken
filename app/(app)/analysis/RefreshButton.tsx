"use client";

import { useState } from "react";

export default function RefreshButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleClick() {
    setState("loading");
    try {
      await fetch("/api/trigger-analysis", { method: "POST" });
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
        更新中です。1〜2分後にページを再読み込みしてください。
      </p>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="text-xs text-gray-500 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
    >
      {state === "loading" ? "リクエスト中..." : "分析を更新する"}
    </button>
  );
}
