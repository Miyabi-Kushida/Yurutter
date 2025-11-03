// src/components/AccountSettings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import RecentPosts from "./RecentPosts";
import { ICONS } from "../utils/icons";
import IconDisplay from "./IconDisplay";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [emoji, setEmoji] = useState("😎");
  const [bio, setBio] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false); // ✅ トースト表示制御

  useEffect(() => {
    const saved = localStorage.getItem("bakatter-account");
    if (saved) {
      const acc = JSON.parse(saved);
      setId(acc.id || `u_${Date.now()}`);
      setUsername(acc.username || "");
      setEmoji(acc.emoji || "😎");
      setBio(acc.bio || "");
      setCreatedAt(acc.createdAt || new Date().toISOString());
    }
  }, []);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setError(value.trim() ? "" : "ユーザー名を入力してください");
  };

  const handleSave = () => {
    if (!username.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }

    const updated = {
      id,
      username,
      emoji,
      bio,
      createdAt,
    };
    localStorage.setItem("bakatter-account", JSON.stringify(updated));

    // ✅ トースト表示 → 2.5秒後に消える
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/profile");
    }, 2500);
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "本当にアカウントを削除しますか？\nこの操作は元に戻せません。"
      )
    ) {
      localStorage.removeItem("bakatter-account");
      sessionStorage.clear();
      alert("アカウントを削除しました。");
      window.location.replace("/");
      setTimeout(() => navigate("/", { replace: true }), 100);
    }
  };

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      {/* ✅ トースト通知 */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showToast
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-10 pointer-events-none"
          }`}
      >
        <div className="bg-white/90 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-green-500 text-lg">✅</span>
          <span className="font-medium text-sm">プロフィールを保存しました！</span>
        </div>
      </div>

      {/* 🧱 メインコンテンツ全体 */}
      <div
        className="
          flex flex-1 gap-8
          w-full
          px-4 lg:px-8
        "
      >
        {/* 🏠 アカウント設定エリア（8割） */}
        <div className="w-full lg:flex-[0.8] lg:max-w-[950px]">
          <Header title="設定" showBack onBack={() => navigate(-1)} />
          <main className="pt-4 pb-14">
            <LayoutContainer>
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-card w-full space-y-10">

                {/* 🎭 プロフィール設定 */}
                <section>
                  <h2 className="text-gray-700 font-semibold mb-4 flex items-center gap-2 text-lg">
                    🎭 プロフィール設定
                  </h2>

                  {/* ユーザーネーム */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ユーザーネーム <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder="例: ネタ侍777"
                      className={`w-full rounded-lg border px-3 py-2 outline-none transition-all
                    ${error
                          ? "border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/30 hover:shadow-sm"
                        }`}
                    />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      ※ユーザー名は自由に設定できます
                    </p>
                  </div>

                  {/* プロフィールアイコン選択 */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      プロフィールアイコン
                    </label>

                    {/* 選択中のアイコンプレビュー */}
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={emoji}
                        onError={(e) => {
                          e.target.src = emoji.replace(".png", ".jpg");
                        }}
                        alt="選択中のアイコン"
                        className="w-24 h-24 rounded-full border border-gray-300 shadow-inner object-cover"
                      />
                    </div>

                    {/* アイコン一覧 */}
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-[260px] overflow-y-auto p-2 border rounded-xl bg-gray-50 shadow-inner">
                      {ICONS.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setEmoji(icon.value)}
                          className={`rounded-full p-1 transition-all duration-150 ${emoji === icon.value
                              ? "ring-2 ring-blue-400 scale-105 bg-white shadow-md"
                              : "hover:ring-1 hover:ring-gray-300"
                            }`}
                        >
                          <img
                            src={icon.value}
                            onError={(e) => {
                              e.target.src = icon.value.replace(".png", ".jpg");
                            }}
                            alt={icon.label}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-2">※アイコンをクリックして選択</p>
                  </div>


                  {/* ひとこと */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ひとこと
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="例: 今日もバカ回答量産中"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2
                             focus:border-brand focus:ring-2 focus:ring-brand/30
                             hover:shadow-sm transition-all outline-none"
                    />
                  </div>

                  {/* 保存ボタン */}
                  <button
                    onClick={handleSave}
                    disabled={!username.trim()}
                    className={`mt-8 w-full py-3 rounded-lg font-semibold shadow-sm transition 
                  ${username.trim()
                        ? "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    保存して戻る
                  </button>
                </section>

                {/* ⚙️ アカウント管理 */}
                <section className="border-t border-gray-200 pt-8">
                  <h2 className="text-gray-700 font-semibold mb-4 flex items-center gap-2 text-lg">
                    ⚙️ アカウント管理
                  </h2>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold
                           hover:bg-red-600 active:scale-[0.98] transition shadow-sm"
                  >
                    アカウント削除
                  </button>
                </section>
              </div>
            </LayoutContainer>
          </main>
        </div>

        {/* 🧩 最近の投稿（2割） */}
        <div
          className="
            hidden lg:block 
            lg:flex-[0.2] lg:w-[300px] shrink-0
            mt-[72px]
          "
        >
          <RecentPosts />
        </div>
      </div>
    </div>
  );
}