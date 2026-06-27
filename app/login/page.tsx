import LoginForm from "@/app/login/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-xl font-bold mb-4">復旧コードでログイン</h1>
      <p className="text-sm text-gray-600 mb-6">
        以前発行された復旧コードを入力してください。
      </p>
      <LoginForm />
      <p className="mt-6 text-xs text-gray-500">
        まだ利用したことがない方は <Link href="/" className="underline">こちら</Link> から開始してください。
      </p>
    </main>
  );
}
