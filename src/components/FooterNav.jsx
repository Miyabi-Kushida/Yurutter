import { useNavigate, useLocation } from "react-router-dom";

export default function FooterNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Bakatter",
        text: "バカ投稿専用SNS『Bakatter』見てみて！",
        url: window.location.href,
      });
    } else {
      alert("このブラウザは共有機能に対応していません。");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-md mx-auto flex justify-around items-center py-2.5 text-gray-600 text-sm">
        {/* 🏠 ホーム */}
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
            location.pathname === "/"
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
          onClick={() => navigate("/new")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
            location.pathname === "/new"
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[11px] font-medium">投稿</span>
        </button>

        {/* 👤 プロフィール */}
        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
            location.pathname === "/profile"
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
              d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z"
            />
          </svg>
          <span className="text-[11px] font-medium">プロフィール</span>
        </button>

        {/* 📤 シェア */}
        <button
          onClick={handleShare}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
            location.pathname === "/share"
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
              d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v12"
            />
          </svg>
          <span className="text-[11px] font-medium">シェア</span>
        </button>
      </div>
    </nav>
  );
}