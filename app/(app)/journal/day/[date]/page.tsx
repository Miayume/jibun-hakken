import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteEntry } from "@/app/actions/journal";
import { format as formatTz } from "date-fns-tz";
import { JST_TZ, jstDayRange } from "@/lib/datetime";
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
  const { start: dayStart, end: dayEnd } = jstDayRange(date);

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
      <h1 className="text-xl font-bold mt-2 mb-6">
        {Number(date.slice(0, 4))}年{Number(date.slice(5, 7))}月{Number(date.slice(8, 10))}日の記録
      </h1>

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
                {entry.type === "wakuwaku" ? "ワクワク・幸せ" : "ストレス"} ・{" "}
                {formatTz(entry.createdAt, "HH:mm", { timeZone: JST_TZ })}
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
