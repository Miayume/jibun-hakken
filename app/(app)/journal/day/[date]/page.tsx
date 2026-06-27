import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteEntry } from "@/app/actions/journal";
import { format } from "date-fns";
import Link from "next/link";

const FIELD_LABELS: Record<string, string> = {
  what: "出来事",
  doingWhat: "していたこと",
  withWho: "一緒にいた人",
  whoPerson: "相手の人柄",
  whoGoodPoint: "良かったところ",
  whereWas: "場所",
  whyFeeling: "感じた理由",
  whyStress: "ストレスの理由",
  mostImpressive: "印象に残ったこと",
  futureUseful: "将来役立つと思うか",
  futureImprove: "良い経験にする方法",
};

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const userId = await getCurrentUserId();
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const entries = userId
    ? await prisma.entry.findMany({
        where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/journal/calendar" className="text-sm hover:underline">
        ← カレンダーに戻る
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-6">{format(dayStart, "yyyy年M月d日")}の記録</h1>

      {entries.length === 0 && <p className="text-gray-500 text-sm">この日の記録はありません。</p>}

      <div className="space-y-6">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded border p-4 ${
              entry.type === "wakuwaku" ? "border-amber-300 bg-amber-50" : "border-slate-300 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">
                {entry.type === "wakuwaku" ? "ワクワク・幸せ" : "ストレス"} ・ {format(entry.createdAt, "HH:mm")}
              </span>
              <form action={deleteEntry.bind(null, entry.id)}>
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  削除
                </button>
              </form>
            </div>
            <dl className="space-y-1 text-sm">
              {Object.entries(FIELD_LABELS).map(([key, label]) => {
                const value = (entry as Record<string, unknown>)[key];
                if (!value) return null;
                return (
                  <div key={key}>
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </main>
  );
}
