import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // --- ログイン処理 ---
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ✅ Supabase Auth ログイン
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          alert("メールアドレスの確認がまだ完了していません。メールをチェックしてください。");
        } else if (error.message.includes("Invalid login credentials")) {
          alert("メールアドレスまたはパスワードが間違っています。");
        } else {
          alert("ログインに失敗しました。");
        }
        console.error("❌ ログインエラー:", error.message);
        return;
      }

      const user = data.user;

      // ✅ profilesテーブルからユーザー情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("📛 プロフィール取得エラー:", profileError);
        alert("プロフィール情報を取得できませんでした。");
        return;
      }

      // ✅ ローカルに保存（プロフィール情報を含む）
      const account = {
        id: user.id,
        email: user.email,
        username: profileData.username || "名無し",
        emoji: profileData.avatar_url || "/icons/default.webp",
        bio: profileData.bio || "",
        createdAt: profileData.created_at || new Date().toISOString(),
      };

      localStorage.setItem("bakatter-account", JSON.stringify(account));

      alert("ログインしました！");
      navigate("/profile");
    } catch (err) {
      console.error("❌ ログイン処理エラー:", err);
      alert("ログイン中にエラーが発生しました。");
    }
  };

  // --- UI ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-sm text-center"
      >
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
          Yurutter
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* --- メールアドレス --- */}
          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="例: example@email.com"
              required
              className="w-full px-4 py-2.5 border rounded-lg border-gray-300 
                         focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
            />
          </div>

          {/* --- パスワード --- */}
          <div className="text-left relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="w-full px-4 py-2.5 border rounded-lg border-gray-300 
                         focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none pr-20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "非表示" : "表示"}
            </button>
          </div>

          {/* --- ログインボタン --- */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg bg-brand text-white font-semibold 
                       hover:bg-brand-dark shadow-md hover:shadow-lg 
                       transition-all"
          >
            ログイン
          </motion.button>
        </form>


        {/* --- 登録リンク --- */}
        <div className="mt-6 text-sm text-gray-600">
          アカウントをお持ちでない方は{" "}
          <Link
            to="/account/create"
            className="text-brand font-semibold hover:underline"
          >
            登録する
          </Link>
        </div>

        {/* --- パスワード忘れ --- */}
        <div className="mt-3 text-xs text-gray-400">
          <Link to="/forgot-password" className="hover:underline">
            パスワードをお忘れの場合はこちら
          </Link>
        </div>
      </motion.div>
    </div>
  );
}