import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import JournalForm from "@/app/(app)/journal/new/JournalForm";
import { entryCountThresholds } from "@/lib/analysis/trigger";

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const userId = await getCurrentUserId();
  const { saved } = await searchParams;
  const entryCount = userId
    ? await prisma.entry.count({ where: { userId } })
    : 0;
  const thresholds = entryCountThresholds();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      {saved && (
        <p className="mb-4 rounded bg-green-50 border border-green-200 text-green-800 px-3 py-2 text-sm">
          記録を保存しました。
        </p>
      )}
      <h1 className="text-xl font-bold mb-1">記録を追加する</h1>
      <p className="text-sm text-gray-500 mb-4">
        現在 {entryCount} 件の記録があります（簡易分析: {thresholds.simple}件 / 詳細分析: {thresholds.detailed}件 / 本格分析: {thresholds.full}件）。
        毎日入力する必要はありません。入力したい日だけ記録してください。
      </p>
      <JournalForm />
    </main>
  );
}
