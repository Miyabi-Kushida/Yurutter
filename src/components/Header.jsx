// src/components/Header.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Home, PlusCircle, Bell, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { openAuthModal } = useAuth();

  // ✅ プロフィール絵文字の状態
  const [emoji, setEmoji] = useState("🔑");

  // ✅ ローカルストレージから絵文字を読み込む関数
  const loadAccountEmoji = () => {
    const saved = localStorage.getItem("bakatter-account");
    if (saved) {
      const acc = JSON.parse(saved);
      if (acc.emoji) setEmoji(acc.emoji);
    }
  };

  // ✅ 初回＋focus/storageイベントで絵文字を更新
  useEffect(() => {
    loadAccountEmoji();
    window.addEventListener("storage", loadAccountEmoji);
    window.addEventListener("focus", loadAccountEmoji);
    return () => {
      window.removeEventListener("storage", loadAccountEmoji);
      window.removeEventListener("focus", loadAccountEmoji);
    };
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  // ✅ アカウント存在チェック
  const hasAccount = () => {
    const acc = localStorage.getItem("bakatter-account");
    try {
      const parsed = JSON.parse(acc);
      return parsed && parsed.id;
    } catch {
      return false;
    }
  };

  return (
    <>
      {/* 🌐 ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 relative">
          {/* 🍔 ハンバーガー（モバイルのみ） */}
          <button
            className="sm:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* 🔤 ロゴ */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer select-none mx-auto sm:mx-0"
          >
            <span className="text-2xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Bakatter 2.0
            </span>
          </div>

          {/* 😎 プロフィール（モバイル右端） */}
          <div
            onClick={() => {
              if (!hasAccount()) openAuthModal();
              else navigate("/profile");
            }}
            className="sm:hidden w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-300 transition overflow-hidden"
          >
            {emoji?.startsWith("/icons/") ? (
              <img
                src={emoji}
                onError={(e) => {
                  if (e.target.src !== "/icons/icon1.webp") {
                    e.target.src = "/icons/icon1.webp";
                  }
                }}
                alt="プロフィールアイコン"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{emoji || "😎"}</span>
            )}
          </div>

          {/* 🔍 PC用検索バー */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Bakatterを検索してください"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="
                  w-full h-10 px-4 pl-10 text-[15px]
                  bg-[#EEF1F3] placeholder-gray-500 text-gray-800
                  rounded-full focus:outline-none focus:ring-2 focus:ring-[#457BF5]/40
                  border border-transparent focus:border-[#D5DADE]
                  transition-all
                "
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
            </div>
          </div>

          {/* 🧭 PCナビゲーションアイコン */}
          <div className="hidden md:flex items-center gap-5 text-gray-600 ml-auto">
            <button
              onClick={() => navigate("/")}
              className="hover:text-[#457BF5] transition"
              title="ホーム"
            >
              <Home size={21} />
            </button>
            <button
              onClick={() => {
                if (!hasAccount()) openAuthModal();
                else navigate("/new");
              }}
              className="hover:text-[#457BF5] transition"
              title="投稿を作成"
            >
              <PlusCircle size={21} />
            </button>
            <button
              onClick={() => alert("通知機能は開発中です。")}
              className="hover:text-[#457BF5] transition"
              title="通知"
            >
              <Bell size={21} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("リンクをコピーしました！");
              }}
              className="hover:text-[#457BF5] transition"
              title="シェア"
            >
              <Share2 size={21} />
            </button>

            {/* ✅ プロフィールアイコン */}
            <div
              onClick={() => {
                if (!hasAccount()) openAuthModal();
                else navigate("/profile");
              }}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-300 transition overflow-hidden"
              title="プロフィール"
            >
              {emoji?.startsWith("/icons/") ? (
                <img
                  src={emoji}
                  onError={(e) => {
                    if (e.target.src !== "/icons/icon1.webp") {
                      e.target.src = "/icons/icon1.webp";
                    }
                  }}
                  alt="プロフィールアイコン"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">{emoji || "😎"}</span>
              )}
            </div>
          </div>
        </div>

        {/* 🔍 モバイル用検索バー */}
        <div className="sm:hidden px-4 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Bakatterを検索してください"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="
                w-full pl-10 pr-4 py-2 rounded-full
                bg-[#F8F9FF]
                border border-[#D5DAFF]/70
                text-sm text-gray-700 placeholder-gray-400
                shadow-sm focus:outline-none
                focus:ring-2 focus:ring-indigo-300/40 focus:border-indigo-400/50
                transition-all
              "
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"
              size={18}
            />
          </div>
        </div>
      </header>

      {/* 📱 モバイルメニュー */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-50 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg border-r border-gray-200 pt-0 z-50 sm:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar
                categories={[
                  "総合",
                  "くだらない日常",
                  "インターネット文化",
                  "ゲーム",
                  "ポップカルチャー",
                  "アニメ・コスプレ",
                  "今日の飯ログ",
                  "買ったもの・戦利品",
                  "雑談なんでも",
                ]}
                activeCategory="総合"
                setActiveCategory={(cat) => {
                  navigate(`/category/${encodeURIComponent(cat)}`);
                  setMenuOpen(false);
                }}
                isMobile={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
