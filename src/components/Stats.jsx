// src/components/Stats.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { hasAccount } from "../utils/authGuard";
import { IconLike, IconLaugh, IconComment, IconShare } from "./Icons";

export default function Stats({
  likes = [],
  laughs = [],
  comments,
  postId,
  answerId,
  replies = 0,
  isReply = false,
  onReplyToggle,
}) {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const { toggleReaction, toggleCommentReaction } = usePosts();
  const account = JSON.parse(localStorage.getItem("bakatter-account") || "{}");
  const userId = account.id;

  // 現ユーザーが押してるか判定
  const likeArrayFromProps = Array.isArray(likes) ? likes : [];
  const laughArrayFromProps = Array.isArray(laughs) ? laughs : [];

  const [localLikes, setLocalLikes] = useState(likeArrayFromProps);
  const [localLaughs, setLocalLaughs] = useState(laughArrayFromProps);

  useEffect(() => {
    setLocalLikes(likeArrayFromProps);
  }, [likeArrayFromProps]);

  useEffect(() => {
    setLocalLaughs(laughArrayFromProps);
  }, [laughArrayFromProps]);

  const userLiked = localLikes.includes(userId);
  const userLaughed = localLaughs.includes(userId);

  // ✅ Supabase更新関数（楽観的UI対応）
  const handleToggleReaction = async (type) => {
    if (!hasAccount(openAuthModal)) return;

    const updatedArray = isReply && answerId
      ? await toggleCommentReaction(postId, answerId, userId, type)
      : await toggleReaction(postId, userId, type);

    if (!updatedArray) return;

    if (type === "likes") {
      setLocalLikes(updatedArray);
    } else {
      setLocalLaughs(updatedArray);
    }
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
        onClick={(e) => {
          e.stopPropagation();
          handleToggleReaction("likes");
        }}
        className={`flex items-center gap-1 transition ${
          userLiked ? "text-amber-500" : "hover:text-amber-400"
        }`}
      >
        <IconLike width={18} height={18} />
        <span>{localLikes.length}</span>
      </button>

      {/* 🤣笑い */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleReaction("laughs");
        }}
        className={`flex items-center gap-1 transition ${
          userLaughed ? "text-yellow-500" : "hover:text-yellow-400"
        }`}
      >
        <IconLaugh width={18} height={18} />
        <span>{localLaughs.length}</span>
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