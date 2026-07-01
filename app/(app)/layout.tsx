import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, hasAgreedToConsent } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/journal/new", label: "記録" },
  { href: "/journal/calendar", label: "カレンダー" },
  { href: "/analysis", label: "分析" },
  { href: "/chat", label: "相談" },
  { href: "/settings", label: "設定" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !(await hasAgreedToConsent(user.id))) {
    redirect("/");
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-gray-200">
        <nav className="mx-auto max-w-2xl flex items-center justify-between px-6 py-3">
          <div className="flex gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ))}
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-gray-500 hover:underline">
              ログアウト
            </button>
          </form>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
