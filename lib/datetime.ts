import { fromZonedTime, toZonedTime, format as formatTz } from "date-fns-tz";

export const JST_TZ = "Asia/Tokyo";

/** UTC保存のDateを、日本時間での "yyyy-MM-dd" キーに変換する */
export function toJstDateKey(date: Date): string {
  return formatTz(date, "yyyy-MM-dd", { timeZone: JST_TZ });
}

/** 日本時間での "yyyy-MM-dd" 文字列が表すカレンダー日の開始・終了（UTC Date）を返す */
export function jstDayRange(dateKey: string): { start: Date; end: Date } {
  const start = fromZonedTime(`${dateKey}T00:00:00`, JST_TZ);
  const end = fromZonedTime(`${dateKey}T23:59:59.999`, JST_TZ);
  return { start, end };
}

/** 日本時間での「今日」を基準にした Date オブジェクト（getFullYear/getMonth等はJST基準にはならないため、年月の計算にはtoJstDateKeyやformatTzを使うこと） */
export function jstNow(): Date {
  return toZonedTime(new Date(), JST_TZ);
}
