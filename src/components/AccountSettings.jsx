import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import RecentPosts from "./RecentPosts";
import { ICONS } from "../utils/icons";
import { supabase } from "../utils/supabaseClient";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [emoji, setEmoji] = useState("😎");
  const [bio, setBio] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // ✅ ログイン中のユーザー情報を取得して state に反映
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setId(user.id);

      // Supabase からプロフィール取得
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, bio, created_at")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("プロフィール取得エラー:", error.message);
      } else if (data) {
        setUsername(data.username || "");
        setEmoji(data.avatar_url || "😎");
        setBio(data.bio || "");
        setCreatedAt(data.created_at || new Date().toISOString());
      }

      // localStorage（旧データ）も読み込み
      const saved = localStorage.getItem("bakatter-account");
      if (saved) {
        const acc = JSON.parse(saved);
        setUsername(acc.username || data?.username || "");
        setEmoji(acc.emoji || data?.avatar_url || "😎");
        setBio(acc.bio || data?.bio || "");
      }
    };

    fetchProfile();
  }, []);

  // ✅ 名前変更時のバリデーション
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setError(value.trim() ? "" : "ユーザー名を入力してください");
  };

  // ✅ 保存ボタン → Supabase profiles も更新
  const handleSave = async () => {
    if (!username.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }

    const updated = {
      username,
      avatar_url: emoji,
      bio,
      updated_at: new Date(),
    };

    try {
      const { error } = await supabase.from("profiles").update(updated).eq("id", id);

      if (error) {
        console.error("❌ Supabase更新エラー:", error.message);
        alert("プロフィールの保存に失敗しました。");
        return;
      }

      // ✅ ローカルも更新
      localStorage.setItem(
        "bakatter-account",
        JSON.stringify({
          id,
          username,
          emoji,
          bio,
          createdAt,
        })
      );

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/profile");
      }, 2000);
    } catch (err) {
      console.error("❌ 更新中エラー:", err);
      alert("エラーが発生しました。");
    }
  };

  // ✅ ログアウト
  const handleLogout = async () => {
    if (window.confirm("ログアウトしますか？")) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("❌ ログアウトエラー:", error.message);
      } finally {
        localStorage.removeItem("bakatter-account");
        sessionStorage.clear();
        navigate("/", { replace: true });
      }
    }
  };

  // ✅ アカウント削除（完全削除） Edge Function版
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "本当にアカウントを削除しますか？\nこの操作は元に戻せません。"
      )
    ) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          alert("ユーザー情報が取得できません。");
          return;
        }

        // ✅ Edge Function（delete-user）を呼び出し
        const res = await fetch(
          "https://nizcfjxngngqidgwzexc.supabase.co/functions/v1/delete-user",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }),
          }
        );

        const result = await res.json();

        if (!res.ok) {
          console.error("❌ 削除エラー:", result.error);
          alert("アカウント削除に失敗しました。");
          return;
        }

        console.log("✅ Edge Function result:", result.message);

        // ✅ Profile削除（保険的）
        await supabase.from("profiles").delete().eq("id", user.id);

        // ✅ ローカル・セッション削除
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();

        alert("アカウントを完全に削除しました。");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("❌ 削除中エラー:", error);
        alert("アカウント削除中にエラーが発生しました。");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      {/* ✅ トースト通知 */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-green-500 text-lg">✅</span>
          <span className="font-medium text-sm">プロフィールを保存しました！</span>
        </div>
      </div>

      {/* 🧱 メイン */}
      <div className="flex flex-1 gap-8 w-full px-4 lg:px-8">
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
                      placeholder="例: 魔法使いのペンギン"
                      className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${
                        error
                          ? "border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/30 hover:shadow-sm"
                      }`}
                    />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                  </div>

                  {/* アイコン選択 */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      プロフィールアイコン
                    </label>

                    {/* 🔧 選択中アイコン */}
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={emoji}
                        alt="選択中のアイコン"
                        onError={(e) => {
                          if (e.target.src !== "/icons/icon1.webp") {
                            e.target.src = "/icons/icon1.webp";
                          }
                        }}
                        className="w-24 h-24 rounded-full border border-gray-300 shadow-inner object-cover"
                      />
                    </div>

                    {/* 🔧 アイコン一覧 */}
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-[260px] overflow-y-auto p-2 border rounded-xl bg-gray-50 shadow-inner">
                      {ICONS.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setEmoji(icon.value)}
                          className={`rounded-full p-1 transition-all duration-150 ${
                            emoji === icon.value
                              ? "ring-2 ring-blue-400 scale-105 bg-white shadow-md"
                              : "hover:ring-1 hover:ring-gray-300"
                          }`}
                        >
                          <img
                            src={icon.value}
                            alt={icon.label}
                            onError={(e) => {
                              if (e.target.src !== "/icons/icon1.webp") {
                                e.target.src = "/icons/icon1.webp";
                              }
                            }}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ひとこと */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      いきごみをどうぞ
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="例: いきごみ〜"
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
                      ${
                        username.trim()
                          ? "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    保存して戻る
                  </button>
                </section>

                {/* ⚙️ アカウント管理 */}
                <section className="border-t border-gray-200 pt-8 space-y-3">
                  <h2 className="text-gray-700 font-semibold mb-4 flex items-center gap-2 text-lg">
                    ⚙️ アカウント管理
                  </h2>

                  {/* ✅ ログアウトボタン */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold
                               hover:bg-gray-300 active:scale-[0.98] transition shadow-sm"
                  >
                    ログアウト
                  </button>

                  {/* 🚨 アカウント削除ボタン */}
                  
                </section>
              </div>
            </LayoutContainer>
          </main>
        </div>

        {/* 🧩 最近の投稿 */}
        <div className="hidden lg:block lg:flex-[0.2] lg:w-[300px] shrink-0 mt-[72px]">
          <RecentPosts />
        </div>
      </div>
    </div>
  );
}