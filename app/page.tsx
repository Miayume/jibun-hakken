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
      <p className="text-sm text-gray-600 mb-8">
        日々のワクワク・ストレスを記録し、AIが自分に合う仕事・働き方・ライフスタイル・人間関係の傾向を分析する自己理解サービスです。
        氏名・メールアドレス・電話番号などの個人情報は収集しません。
      </p>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">利用規約</h2>
        <div className="h-48 overflow-y-auto rounded border border-gray-200 p-3 text-xs whitespace-pre-wrap text-gray-700 bg-gray-50">
          {TERMS_TEXT}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">プライバシーポリシー</h2>
        <div className="h-48 overflow-y-auto rounded border border-gray-200 p-3 text-xs whitespace-pre-wrap text-gray-700 bg-gray-50">
          {PRIVACY_TEXT}
        </div>
      </section>

      <form action={agreeAndStart}>
        <button
          type="submit"
          className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800"
        >
          同意して利用を開始する
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
