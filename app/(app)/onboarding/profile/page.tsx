import { saveProfile } from "@/app/actions/profile";
import {
  AGE_RANGES,
  GENDERS,
  PREFECTURES,
  INDUSTRIES,
  JOB_TYPES,
  EMPLOYMENT_TYPES,
  WORK_STYLES,
} from "@/lib/constants/profileOptions";
import PassionSection from "./PassionSection";

function RadioGroup({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer"
        >
          <input type="radio" name={name} value={opt} className="accent-black" />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-xl font-bold mb-2">はじめに教えてください</h1>
      <p className="text-sm text-gray-600 mb-6">
        まず、あなた自身のことを少し教えてください。答えるほど、あなたに合った分析ができるようになります。
      </p>

      <form action={saveProfile} className="space-y-6">
        <div>
          <h2 className="font-medium mb-2">1. 年代</h2>
          <RadioGroup name="ageRange" options={AGE_RANGES} />
        </div>
        <div>
          <h2 className="font-medium mb-2">2. 性別</h2>
          <RadioGroup name="gender" options={GENDERS} />
        </div>
        <div>
          <h2 className="font-medium mb-2">3. 都道府県</h2>
          <select name="prefecture" className="rounded border border-gray-300 px-3 py-2 text-sm">
            <option value="">選択しない</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <h2 className="font-medium mb-2">4. 業界</h2>
          <RadioGroup name="industry" options={INDUSTRIES} />
        </div>
        <div>
          <h2 className="font-medium mb-2">5. 職種</h2>
          <RadioGroup name="jobType" options={JOB_TYPES} />
        </div>
        <div>
          <h2 className="font-medium mb-2">6. 雇用形態</h2>
          <RadioGroup name="employmentType" options={EMPLOYMENT_TYPES} />
        </div>
        <div>
          <h2 className="font-medium mb-2">7. 働き方</h2>
          <RadioGroup name="workStyle" options={WORK_STYLES} />
        </div>

        <hr className="border-gray-200" />

        <PassionSection />

        <button
          type="submit"
          className="w-full rounded bg-black text-white py-3 font-medium hover:bg-gray-800"
        >
          保存してジャーナルへ進む
        </button>
      </form>
    </main>
  );
}
