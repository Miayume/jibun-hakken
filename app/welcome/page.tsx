import { redirect } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth";
import { continueToProfile } from "@/app/actions/auth";
import CopyButton from "@/app/welcome/CopyButton";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const { code } = await searchParams;
  if (!code) redirect("/onboarding/profile");

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const loginUrl = `${protocol}://${host}/login?code=${encodeURIComponent(code)}`;
  const qrDataUrl = await QRCode.toDataURL(loginUrl, { margin: 1, width: 220 });

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-xl font-bold mb-2">この端末ではこのまま使えます</h1>
      <p className="text-sm text-gray-600 mb-6">
        メールアドレスやパスワードは不要です。今すぐ「はじめる」を押して進めてOKです。
      </p>

      <div className="mb-8 rounded border border-gray-200 p-4">
        <p className="text-sm font-medium mb-3">他の端末でも続きを使いたい場合</p>
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="ログイン用QRコード" width={180} height={180} />
          <p className="text-xs text-gray-500 text-center">
            他の端末のカメラでこのQRコードを読み取ると、自動でログインできます。
          </p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono">{code}</code>
            <CopyButton text={code} />
          </div>
          <p className="text-xs text-gray-400 text-center">
            QRコードを保存できなくても、設定画面からいつでも新しいコードを発行できます。
          </p>
        </div>
      </div>

      <form action={continueToProfile}>
        <button
          type="submit"
          className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800"
        >
          はじめる
        </button>
      </form>
    </main>
  );
}
