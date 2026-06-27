import { TERMS_TEXT, PRIVACY_TEXT } from "@/lib/legal/content";
import { RecoveryCodeSection, DeleteAllDataSection } from "@/app/(app)/settings/SettingsActions";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-8 space-y-10">
      <h1 className="text-xl font-bold">設定</h1>

      <section>
        <h2 className="font-semibold mb-2">復旧コード</h2>
        <RecoveryCodeSection />
      </section>

      <section>
        <h2 className="font-semibold mb-2">利用規約</h2>
        <div className="h-40 overflow-y-auto rounded border border-gray-200 p-3 text-xs whitespace-pre-wrap text-gray-700 bg-gray-50">
          {TERMS_TEXT}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">プライバシーポリシー</h2>
        <div className="h-40 overflow-y-auto rounded border border-gray-200 p-3 text-xs whitespace-pre-wrap text-gray-700 bg-gray-50">
          {PRIVACY_TEXT}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2 text-red-700">データの削除</h2>
        <DeleteAllDataSection />
      </section>
    </main>
  );
}
