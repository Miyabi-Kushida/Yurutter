import { useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import { useAuth } from "../context/AuthContext";
import { hasAccount } from "../utils/authGuard";
import { IconLike, IconLaugh, IconComment, IconShare } from "./Icons";

export default function Stats({
  likes = [],
  laughs = [],
  comments,
  postId,
  answerId,      // ← ✅ これを追加
  replies = 0,
  isReply = false,
  onReplyToggle,
}) {
  const navigate = useNavigate();
  const { toggleReaction } = usePosts();
  const { openAuthModal } = useAuth();

  const account = JSON.parse(localStorage.getItem("bakatter-account") || "{}");
  const userId = account.id;

  // 現ユーザーが押してるか判定（旧データ対策付き）
  const userLiked = Array.isArray(likes) && likes.includes(userId);
  const userLaughed = Array.isArray(laughs) && laughs.includes(userId);

  // 👍 いいねトグル
  const handleLike = (e) => {
    e.stopPropagation();
    if (!hasAccount(openAuthModal)) return;
    toggleReaction(answerId || postId, userId, "likes");
  };

  // 🤣 笑いトグル
  const handleLaugh = (e) => {
    e.stopPropagation();
    if (!hasAccount(openAuthModal)) return;
    toggleReaction(answerId || postId, userId, "laughs");
  };

  // 💬 コメント or 返信
  const handleComments = (e) => {
    e.stopPropagation();
    if (!hasAccount(openAuthModal)) return;

    if (isReply && onReplyToggle) {
      onReplyToggle();
      return;
    }
    navigate(`/post/${postId}`);
  };

  // ↗ シェア
  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "バカッターの投稿",
          text: "面白い投稿を見つけたよ😂",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("リンクをコピーしました！");
      }
    } catch (err) {
      console.error("シェアに失敗:", err);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-4 text-[13px] text-gray-600">
      {/* 👍いいね */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 transition ${
          userLiked ? "text-amber-500" : "hover:text-amber-400"
        }`}
      >
        <IconLike width={18} height={18} />
        <span>{likes?.length || 0}</span>
      </button>

      {/* 🤣笑い */}
      <button
        onClick={handleLaugh}
        className={`flex items-center gap-1 transition ${
          userLaughed ? "text-yellow-500" : "hover:text-yellow-400"
        }`}
      >
        <IconLaugh width={18} height={18} />
        <span>{laughs?.length || 0}</span>
      </button>

      {/* 💬コメント or 返信 */}
      <button
        onClick={handleComments}
        className="flex items-center gap-1 hover:text-brand transition"
      >
        <IconComment width={18} height={18} />
        <span>{isReply ? "" : replies}</span>
      </button>

      {/* ↗シェア */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1 hover:text-blue-500 transition"
      >
        <IconShare width={18} height={18} />
      </button>
    </div>
  );
}