export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 text-sm text-gray-700 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">プライバシーポリシー</h1>

      <section className="space-y-2">
        <h2 className="font-semibold text-gray-900">収集する情報</h2>
        <p>本サービスでは、以下の情報をお預かりします。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>プロフィール情報（年代・性別・居住地・業界・職種・雇用形態・働き方）</li>
          <li>没頭体験・補足質問への回答</li>
          <li>ワクワク・幸せの記録、ストレスの記録</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-gray-900">情報の利用目的</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>あなたに合った自己分析結果を生成するため</li>
          <li>サービスの改善・機能向上のため</li>
          <li>個人を特定できない形に集計したうえで、統計データとして企業・研究機関に提供する場合があります</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-gray-900">個人情報の保護</h2>
        <p>本サービスは匿名アカウントで利用できます。氏名・メールアドレス・電話番号などの個人を直接特定できる情報は収集しません。企業・研究機関への提供は、常に集計・統計処理されたデータのみとし、個人が特定できる形では提供しません。</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-gray-900">情報の管理</h2>
        <p>お預かりした情報はSupabase（PostgreSQL）にて安全に管理します。第三者への個人情報の販売は行いません。</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-gray-900">データの削除</h2>
        <p>設定画面からアカウントおよびすべての記録データをいつでも削除できます。</p>
      </section>

      <p className="text-xs text-gray-400 pt-4 border-t">最終更新：2026年7月1日</p>
    </main>
  );
}
