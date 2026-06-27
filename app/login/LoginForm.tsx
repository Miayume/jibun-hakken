"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">復旧コード</label>
        <input
          type="text"
          name="recoveryCode"
          placeholder="例: あさひ-いずみ-うみそら-えがお"
          className="w-full rounded border border-gray-300 px-3 py-2"
          autoComplete="off"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "確認中..." : "ログイン"}
      </button>
    </form>
  );
}
