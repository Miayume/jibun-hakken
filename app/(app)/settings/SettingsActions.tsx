"use client";

import { useState, useTransition } from "react";
import { regenerateRecoveryCode, deleteAllData } from "@/app/actions/settings";

export function RecoveryCodeSection() {
  const [newCode, setNewCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">
        復旧コードは一度しか表示されないため、再表示はできません。お困りの場合は新しいコードを再発行できます（古いコードは使えなくなります）。
      </p>
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await regenerateRecoveryCode();
            setNewCode(result.code);
          })
        }
        disabled={pending}
        className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? "発行中..." : "復旧コードを再発行する"}
      </button>
      {newCode && (
        <div className="mt-3 rounded border-2 border-black bg-gray-50 p-3 text-center font-mono">
          {newCode}
        </div>
      )}
    </div>
  );
}

export function DeleteAllDataSection() {
  const [confirmText, setConfirmText] = useState("");

  return (
    <form action={deleteAllData}>
      <p className="text-sm text-gray-600 mb-2">
        全ての記録・分析結果・プロフィールを完全に削除します。この操作は取り消せません。
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="削除する場合は「削除」と入力"
        className="w-full rounded border border-gray-300 px-3 py-2 mb-2 text-sm"
      />
      <button
        type="submit"
        disabled={confirmText !== "削除"}
        className="rounded bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-40"
      >
        全データを削除する
      </button>
    </form>
  );
}
