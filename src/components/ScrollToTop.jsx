import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // ページ遷移直後に強制スクロール（即座に実行）
    window.scrollTo({ top: 0, behavior: "instant" });
    
    // 画像読み込み後に再度スクロール位置をリセット
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}