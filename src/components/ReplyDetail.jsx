import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostsContext";
import Stats from "./Stats";
import ReportButton from "./ReportButton";
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import AuthModal from "./AuthModal";
import { formatRelativeTime } from "../utils/time";
import { SendHorizontal } from "lucide-react";

export default function ReplyDetail() {
  const { postId, answerId } = useParams();
  const navigate = useNavigate();
  const { getPostById, addReplyToAnswer } = usePosts();
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [reply, setReply] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const account = localStorage.getItem("bakatter-account");
    if (!account) {
      alert("アカウントが削除されたため、ホームに戻ります。");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

  useEffect(() => {
    const p = getPostById(postId);
    if (p) {
      setPost(p);
      setReply(p.replies?.find((r) => String(r.id) === String(answerId)) || null);
    }
    setLoading(false);
  }, [postId, answerId, getPostById]);

  const handleBack = () => navigate(`/post/${postId}`, { replace: true });

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!savedAccount?.id) {
      setShowAuthModal(true);
      return;
    }
    if (newReply.trim()) {
      addReplyToAnswer(postId, answerId, { text: newReply.trim() });
      setNewReply("");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );

  if (!post || !reply)
    return (
      <div className="min-h-screen bg-gray-100">
        <Header title="返信詳細" showBack onBack={() => navigate(-1)} />
        <LayoutContainer>
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-6">返信が見つかりません</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/post/${postId}`)}
                className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
              >
                投稿に戻る
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </LayoutContainer>
      </div>
    );

  const displayUser = (item) => {
    if (item.userId && savedAccount.id && item.userId === savedAccount.id) {
      return {
        username: savedAccount.username || item.username,
        emoji: savedAccount.emoji || item.emoji,
      };
    }
    return { username: item.username, emoji: item.emoji };
  };

  const replyUser = displayUser(reply);

  return (
    <div className="page-container bg-gray-100">
      <Header title="返信詳細" showBack onBack={handleBack} />

      <main className="pb-28 pt-4">
        <LayoutContainer>
          <div className="space-y-6 px-4">
            {/* --- 親コメント --- */}
            <article className="bg-white rounded-2xl shadow-card border border-gray-200 p-5">
              <header className="mb-3 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-gray-600">
                  <span className="text-xl">{replyUser.emoji || "👤"}</span>
                  <span className="font-semibold">{replyUser.username || "名無し"}</span>
                  <span className="text-gray-400">・</span>
                  <span className="text-gray-400">{formatRelativeTime(reply.createdAt)}</span>
                </div>
                <ReportButton post={reply} />
              </header>

              <p className="whitespace-pre-wrap text-[15px] text-gray-800 leading-relaxed tracking-[0.01em] mb-2">
                {reply.text}
              </p>

              <Stats
                likes={reply.likes}
                laughs={reply.laughs}
                comments={reply.comments}
                postId={post.id}
                answerId={reply.id}
                replies={reply.replies?.length || 0}
                isReply={true}
              />
            </article>

            {/* --- ネストされた返信（吹き出し風） --- */}
            <div className="space-y-5">
              <div className="text-sm font-medium text-gray-700 px-1 sm:px-0">
                返信 ({reply.replies?.length || 0})
              </div>

              {reply.replies?.length > 0 ? (
                reply.replies.map((r) => {
                  const nestedUser = displayUser(r);
                  return (
                    <div key={r.id} className="flex items-start gap-3">
                      {/* ← アイコンをカードの外へ */}
                      <div className="-ml-2 text-2xl select-none">{nestedUser.emoji || "👤"}</div>

                      {/* 吹き出しカード */}
                      <article
                        className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <header className="flex items-center justify-between mb-2">
                          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-gray-600">
                            <span className="font-semibold">{nestedUser.username || "名無し"}</span>
                            <span className="text-gray-400">・</span>
                            <span className="text-gray-400">
                              {formatRelativeTime(r.createdAt)}
                            </span>
                          </div>
                          <ReportButton post={r} />
                        </header>
                        <p className="whitespace-pre-wrap text-[15px] text-gray-800 leading-relaxed tracking-[0.01em]">
                          {r.text}
                        </p>
                      </article>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-xl shadow-card p-6 text-center">
                  <p className="text-gray-500">まだ返信がありません</p>
                </div>
              )}
            </div>
          </div>
        </LayoutContainer>
      </main>

      {/* --- 💬 Threads風 返信入力欄 --- */}
      <div className="sticky bottom-[64px] bg-white/80 backdrop-blur-md border-t border-gray-200 pt-3 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            {savedAccount.emoji || "🙂"}
          </div>
          <form
            onSubmit={handleSubmitReply} // ← ReplyDetailなら handleSubmitReply に
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex items-center shadow-sm transition-all focus-within:border-brand"
          >
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="返信を入力..."
              rows={1}
              maxLength={140}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              className="flex-1 bg-transparent resize-none overflow-hidden text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <span className="text-[12px] text-gray-400 mr-2">{140 - newReply.length}</span>
            <button
              type="submit"
              className="ml-2 bg-brand text-white p-2 rounded-full hover:bg-brand-dark active:scale-95 transition-all"
            >
              <SendHorizontal className="w-4 h-4" strokeWidth={2.2} />
            </button>
          </form>
        </div>
      </div>

      {/* --- モーダル --- */}
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