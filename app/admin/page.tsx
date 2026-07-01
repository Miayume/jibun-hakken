import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID ?? "01a7022d-b899-4083-829d-52f344aa3e7e";

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 bg-gray-200 rounded flex-1">
        <div className="h-3 bg-black rounded" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-gray-200 rounded-lg p-4 space-y-3">
      <h2 className="font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

function DistRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
      <span className="text-sm text-gray-600 truncate">{label}</span>
      <Bar value={value} max={max} />
    </div>
  );
}

function tally(arr: (string | null)[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of arr) {
    const key = v ?? "未回答";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
}

export default async function AdminPage() {
  const userId = await getCurrentUserId();
  if (userId !== ADMIN_USER_ID) redirect("/");

  const [users, profiles, entries] = await Promise.all([
    prisma.user.findMany({ select: { id: true, createdAt: true } }),
    prisma.profile.findMany(),
    prisma.entry.findMany({ select: { userId: true, type: true, createdAt: true } }),
  ]);

  const totalUsers = users.length;
  const totalEntries = entries.length;
  const usersWithProfile = profiles.length;

  // 今月の新規ユーザー
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = users.filter((u) => u.createdAt >= thisMonthStart).length;

  // ワクワク vs ストレス比
  const wakuwakuCount = entries.filter((e) => e.type === "wakuwaku").length;
  const stressCount = entries.filter((e) => e.type === "stress").length;

  // プロフィール分布
  const ageMap = tally(profiles.map((p) => p.ageRange));
  const genderMap = tally(profiles.map((p) => p.gender));
  const industryMap = tally(profiles.map((p) => p.industry));
  const prefMap = tally(profiles.map((p) => p.prefecture));
  const jobMap = tally(profiles.map((p) => p.jobType));
  const empMap = tally(profiles.map((p) => p.employmentType));
  const workStyleMap = tally(profiles.map((p) => p.workStyle));

  // 没頭体験（passions）の集計
  const passionItems: string[] = [];
  for (const p of profiles) {
    if (!p.passions) continue;
    try {
      const parsed = JSON.parse(p.passions) as { item: string }[];
      for (const passion of parsed) {
        if (passion.item?.trim()) passionItems.push(passion.item.trim());
      }
    } catch {
      // ignore
    }
  }

  const todayJST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const dateStr = `${todayJST.getFullYear()}年${todayJST.getMonth() + 1}月${todayJST.getDate()}日`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">管理画面</h1>
        <p className="text-xs text-gray-400 mt-1">{dateStr} 時点のデータ</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "全ユーザー数", value: totalUsers },
          { label: "今月の新規", value: newUsersThisMonth },
          { label: "プロフィール入力済み", value: usersWithProfile },
          { label: "総記録件数", value: totalEntries },
        ].map((card) => (
          <div key={card.label} className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 記録タイプ比率 */}
      <Section title="記録タイプ">
        <DistRow label="ワクワク・幸せ" value={wakuwakuCount} max={totalEntries} />
        <DistRow label="ストレス" value={stressCount} max={totalEntries} />
      </Section>

      {/* 年代 */}
      <Section title="年代分布">
        {[...ageMap.entries()].map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 性別 */}
      <Section title="性別分布">
        {[...genderMap.entries()].map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 業界 */}
      <Section title="業界分布">
        {[...industryMap.entries()].map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 職種 */}
      <Section title="職種分布">
        {[...jobMap.entries()].map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 雇用形態 */}
      <Section title="雇用形態">
        {[...empMap.entries()].map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 働き方 */}
      <Section title="働き方">
        {[...workStyleMap.entries()].map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 都道府県（上位10件） */}
      <Section title="都道府県（上位10件）">
        {[...prefMap.entries()].slice(0, 10).map(([k, v]) => (
          <DistRow key={k} label={k} value={v} max={usersWithProfile} />
        ))}
      </Section>

      {/* 没頭体験 */}
      <Section title={`没頭体験（${passionItems.length}件）`}>
        {passionItems.length === 0 ? (
          <p className="text-sm text-gray-400">データなし</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {passionItems.map((item, i) => (
              <li key={i} className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="text-xs text-gray-300 text-center pb-6">このページはあなた（管理者）にのみ表示されます</p>
    </main>
  );
}
