// src/layouts/MainLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Navigation from "../components/Navigation";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    "総合",
    "くだらない日常",
    "インターネット文化",
    "ゲーム",
    "ポップカルチャー",
    "アニメ・コスプレ",
    "今日の飯ログ",
    "買ったもの・戦利品",
    "雑談なんでも",
  ];

  // 現在URLに応じてアクティブカテゴリを決定
  const [activeCategory, setActiveCategory] = useState("総合");

  useEffect(() => {
    const path = decodeURIComponent(location.pathname);
    if (path.startsWith("/category/")) {
      const category = path.replace("/category/", "");
      setActiveCategory(category);
    } else if (path === "/") {
      setActiveCategory("総合");
    }
  }, [location.pathname]);

  // カテゴリクリック時の動作
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === "総合") {
      navigate("/");
    } else {
      navigate(`/category/${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🧭 Sidebar */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryClick}
      />

      {/* 🧱 メイン領域 */}
      <div className="flex-1 flex flex-col min-h-screen sm:pl-56">
        <Header />
        <main
          className="
    flex-1 w-full
    px-4 lg:px-8
    sm:pt-14
    pb-[84px] sm:pb-0
    min-h-screen bg-white
  "
          style={{
            paddingTop: "calc(90px + env(safe-area-inset-top))",
            paddingBottom: "calc(84px + env(safe-area-inset-bottom))",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* 📱 スマホ用ナビゲーション */}
      <Navigation />
    </div>
  );
}