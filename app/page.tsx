import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, hasAgreedToConsent } from "@/lib/auth";
import { TERMS_TEXT, PRIVACY_TEXT } from "@/lib/legal/content";
import { agreeAndStart } from "@/app/actions/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user && (await hasAgreedToConsent(user.id))) {
    redirect("/journal/new");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">自分発見・人生設計ツール</h1>
      <p className="text-sm text-gray-600 mb-6">
        日々のワクワク・ストレスを記録し、AIがあなたに合う仕事・働き方・人間関係の傾向を見つけるお手伝いをします。
      </p>

      <ul className="mb-6 space-y-2 text-sm">
        <li className="flex gap-2">
          <span>✓</span>
          <span>氏名・メールアドレスなどの個人情報は不要。すぐに使えます</span>
        </li>
        <li className="flex gap-2">
          <span>✓</span>
          <span>あなたの記録・分析結果は本人以外（運営者含む）見られません</span>
        </li>
        <li className="flex gap-2">
          <span>✓</span>
          <span>AIの分析は参考情報です。診断や断定ではありません</span>
        </li>
      </ul>

      <details className="mb-3 rounded border border-gray-200 p-3 text-sm">
        <summary className="cursor-pointer font-medium">利用規約を読む（タップで開く）</summary>
        <div className="mt-3 h-48 overflow-y-auto whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 rounded p-3">
          {TERMS_TEXT}
        </div>
      </details>

      <details className="mb-8 rounded border border-gray-200 p-3 text-sm">
        <summary className="cursor-pointer font-medium">プライバシーポリシーを読む（タップで開く）</summary>
        <div className="mt-3 h-48 overflow-y-auto whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 rounded p-3">
          {PRIVACY_TEXT}
        </div>
      </details>

      <form action={agreeAndStart}>
        <button
          type="submit"
          className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800"
        >
          同意してはじめる
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        以前このサービスを利用したことがある方は{" "}
        <Link href="/login" className="underline">
          復旧コードでログイン
        </Link>
        してください。
      </p>
    </main>
  );
}
