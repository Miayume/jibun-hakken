import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await getCurrentUserId();
  const { month } = await searchParams;

  const now = new Date();
  const targetMonth = month ? new Date(`${month}-01`) : new Date(now.getFullYear(), now.getMonth(), 1);
  const year = targetMonth.getFullYear();
  const monthIndex = targetMonth.getMonth();

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const entries = userId
    ? await prisma.entry.findMany({
        where: { userId, createdAt: { gte: firstDay, lt: new Date(year, monthIndex + 1, 1) } },
        select: { createdAt: true, type: true },
      })
    : [];

  const daysWithEntries = new Map<string, { wakuwaku: number; stress: number }>();
  for (const e of entries) {
    const key = format(e.createdAt, "yyyy-MM-dd");
    const current = daysWithEntries.get(key) ?? { wakuwaku: 0, stress: 0 };
    if (e.type === "wakuwaku") current.wakuwaku++;
    else current.stress++;
    daysWithEntries.set(key, current);
  }

  const leadingBlanks = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const prevMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <Link href={`/journal/calendar?month=${format(prevMonth, "yyyy-MM")}`} className="text-sm hover:underline">
          ← 前月
        </Link>
        <h1 className="text-lg font-bold">{format(targetMonth, "yyyy年M月")}</h1>
        <Link href={`/journal/calendar?month=${format(nextMonth, "yyyy-MM")}`} className="text-sm hover:underline">
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
          const dateKey = format(new Date(year, monthIndex, day), "yyyy-MM-dd");
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
