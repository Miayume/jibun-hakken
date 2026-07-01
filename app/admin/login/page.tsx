import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function adminLogin(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminEmail || !adminPassword || !adminToken) redirect("/admin/login?error=1");
  if (email !== adminEmail || password !== adminPassword) redirect("/admin/login?error=1");

  const cookieStore = await cookies();
  cookieStore.set("admin_session", adminToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-xl font-bold text-center">管理者ログイン</h1>

        {params.error && (
          <p className="text-sm text-red-500 text-center">メールアドレスまたはパスワードが違います</p>
        )}

        <form action={adminLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">メールアドレス</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">パスワード</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
