
// src/components/PostDetail.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostsContext";
import Stats from "./Stats";
import ReportButton from "./ReportButton";
import Header from "./Header";
import ImageModal from "./ImageModal";
import LayoutContainer from "./LayoutContainer";
import AuthModal from "./AuthModal";
import RecentPosts from "./RecentPosts";
import { formatRelativeTime } from "../utils/time";
import { SendHorizontal, Image, X } from "lucide-react";
import ImageCarousel from "./ImageCarousel";
import CommentThread from "./CommentThread";
import URLCard from "./URLCard";
import { extractURLs, removeURLsFromText } from "../utils/url";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts, addNestedComment, deletePost } = usePosts();

  // ✅ Hooksはすべてトップレベルに固定
  const [newComment, setNewComment] = useState("");
  const [images, setImages] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ ローカルストレージは毎回パース（undefined対策）
  const savedAccount = useMemo(
    () => JSON.parse(localStorage.getItem("bakatter-account") || "{}"),
    []
  );

  // ✅ ページ遷移時スクロールリセット
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [postId]);

  // ✅ post取得を安定化（undefined対策＋useMemoでパフォーマンス改善）
  const post = useMemo(
    () => posts.find((p) => String(p.id) === String(postId)),
    [posts, postId]
  );

  // ✅ コメント送信処理
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!savedAccount?.id) {
      setShowAuthModal(true);
      return;
    }
    if (!newComment.trim() && images.length === 0) return;

    const uploadedUrls = await Promise.all(
      images.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_upload");
        const res = await fetch("https://api.cloudinary.com/v1_1/dlbr3gemb/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.secure_url;
      })
    );

    const newReply = {
      id: `c${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      postId,
      text: newComment.trim(),
      images: uploadedUrls,
      emoji: savedAccount?.emoji || "👤",
      username: savedAccount?.username || "名無し",
      userId: savedAccount?.id,
      createdAt: new Date().toISOString(),
      likes: [],
      laughs: [],
      replies: [],
    };

    // 🔥 ここでawaitを追加
    await addNestedComment(postId, null, newReply);
    setNewComment("");
    setImages([]);
  };

  // ✅ コメント返信処理
  const handleReply = async (parentId, replyData) => {
    const { text, image } = replyData;
    if (!savedAccount?.id) {
      setShowAuthModal(true);
      return;
    }

    let imageUrl = null;
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "unsigned_upload");
      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dlbr3gemb/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        imageUrl = data.secure_url;
      } catch (err) {
        console.error("画像アップロード失敗:", err);
      }
    }

    const newComment = {
      id: `r${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      postId,
      userId: savedAccount.id,
      username: savedAccount.username || "名無し",
      emoji: savedAccount.emoji || "👤",
      text,
      images: imageUrl ? [imageUrl] : [],
      createdAt: new Date().toISOString(),
      likes: [],
      laughs: [],
      replies: [],
    };

    addNestedComment(postId, parentId, newComment);
  };

  // ✅ 履歴保存（post が取得できるまで待機）
  useEffect(() => {
    if (!post) return;

    const stored = JSON.parse(localStorage.getItem("bakatter-recent") || "[]");
    const updated = [
      {
        id: post.id,
        text: post.text || "", // ← これを追加
        title: post.text?.slice(0, 40) || "（無題）",
        image: post.image || post.images?.[0] || null,
        category: post.category || "総合",
        user: post.username || "名無し",
        createdAt: post.createdAt,
      },
      ...stored.filter((p) => p.id !== post.id),
    ].slice(0, 10);
    localStorage.setItem("bakatter-recent", JSON.stringify(updated));
  }, [post]);

  // ✅ postが未取得時でもhooks順序を崩さず安全にreturn
  if (!post) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 w-full px-4 lg:px-8">
          <Header title="投稿詳細" showBack onBack={() => navigate(-1)} />
          <main className="pt-4 pb-14">
            <LayoutContainer>
              <div className="py-12 text-center">
                <p className="text-gray-500 mb-6">投稿が見つかりません</p>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-brand text-white rounded-lg"
                >
                  ホームに戻る
                </button>
              </div>
            </LayoutContainer>
          </main>
        </div>
      </div>
    );
  }

  // ✅ 表示用データ
  const isMyPost = post.userId && savedAccount.id && post.userId === savedAccount.id;
  const displayUsername = isMyPost
    ? savedAccount.username || post.username
    : post.username;
  const displayEmoji = isMyPost ? savedAccount.emoji || post.emoji : post.emoji;

  const postImages = Array.isArray(post.images)
    ? post.images
    : post.image
      ? [post.image]
      : [];

  const urls = extractURLs(post.text || "");
  const textWithoutURLs = removeURLsFromText(post.text || "");

  // ✅ イベントハンドラ
  const handleBack = () => navigate("/", { replace: true });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImages([file]);
  };
  const removeImage = () => setImages([]);
  const handleImageClick = (index, arr) => {
    setModalImageIndex(index);
    setCurrentImages(arr);
    setShowImageModal(true);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 gap-8 w-full px-4 lg:px-8">
        <div className="w-full lg:flex-[0.8] lg:max-w-[950px]">
          <Header title="投稿詳細" showBack onBack={handleBack} />
          <main className="pt-4 pb-14">
            <LayoutContainer>
              <div className="space-y-6">
                <article className="w-full border-b border-gray-200 py-5 hover:bg-gray-50 transition-colors">
                  {/* --- ヘッダー --- */}
                  <header className="mb-3 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-gray-600">
                      <div
                        className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer hover:opacity-80 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${post.userId}`);
                        }}
                      >
                        {displayEmoji?.startsWith("/icons/") ? (
                          <img
                            src={displayEmoji}
                            alt="ユーザーアイコン"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (e.target.src !== "/icons/icon1.webp") {
                                e.target.src = "/icons/icon1.webp";
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xl flex items-center justify-center w-full h-full">
                            {displayEmoji || "👤"}
                          </span>
                        )}
                      </div>

                      <span
                        className="font-semibold text-gray-800 cursor-pointer hover:text-brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${post.userId}`);
                        }}
                      >
                        {displayUsername || "名無し"}
                      </span>

                      <span className="text-gray-400">・</span>
                      <span className="text-gray-400">
                        {formatRelativeTime(post.createdAt)}
                      </span>

                      {post.category && (
                        <>
                          <span className="text-gray-400">・</span>
                          <span className="text-xs text-brand font-medium">
                            {post.category}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu((prev) => !prev);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                          />
                        </svg>
                      </button>

                      {showMenu && (
                        <div
                          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-[100px] z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {String(savedAccount.id) === String(post.userId) ? (
                            <button
                              onClick={() => {
                                if (window.confirm("この投稿を削除しますか？")) {
                                  deletePost(post.id);
                                  alert("削除しました。");
                                  navigate("/");
                                }
                              }}
                              className="w-full text-left text-red-500 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              削除
                            </button>
                          ) : (
                            <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                              <ReportButton post={post} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </header>

                  {/* --- 本文 --- */}
                  {textWithoutURLs && (
                    <p className="whitespace-pre-wrap text-[15px] text-gray-800 leading-relaxed mt-2 mb-3 tracking-[0.01em]">
                      {textWithoutURLs}
                    </p>
                  )}

                  {urls.length > 0 && (
                    <div className="mb-3">
                      {/* ✅ 最初のURLだけカード表示 */}
                      <div className="mb-2">
                        <URLCard url={urls[0]} />
                      </div>

                      {/* ✅ 2つ目以降はクリック可能リンクとして表示 */}
                      {urls.slice(1).map((url, i) => (
                        <div key={i} className="text-sm text-blue-500 hover:underline break-all mb-1">
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}


                  {postImages.length > 0 && (
                    <div className="mb-3">
                      <ImageCarousel
                        images={postImages}
                        onImageClick={(i) => handleImageClick(i, postImages)}
                      />
                    </div>
                  )}

                  <Stats
                    likes={post.likes}
                    laughs={post.laughs}
                    comments={post.comments}
                    postId={post.id}
                    replies={post.replies?.length || 0}
                  />

                  {/* --- コメント入力欄 --- */}
                  <div className="mt-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm mt-1 overflow-hidden">
                        {savedAccount.emoji?.startsWith("/icons/") ? (
                          <img
                            src={savedAccount.emoji}
                            alt="ユーザーアイコン"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (e.target.src !== "/icons/icon1.webp") {
                                e.target.src = "/icons/icon1.webp";
                              }
                            }}
                          />
                        ) : (
                          <span className="text-lg">{savedAccount.emoji || "🙂"}</span>
                        )}
                      </div>

                      <form
                        onSubmit={handleSubmitComment}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 flex flex-col shadow-sm focus-within:border-brand"
                      >
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="あなたの考えを共有しましょう"
                          rows={1}
                          maxLength={140}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                          }}
                          className="w-full bg-transparent resize-none overflow-hidden text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none"
                        />

                        {images.length > 0 && (
                          <div className="relative w-28 h-28 mt-2">
                            <img
                              src={URL.createObjectURL(images[0])}
                              alt="preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                              onClick={removeImage}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <label className="cursor-pointer text-brand hover:text-brand-dark flex items-center gap-1">
                            <Image size={18} />
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleImageChange}
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-400">
                              {140 - newComment.length}
                            </span>
                            <button
                              type="submit"
                              className="bg-brand text-white p-2 rounded-full hover:bg-brand-dark active:scale-95 transition-all"
                            >
                              <SendHorizontal className="w-4 h-4" strokeWidth={2.2} />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </article>

                {/* --- 画像モーダル --- */}
                {showImageModal && (
                  <ImageModal
                    imageSrc={currentImages[modalImageIndex]}
                    onClose={() => setShowImageModal(false)}
                  />
                )}

                {/* --- コメント欄 --- */}
                <div className="w-full mt-6">
                  {post.replies && post.replies.length > 0 ? (
                    post.replies.map((comment) => (
                      <CommentThread
                        key={comment.id}
                        comment={comment}
                        onReply={handleReply}
                        parentPostId={postId}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-10">
                      まだコメントがありません
                    </p>
                  )}
                </div>
              </div>
            </LayoutContainer>
          </main>
        </div>

        {/* --- 最近の投稿 --- */}
        <div className="hidden lg:block lg:flex-[0.2] lg:w-[300px] shrink-0 mt-[72px]">
          <RecentPosts />
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onConfirm={() => {
            setShowAuthModal(false);
            navigate("/account-create");
          }}
        />
      )}
    </div>
  );
}
