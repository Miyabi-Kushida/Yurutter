import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import { ICONS } from "../utils/icons";

export default function AccountCreate() {
  const [username, setUsername] = useState("");
  const [emoji, setEmoji] = useState("/icons/icon1.png"); // ✅ デフォルトを画像に変更
  const [bio, setBio] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const account = {
      id: `u_${Date.now()}`,
      username,
      emoji,
      bio,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("bakatter-account", JSON.stringify(account));

    // 🎉 モーダル表示 → 自動で/profileへ
    setShowWelcome(true);
    setTimeout(() => navigate("/profile"), 2200);
  };

  return (
    <div className="page-container bg-gray-100 min-h-screen">
      <Header title="アカウント作成" />

      <main className="pb-20 pt-6">
        <LayoutContainer>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-card max-w-[640px] mx-auto space-y-8 text-center relative overflow-hidden"
          >
            {/* 🌈 タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
              Yurutterへようこそ！
            </h1>
            <p className="text-gray-500 text-sm -mt-2">🎭 プロフィールを作成しよう</p>

            {/* 🧍‍♂️ アイコン画像プレビュー */}
            <motion.div
              key={emoji}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              className="w-24 h-24 mx-auto mt-2 rounded-full border border-gray-200 shadow-inner bg-gray-50 flex items-center justify-center overflow-hidden"
            >
              <img
                src={emoji}
                alt="プロフィールアイコン"
                onError={(e) => {
                  if (emoji.endsWith(".png")) e.target.src = emoji.replace(".png", ".jpg");
                }}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* ユーザー名 */}
            <div className="text-left space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: 名無し"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-brand/30 focus:border-brand 
                           hover:shadow-sm transition-all outline-none"
                required
              />
              <p className="text-xs text-gray-400">※ユーザー名は自由に設定できます</p>
            </div>

            {/* プロフィールアイコン選択 */}
            <div className="text-left">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                プロフィールアイコン
              </label>
              <div className="relative">
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-brand/30 focus:border-brand 
                             hover:shadow-sm transition-all outline-none bg-white"
                >
                  {ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>

                {/* 下にプレビュー一覧 */}
                <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setEmoji(icon.value)}
                      className={`border rounded-full overflow-hidden w-12 h-12 flex items-center justify-center 
                        transition-transform hover:scale-105 ${
                          emoji === icon.value
                            ? "ring-2 ring-brand border-brand"
                            : "border-gray-200"
                        }`}
                    >
                      <img
                        src={icon.value}
                        alt={icon.label}
                        onError={(e) => (e.target.src = icon.fallback)}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ひとこと */}
            <div className="text-left">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ひとこと
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="例: 今日もバカ回答量産中"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                           focus:ring-2 focus:ring-brand/30 focus:border-brand 
                           hover:shadow-sm transition-all outline-none"
              />
            </div>

            {/* ボタン */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-lg bg-brand text-white font-semibold 
                         hover:bg-brand-dark shadow-md hover:shadow-lg 
                         active:scale-[0.98] transition-all"
            >
              アカウントを作成
            </motion.button>
          </form>
        </LayoutContainer>
      </main>

      {/* 🎉 ようこそモーダル */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl px-8 py-10 text-center max-w-sm"
            >
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border border-gray-200 shadow-inner bg-gray-50 flex items-center justify-center mb-4">
                <img
                  src={emoji}
                  alt="プロフィールアイコン"
                  onError={(e) => {
                    if (emoji.endsWith(".png")) e.target.src = emoji.replace(".png", ".jpg");
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ようこそ！</h2>
              <p className="text-gray-600 font-medium text-lg">{username} さん</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}