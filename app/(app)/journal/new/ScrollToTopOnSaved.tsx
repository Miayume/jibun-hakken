"use client";

import { useEffect } from "react";

/** 保存後、フォーム下部にスクロールしたままだと成功メッセージに気づけないため、自動で先頭へ戻す */
export default function ScrollToTopOnSaved() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return null;
}
