// src/components/PostCard.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { supabase } from "../utils/supabaseClient";
import Stats from "./Stats";
import ReportButton from "./ReportButton";
import ImageModal from "./ImageModal";
import ImageCarousel from "./ImageCarousel";
import URLCard from "./URLCard";
import { extractURLs, removeURLsFromText } from "../utils/url";
import { MoreVertical } from "lucide-react";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const { deletePost } = usePosts();

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [laughs, setLaughs] = useState(post.laughs || []);
  const [updating, setUpdating] = useState(false);

  const menuRef = useRef(null);
  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "{}");
  const isOwnPost = String(savedAccount.id) === String(post.userId);

  // 外クリックでメニュー閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👤 投稿者情報（ログイン中ユーザーと一致すれば最新名義で表示）
  const displayUser = () => {
    if (post.userId && savedAccount.id && post.userId === savedAccount.id) {
      return {
        username: savedAccount.username || post.username,
        emoji: savedAccount.emoji || post.emoji,
      };
    }
    return { username: post.username, emoji: post.emoji };
  };
  const postUser = displayUser();

  // 🔗 投稿クリック（画像クリックは除外）
  const handlePostClick = (e) => {
    if (e.target.closest(".post-image")) return;
    if (!savedAccount.id) {
      openAuthModal();
      return;
    }
    navigate(`/post/${post.id}`);
  };

  // 🧭 プロフィールクリック
  const handleProfileClick = (e) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("bakatter-account") || "{}");
    if (!saved.id) {
      openAuthModal();
      return;
    }
    if (String(saved.id) === String(post.userId)) {
      navigate("/profile");
    } else {
      navigate(`/profile/${post.userId}`);
    }
  };

  // 🖼 モーダル画像クリック処理
  const handleImageClick = (index) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  // ⏰ 経過時間表示
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diff = now - postDate;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  // 🧩 複数画像対応
  const images =
    Array.isArray(post.images) && post.images.length > 0
      ? post.images
      : post.image
      ? [post.image]
      : [];

  // ✅ Supabaseリアクション更新
  const handleToggleReaction = async (type) => {
    if (!savedAccount.id) {
      openAuthModal();
      return;
    }
    if (updating) return;
    setUpdating(true);

    try {
      const current = type === "likes" ? likes : laughs;
      const hasReacted = current.includes(savedAccount.id);
      const updated = hasReacted
        ? current.filter((id) => id !== savedAccount.id)
        : [...current, savedAccount.id];

      if (type === "likes") setLikes(updated);
      else setLaughs(updated);

      const { error } = await supabase
        .from("posts")
        .update({ [type]: updated })
        .eq("id", post.id);

      if (error) {
        console.error("リアクション更新エラー:", error);
        alert("通信エラーが発生しました。");
      }
    } catch (err) {
      console.error("リアクション処理中エラー:", err);
    } finally {
      setUpdating(false);
    }
  };

  // 🔗 URL抽出と本文整形
  const urls = extractURLs(post.text || "");
  const textWithoutURLs = removeURLsFromText(post.text || "");

  return (
    <article
      onClick={handlePostClick}
      className="relative w-full border-b border-gray-200 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      {/* --- ヘッダー --- */}
      <header className="flex items-center justify-between mb-2 px-4 sm:px-4">
        <div className="flex items-center gap-3">
          <div
            onClick={handleProfileClick}
            className="cursor-pointer hover:opacity-80 transition"
          >
            {postUser.emoji?.startsWith("/icons/") ? (
              <img
                src={postUser.emoji}
                alt="ユーザーアイコン"
                className="w-9 h-9 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="text-2xl">{postUser.emoji || "👤"}</div>
            )}
          </div>

          <div
            onClick={handleProfileClick}
            className="leading-tight cursor-pointer hover:underline decoration-gray-400"
          >
            <p className="text-[15px] font-semibold text-gray-800">
              {postUser.username || "名無し"}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{post.createdAt ? getTimeAgo(post.createdAt) : "1時間前"}</span>
              {post.category && (
                <>
                  <span>・</span>
                  <span className="text-blue-500 font-medium">{post.category}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* メニュー */}
        <div ref={menuRef} onClick={(e) => e.stopPropagation()} className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreVertical size={20} className="text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 shadow-lg rounded-lg text-sm z-50 overflow-hidden">
              {isOwnPost ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("この投稿を削除しますか？")) {
                      deletePost(post.id);
                      setMenuOpen(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                >
                  削除
                </button>
              ) : (
                <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <ReportButton post={post} />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* --- 本文とURL --- */}
      {textWithoutURLs && (
        <p className="px-4 text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
          {textWithoutURLs}
        </p>
      )}

      {urls.length > 0 && (
        <div className="px-4 mb-3">
          {/* 最初のURLをカード化 */}
          <div className="mb-2">
            <URLCard url={urls[0]} />
          </div>

          {/* 2つ目以降はテキストリンク表示 */}
          {urls.slice(1).map((url, i) => (
            <div key={i} className="text-sm text-blue-500 hover:underline break-all">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* --- 画像 --- */}
      {images.length > 0 && (
        <div
          className="post-image mb-3 px-0 sm:px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageCarousel images={images} onImageClick={handleImageClick} />
        </div>
      )}

      {/* --- リアクション --- */}
      <footer className="flex justify-between items-center mt-2 px-4 sm:px-4 text-gray-500 text-sm">
        <Stats
          likes={likes}
          laughs={laughs}
          comments={post.comments}
          postId={post.id}
          onLike={() => handleToggleReaction("likes")}
          onLaugh={() => handleToggleReaction("laughs")}
          replies={post.replies?.length || 0}
          userId={savedAccount.id}
        />
      </footer>

      {/* --- モーダル --- */}
      {showImageModal && (
        <ImageModal
          imageSrc={images[modalImageIndex]}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </article>
  );
}