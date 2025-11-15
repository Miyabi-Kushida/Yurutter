import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stats from "./Stats";
import { usePosts } from "../context/PostsContext";
import ReportButton from "./ReportButton";
import { formatRelativeTime } from "../utils/time";
import ImageModal from "./ImageModal";
import { MoreVertical } from "lucide-react";

export default function CommentThread({ comment, onReply, parentPostId }) {
  const { deletePost, deleteComment, addNestedComment } = usePosts(); // ✅ 修正：deleteCommentを追加
  const navigate = useNavigate();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "{}");
  const isOwnComment = comment.userId && savedAccount.id === comment.userId;

  // ✅ 最新プロフィール反映
  const displayUsername = isOwnComment
    ? savedAccount.username || comment.username
    : comment.username;

  const displayEmoji = isOwnComment
    ? savedAccount.emoji || comment.emoji
    : comment.emoji;

  // ✅ 外クリックで三点メニュー閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** ✅ 返信送信処理 */
  const handleReply = async () => {
    if (!replyText.trim() && !replyImage) return;

    const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

    // 🔹 Cloudinaryへ画像アップロード
    let uploadedUrl = null;
    if (replyImage) {
      const formData = new FormData();
      formData.append("file", replyImage);
      formData.append("upload_preset", "unsigned_upload");

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dlbr3gemb/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        uploadedUrl = data.secure_url;
      } catch (err) {
        console.error("画像アップロード失敗:", err);
      }
    }

    // 🔹 新しい返信オブジェクト生成
    const newReply = {
      id: `r${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      postId: parentPostId,
      userId: savedAccount.id,
      username: savedAccount.username || "名無し",
      emoji: savedAccount.emoji || "💬",
      text: replyText.trim(),
      images: uploadedUrl ? [uploadedUrl] : [],
      createdAt: new Date().toISOString(),
      likes: [],
      laughs: [],
      replies: [],
    };

    // ✅ Supabaseへ反映（親コメント階層に挿入）
    await addNestedComment(parentPostId, comment.id, newReply);

    // ✅ UIリセット
    setReplyText("");
    setReplyImage(null);
    setReplying(false);
  };

  /** 🗑 コメント削除処理 */
  const handleDelete = async () => {
    if (window.confirm("このコメントを削除しますか？")) {
      // ✅ 投稿全体を削除するケース（トップ階層の投稿）
      if (!parentPostId) {
        await deletePost(comment.id);
      } else {
        // ✅ コメント・返信を削除するケース
        await deleteComment(parentPostId, comment.id);
      }
      setMenuOpen(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setReplyImage(file);
  };

  return (
    <div className="ml-4 border-l border-gray-200 pl-4 mt-4">
      <div className="flex items-start gap-2">
        {/* --- ユーザーアイコン --- */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 bg-gray-100 select-none shrink-0 cursor-pointer hover:opacity-80 transition"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${comment.userId}`);
          }}
        >
          {displayEmoji?.startsWith("/icons/") ? (
            <img
              src={displayEmoji}
              onError={(e) => {
                if (e.target.src !== "/icons/icon1.webp") {
                  e.target.src = "/icons/icon1.webp";
                }
              }}
              alt="ユーザーアイコン"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">{displayEmoji || "💬"}</span>
          )}
        </div>

        <div className="flex-1">
          {/* --- ヘッダー --- */}
          <header className="flex items-center justify-between mb-1">
            <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-gray-600">
              <span
                className="font-semibold text-gray-800 cursor-pointer hover:text-brand"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${comment.userId}`);
                }}
              >
                {displayUsername || "名無し"}
              </span>
              <span className="text-gray-400">・</span>
              <span className="text-gray-400">
                {comment.createdAt
                  ? formatRelativeTime(comment.createdAt)
                  : "たった今"}
              </span>
            </div>

            {/* --- 三点メニュー --- */}
            <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md w-[90px] z-20">
                  {isOwnComment ? (
                    <button
                      onClick={handleDelete} // ✅ 修正：deleteComment対応
                      className="w-full text-left text-red-500 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      削除
                    </button>
                  ) : (
                    <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <ReportButton post={comment} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* --- コメント本文 --- */}
          {comment.text && (
            <p className="text-[15px] text-gray-800 whitespace-pre-wrap mb-2">
              {comment.text}
            </p>
          )}

          {/* --- コメント画像 --- */}
          {comment.images?.length > 0 && (
            <div className="mb-3">
              <img
                src={comment.images[0]}
                alt="comment-img"
                className="rounded-lg cursor-pointer w-64 h-auto object-cover hover:opacity-90 transition"
                onClick={() => {
                  setModalImage(comment.images[0]);
                  setShowImageModal(true);
                }}
              />
            </div>
          )}

          {/* --- Stats --- */}
          <Stats
            likes={comment.likes || []}
            laughs={comment.laughs || []}
            comments={0}
            postId={parentPostId}
            answerId={comment.id}
            replies={comment.replies?.length || 0}
            isReply={true}
            onReplyToggle={() => setReplying(!replying)}
          />

          {/* --- 返信フォーム --- */}
          {replying && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder=""
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  className="flex-1 border rounded-md p-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 overflow-hidden"
                />
                <label className="cursor-pointer text-gray-500 hover:text-blue-500">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
                <button
                  onClick={handleReply}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition"
                >
                  送信
                </button>
              </div>

              {replyImage && (
                <div className="relative w-40 mt-2">
                  <img
                    src={URL.createObjectURL(replyImage)}
                    className="rounded-md"
                    alt="preview"
                  />
                  <button
                    onClick={() => setReplyImage(null)}
                    className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 rounded"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ネストされた返信 --- */}
      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              parentPostId={parentPostId}
            />
          ))}
        </div>
      )}

      {showImageModal && modalImage && (
        <ImageModal imageSrc={modalImage} onClose={() => setShowImageModal(false)} />
      )}
    </div>
  );
}