import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { JST_TZ, jstDayRange, toJstDateKey } from "@/lib/datetime";
import { format as formatTz } from "date-fns-tz";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "yyyy-MM" 文字列に対して月単位のオフセットを加算した "yyyy-MM" を返す（年の繰り上がり・繰り下がりに対応） */
function shiftMonth(monthKey: string, offset: number): string {
  const year = Number(monthKey.slice(0, 4));
  const monthIndex0 = Number(monthKey.slice(5, 7)) - 1 + offset;
  const newYear = year + Math.floor(monthIndex0 / 12);
  const newMonthIndex0 = ((monthIndex0 % 12) + 12) % 12;
  return `${newYear}-${pad2(newMonthIndex0 + 1)}`;
}

/** その月の日数（カレンダー計算のみなのでタイムゾーンに依存しない） */
function daysInMonth(monthKey: string): number {
  const year = Number(monthKey.slice(0, 4));
  const monthIndex0 = Number(monthKey.slice(5, 7)) - 1;
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/** その月の1日の曜日（0=日曜）。カレンダー日付自体はタイムゾーンに依存しないためUTC基準でよい */
function firstWeekday(monthKey: string): number {
  const year = Number(monthKey.slice(0, 4));
  const monthIndex0 = Number(monthKey.slice(5, 7)) - 1;
  return new Date(Date.UTC(year, monthIndex0, 1)).getUTCDay();
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await getCurrentUserId();
  const { month } = await searchParams;

  const monthKey = month ?? formatTz(new Date(), "yyyy-MM", { timeZone: JST_TZ });
  const year = Number(monthKey.slice(0, 4));
  const monthIndex0 = Number(monthKey.slice(5, 7)) - 1;

  const { start: monthStart } = jstDayRange(`${monthKey}-01`);
  const nextMonthKey = shiftMonth(monthKey, 1);
  const { start: nextMonthStart } = jstDayRange(`${nextMonthKey}-01`);

  const entries = userId
    ? await prisma.entry.findMany({
        where: { userId, createdAt: { gte: monthStart, lt: nextMonthStart } },
        select: { createdAt: true, type: true },
      })
    : [];

  const daysWithEntries = new Map<string, { wakuwaku: number; stress: number }>();
  for (const e of entries) {
    const key = toJstDateKey(e.createdAt);
    const current = daysWithEntries.get(key) ?? { wakuwaku: 0, stress: 0 };
    if (e.type === "wakuwaku") current.wakuwaku++;
    else current.stress++;
    daysWithEntries.set(key, current);
  }

  const leadingBlanks = firstWeekday(monthKey);
  const totalDays = daysInMonth(monthKey);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const prevMonthKey = shiftMonth(monthKey, -1);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <Link href={`/journal/calendar?month=${prevMonthKey}`} className="text-sm hover:underline">
          ← 前月
        </Link>
        <h1 className="text-lg font-bold">
          {year}年{monthIndex0 + 1}月
        </h1>
        <Link href={`/journal/calendar?month=${nextMonthKey}`} className="text-sm hover:underline">
          次月 →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateKey = `${monthKey}-${pad2(day)}`;
          const info = daysWithEntries.get(dateKey);
          const cellClassName = `aspect-square rounded border text-sm flex flex-col items-center justify-center ${
            info ? "border-black bg-amber-50 hover:bg-amber-100" : "border-gray-100 text-gray-400"
          }`;
          if (!info) {
            return (
              <div key={i} className={cellClassName}>
                <span>{day}</span>
              </div>
            );
          }
          return (
            <Link key={i} href={`/journal/day/${dateKey}`} className={cellClassName}>
              <span>{day}</span>
              <span className="text-[10px] flex gap-0.5">
                {info.wakuwaku > 0 && <span className="text-amber-600">●{info.wakuwaku}</span>}
                {info.stress > 0 && <span className="text-slate-600">●{info.stress}</span>}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
