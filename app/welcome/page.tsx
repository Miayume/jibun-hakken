import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { continueToProfile } from "@/app/actions/auth";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const { code } = await searchParams;
  if (!code) redirect("/onboarding/profile");

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-xl font-bold mb-4">復旧コードを保存してください</h1>
      <p className="text-sm text-gray-600 mb-4">
        このアプリはメールアドレスやパスワードを使いません。下記の復旧コードは、別の端末やブラウザで記録を引き続き使うために必要です。
        <strong>この画面以降は二度と表示されません。</strong>スクリーンショットやメモで必ず保存してください。
      </p>
      <div className="mb-6 rounded border-2 border-black bg-gray-50 p-4 text-center text-lg font-mono tracking-wide">
        {code}
      </div>
      <p className="text-xs text-gray-500 mb-8">
        復旧コードは他人に教えないでください。復旧コードを知っている人は、あなたの記録にアクセスできてしまいます。
      </p>
      <form action={continueToProfile}>
        <button
          type="submit"
          className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800"
        >
          保存しました。次へ進む
        </button>
      </form>
    </main>
  );
}
