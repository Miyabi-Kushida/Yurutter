import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractURLs } from "../utils/url";
import { usePosts } from "../context/PostsContext";
import { useAuth } from "../context/AuthContext";

export default function RecentPosts() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [urlThumbnails, setUrlThumbnails] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { posts } = usePosts();
  const { openAuthModal } = useAuth();

  // -----------------------------
  //  ログイン状態 & 履歴ロード
  // -----------------------------
    useEffect(() => {
  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "null");
  setIsLoggedIn(!!savedAccount);

  const userId = savedAccount?.id;

  // ログインユーザーごとのキー
  const LS_KEY = userId
    ? `bakatter-recent-${userId}`
    : `bakatter-recent-guest`;

  // ログイン → ユーザー固有の履歴を読む
  if (savedAccount) {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    setRecentPosts(stored);
    return;
  }

  // 未ログイン → 人気投稿
  if (Array.isArray(posts) && posts.length > 0) {
    const sorted = [...posts]
      .sort((a, b) => {
        const scoreA =
          (Array.isArray(a.likes) ? a.likes.length : a.likes || 0) +
          (Array.isArray(a.laughs) ? a.laughs.length : a.laughs || 0);

        const scoreB =
          (Array.isArray(b.likes) ? b.likes.length : b.likes || 0) +
          (Array.isArray(b.laughs) ? b.laughs.length : b.laughs || 0);

        if (scoreB !== scoreA) return scoreB - scoreA;

        return new Date(b.createdAt || b.created_at || 0) -
               new Date(a.createdAt || a.created_at || 0);
      })
      .slice(0, 10);

    setRecentPosts(sorted);
  }
}, [posts]);

  // -----------------------------
  //  投稿クリック
  // -----------------------------
  const handleClick = (post) => {
    if (!isLoggedIn) return openAuthModal();
    navigate(`/post/${post.id}`);
  };

  // 履歴クリア
  const handleClear = () => {
    localStorage.removeItem("bakatter-recent");
    setRecentPosts([]);
  };

  // -----------------------------
  // URLプレビューの取得
  // すでに DB に og_image があれば、それを最優先で使う！
  // -----------------------------
  useEffect(() => {
    if (recentPosts.length === 0) return;

    const fetchUrlThumbnails = async () => {
      for (const post of recentPosts) {
        // ① すでに画像 or og_image があれば取得しない
        if (
          (Array.isArray(post.images) && post.images.length > 0) ||
          post.image ||
          post.og_image
        ) {
          if (post.og_image) {
            setUrlThumbnails((prev) => ({
              ...prev,
              [post.id]: post.og_image,
            }));
          }
          continue;
        }

        // ② URL 抽出
        const urls = extractURLs(post.text || "");
        if (urls.length === 0) continue;

        const url = urls[0];

        // ③ Edge Function で情報取得
        try {
          const res = await fetch(
            "https://nizcfjxngngqidgwzexc.supabase.co/functions/v1/url-preview",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({ url }),
            }
          );

          const data = await res.json();

          if (data.success && data.image) {
            setUrlThumbnails((prev) => ({
              ...prev,
              [post.id]: data.image,
            }));
          }
        } catch (err) {
          console.log("URLメタ取得失敗:", err);
        }
      }
    };

    fetchUrlThumbnails();
  }, [recentPosts]);

  // -----------------------------
  //  描画
  // -----------------------------
  if (recentPosts.length === 0) return null;

  return (
    <aside className="
      sticky top-16
      mr-6 bg-[#F7F8F9] border border-[#DFE0E1]
      rounded-2xl shadow-sm p-4 w-72 h-fit
    ">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          {isLoggedIn ? "最近の投稿" : "人気の投稿"}
        </h2>

        {isLoggedIn && (
          <button
            onClick={handleClear}
            className="text-[#457BF5] text-sm font-medium hover:underline"
          >
            クリア
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {recentPosts.map((post) => {
          const imageSrc =
            (Array.isArray(post.images) && post.images[0]) ||
            post.image ||
            post.og_image ||
            urlThumbnails[post.id] ||
            null;

          return (
            <li
              key={post.id}
              onClick={() => handleClick(post)}
              className="
                flex items-center gap-3 p-2 rounded-lg
                hover:bg-white hover:shadow-sm cursor-pointer
                transition-all border border-transparent hover:border-[#E3E4E5]
              "
            >
              {/* サムネイル */}
              {imageSrc ? (
                <img
                  src={imageSrc}
                  className="w-12 h-12 object-cover rounded-md border border-[#DFE0E1]"
                  alt=""
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="
                  w-12 h-12 bg-white rounded-md flex items-center
                  justify-center text-gray-400 text-sm border border-[#DFE0E1]
                ">
                  💬
                </div>
              )}

              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 truncate">
                  {post.text?.slice(0, 28) || "本文なし"}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                  <span className="truncate max-w-[90px]">
                    {post.category || "未分類"}
                  </span>
                  <span className="truncate text-gray-400 ml-1">
                    {post.username || post.user || `u_${post.userId || "unknown"}`}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
