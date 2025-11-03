import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostsContext";
import { useAuth } from "../context/AuthContext"; // ← 追加！
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import RecentPosts from "./RecentPosts";

export default function NewPost() {
  const navigate = useNavigate();
  const { addPost } = usePosts();
  const { openAuthModal } = useAuth(); // ← モーダル呼び出し用
  const [text, setText] = useState("");
  const [category, setCategory] = useState("くだらない日常");
  const [images, setImages] = useState([]);
  const maxLength = 140;

  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "null");
  const isLoggedIn = !!savedAccount; // ← ログイン状態を判定

  const categories = [
    "くだらない日常",
    "インターネット文化",
    "ゲーム",
    "ポップカルチャー",
    "アニメ・コスプレ",
    "今日の飯ログ",
    "買ったもの・戦利品",
    "雑談なんでも",
  ];

  const handleBack = () => navigate("/");

  // 🖼 複数画像の選択・プレビュー
  const handleImageUpload = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openAuthModal(); // ← 未ログインならモーダル
      return;
    }

    const files = Array.from(e.target.files);
    const selected = files.slice(0, 4 - images.length);
    const readers = selected.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file, url: reader.result });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newImages) => setImages([...images, ...newImages]));
  };

  // 🗑 個別削除
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ✅ 投稿処理
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      openAuthModal(); // ← 投稿ボタンもガード
      return;
    }

    if (!text.trim()) return;

    const account = savedAccount || { username: "匿名", emoji: "👤", bio: "" };

    let uploadedUrls = [];
    if (images.length > 0) {
      uploadedUrls = await Promise.all(
        images.map(async (img) => {
          const formData = new FormData();
          formData.append("file", img.file);
          formData.append("upload_preset", "unsigned_upload");
          const res = await fetch(
            "https://api.cloudinary.com/v1_1/dlbr3gemb/image/upload",
            { method: "POST", body: formData }
          );
          const data = await res.json();
          return data.secure_url;
        })
      );
    }

    const newPost = {
      id: Date.now(),
      userId: account.id || `u_${Date.now()}`,
      user: account.username || "あなた",
      emoji: account.emoji || "👤",
      bio: account.bio || "",
      text: text.trim(),
      category,
      images: uploadedUrls,
      createdAt: new Date().toISOString(),
      likes: 0,
      laughs: 0,
      comments: [],
    };

    addPost(newPost);
    alert("投稿しました！");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 gap-8 w-full px-4 lg:px-8">
        <div className="w-full lg:flex-[0.8] lg:max-w-[950px]">
          <Header title="新規投稿" showBack onBack={handleBack} />
          <main className="pt-4 pb-14">
            <LayoutContainer>
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-card p-6 space-y-6"
              >
                {/* 本文 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    本文
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      if (!isLoggedIn) {
                        openAuthModal(); // ← 未ログインで入力しようとしたらモーダル
                        return;
                      }
                      setText(e.target.value);
                    }}
                    onFocus={() => {
                      if (!isLoggedIn) openAuthModal(); // ← クリック時でも対応
                    }}
                    placeholder="例: なんで月曜って憂鬱なん？"
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:border-brand focus:outline-none"
                    maxLength={maxLength}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    あと{maxLength - text.length}文字
                  </div>
                </div>

                {/* カテゴリ選択 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-brand focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🖼 画像添付 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    画像を添付（最大4枚・任意）
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand transition-colors">
                    {images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img.url}
                              alt={`プレビュー${i + 1}`}
                              className="h-32 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {images.length < 4 && (
                          <label
                            htmlFor="image-upload"
                            className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand cursor-pointer transition"
                          >
                            ＋
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500">ここに画像をドラッグ&ドロップ</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-block mt-2 px-4 py-2 bg-brand text-white rounded-lg cursor-pointer hover:bg-brand-dark transition-colors"
                          onClick={(e) => {
                            if (!isLoggedIn) {
                              e.preventDefault();
                              openAuthModal(); // ← ボタン押下時もガード
                            }
                          }}
                        >
                          画像を選択
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* 投稿ボタン */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      text.trim()
                        ? "bg-brand text-white hover:bg-brand-dark"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    投稿する
                  </button>
                </div>
              </form>
            </LayoutContainer>
          </main>
        </div>

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