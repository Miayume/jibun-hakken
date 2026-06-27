"use client";

import { useActionState, useEffect, useRef } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginForm({ autoCode }: { autoCode?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (autoCode) {
      formRef.current?.requestSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">復旧コード</label>
        <input
          type="text"
          name="recoveryCode"
          defaultValue={autoCode}
          placeholder="例: あさひ-いずみ-うみそら-えがお"
          className="w-full rounded border border-gray-300 px-3 py-2"
          autoComplete="off"
        />
      </div>
      {autoCode && pending && (
        <p className="text-sm text-gray-500">QRコードを確認してログイン中...</p>
      )}
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
