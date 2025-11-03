// src/components/Navigation.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { hasAccount } from "../utils/authGuard";
import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuthModal } = useAuth();

  const isHome = location.pathname === "/";
  const isNew = location.pathname === "/new";
  const isNotification = location.pathname === "/notifications";

  const handleProtectedNav = (path) => {
    if (!hasAccount(openAuthModal)) return;
    navigate(path);
  };

  // ✅ Web Share API
  const handleShare = async () => {
    const shareData = {
      title: "バカッター",
      text: "匿名で面白いことを共有できる新SNS『バカッター』を使ってみよう！",
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("シェアがキャンセルされました:", err);
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert("リンクをコピーしました！");
    }
  };

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-30
        bg-white/70 backdrop-blur-xl
        border-t border-gray-200/60
        shadow-[0_-2px_12px_rgba(0,0,0,0.05)]
        transition-all duration-300
        sm:hidden
      "
    >
      <div className="mx-auto max-w-iphone14pro px-8 py-3">
        <div className="flex items-center justify-between">
          {/* 🏠 ホーム */}
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
              isHome
                ? "text-brand bg-gradient-to-t from-blue-50 to-white shadow-inner scale-110"
                : "text-gray-500 hover:text-brand hover:scale-105 hover:bg-gray-100/40"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-10.5z"
              />
            </svg>
            <span className="text-[11px] font-medium">ホーム</span>
          </button>

          {/* ➕ 投稿 */}
          <button
            onClick={() => handleProtectedNav("/new")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
              isNew
                ? "text-brand bg-gradient-to-t from-blue-50 to-white shadow-inner scale-110"
                : "text-gray-500 hover:text-brand hover:scale-105 hover:bg-gray-100/40"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-[11px] font-medium">投稿</span>
          </button>

          {/* 🔔 通知 */}
          <button
            onClick={() => alert("通知機能は開発中です。")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
              isNotification
                ? "text-brand bg-gradient-to-t from-blue-50 to-white shadow-inner scale-110"
                : "text-gray-500 hover:text-brand hover:scale-105 hover:bg-gray-100/40"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 01-6 0"
              />
            </svg>
            <span className="text-[11px] font-medium">通知</span>
          </button>

          {/* 📤 シェア */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 text-gray-500 hover:text-brand hover:scale-105 hover:bg-gray-100/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v12"
              />
            </svg>
            <span className="text-[11px] font-medium">シェア</span>
          </button>
        </div>
      </div>
    </nav>
  );
}