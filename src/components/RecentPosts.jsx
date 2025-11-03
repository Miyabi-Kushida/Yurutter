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

  useEffect(() => {
    const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "null");
    setIsLoggedIn(!!savedAccount);

    // ✅ アカウント作成直後なら履歴を削除（例：作成3分以内）
    if (savedAccount && localStorage.getItem("bakatter-recent")) {
      const createdAt = savedAccount.createdAt ? new Date(savedAccount.createdAt) : null;
      if (createdAt) {
        const diffMinutes = (Date.now() - createdAt.getTime()) / 1000 / 60;
        if (diffMinutes < 1) {
          localStorage.removeItem("bakatter-recent");
        }
      }
    }

    // ✅ 履歴または人気投稿のロード
    if (savedAccount) {
      const stored = JSON.parse(localStorage.getItem("bakatter-recent") || "[]");
      setRecentPosts(stored);
    } else {
      if (Array.isArray(posts) && posts.length > 0) {
        const sorted = [...posts]
          .sort((a, b) => {
            // ✅ 配列と数値の両方に対応
            const likesA = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
            const laughsA = Array.isArray(a.laughs) ? a.laughs.length : (a.laughs || 0);
            const scoreA = likesA + laughsA;

            const likesB = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
            const laughsB = Array.isArray(b.laughs) ? b.laughs.length : (b.laughs || 0);
            const scoreB = likesB + laughsB;

            // ① 合計スコアで比較
            if (scoreB !== scoreA) return scoreB - scoreA;

            // ② 同点なら新しい投稿を上に
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          })
          .slice(0, 10);

        setRecentPosts(sorted);
      }
    }
  }, [posts]);

  // ✅ 投稿クリック時の動作
  const handleClick = (post) => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    navigate(`/post/${post.id}`);
  };

  const handleClear = () => {
    localStorage.removeItem("bakatter-recent");
    setRecentPosts([]);
  };

  useEffect(() => {
    const fetchUrlThumbnails = async () => {
      for (const post of recentPosts) {
        if (post.image || (Array.isArray(post.images) && post.images.length > 0)) continue;
        const urls = extractURLs(post.text || "");
        if (urls.length === 0) continue;

        const url = urls[0];
        try {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
          const data = await res.json();
          const html = data.contents;
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const image =
            doc.querySelector('meta[property="og:image"]')?.content ||
            doc.querySelector('meta[name="twitter:image"]')?.content ||
            doc.querySelector("img")?.src ||
            null;

          if (image) {
            setUrlThumbnails((prev) => ({
              ...prev,
              [post.id]: image,
            }));
          }
        } catch (err) {
          console.log("URLメタ取得失敗:", err);
        }
      }
    };

    if (recentPosts.length > 0) fetchUrlThumbnails();
  }, [recentPosts]);

  if (recentPosts.length === 0) return null;

  return (
    <aside
      className="
        sticky top-16
        mr-6
        bg-[#F7F8F9]
        border border-[#DFE0E1]
        rounded-2xl
        shadow-sm
        p-4
        w-72
        h-fit
      "
    >
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
            urlThumbnails[post.id] ||
            null;

          return (
            <li
              key={post.id}
              onClick={() => handleClick(post)}
              className="
                flex items-center gap-3 p-2
                rounded-lg
                hover:bg-white hover:shadow-sm
                cursor-pointer transition-all
                border border-transparent hover:border-[#E3E4E5]
              "
            >
              {/* 🖼 サムネイル */}
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt=""
                  className="w-12 h-12 object-cover rounded-md border border-[#DFE0E1]"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              ) : (
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-gray-400 text-sm border border-[#DFE0E1]">
                  📝
                </div>
              )}

              {/* 💬 テキスト部分 */}
              <div className="flex-1 min-w-0">
                {/* 上段（本文） */}
                <p className="text-[13px] font-medium text-gray-800 truncate">
                  {post.text?.slice(0, 28) || "本文なし"}
                </p>

                {/* 下段（カテゴリ・ユーザー） */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                  <span className="truncate max-w-[90px]">{post.category || "未分類"}</span>
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