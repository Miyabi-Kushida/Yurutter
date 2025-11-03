import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import RecentPosts from "./RecentPosts";
import URLCard from "./URLCard";
import { extractURLs, removeURLsFromText } from "../utils/url";
import { formatAccountDate, calcAccountAge } from "../utils/date";
import { usePosts } from "../context/PostsContext";
import { IconLike, IconLaugh, IconComment } from "./Icons";
import ImageCarousel from "./ImageCarousel";
import ImageModal from "./ImageModal";

export default function Profile() {
  const [account, setAccount] = useState(null);
  const { posts } = usePosts();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("概要");
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  // ✅ アカウント情報をセット（自分 or 他人）
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

    // 🚫 posts未ロード時は待機
    if (!posts || posts.length === 0) return;

    if (id) {
      // 他人プロフィール
      if (id !== saved.id) {
        const userPosts = posts.filter((p) => String(p.userId) === String(id));
        if (userPosts.length > 0) {
          const latest = userPosts[0];
          setAccount({
            id,
            username: latest.username,
            emoji: latest.emoji,
            bio: latest.bio || "",
            createdAt: latest.createdAt || new Date().toISOString(),
          });
        } else {
          // 投稿がない相手でも仮プロフィール生成
          setAccount({
            id,
            username: "名無し",
            emoji: "👤",
            bio: "",
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // 自分のプロフィールID指定時
        setAccount(saved);
      }
    } else if (saved.id) {
      // /profile に直接来た場合
      setAccount(saved);
    } else {
      navigate("/account-create", { replace: true });
    }
  }, [id, posts, navigate]);

  // 🔄 読み込み中
  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        読み込み中...
      </div>
    );
  }

  const isMyProfile =
    !id || (account.id && account.id === JSON.parse(localStorage.getItem("bakatter-account") || "{}").id);

  const displayUsername = account.username || "名無し";
  const displayEmoji = account.emoji || "👤";

  // 投稿・回答数
  const postCount = posts.filter((p) => p.userId === account.id).length;
  const answerCount = posts.reduce(
    (count, post) =>
      count + (post.replies?.filter((r) => r.userId === account.id).length || 0),
    0
  );

  // 💡 グッド・笑 の合計数を算出
  const totalLikes = posts.reduce((sum, post) => {
    // 投稿が自分のものなら、そのlikesを加算
    if (String(post.userId) === String(account.id)) {
      sum += Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
    }
    // 回答にもlikesがあれば加算
    if (post.replies?.length) {
      const replyLikes = post.replies
        .filter((r) => String(r.userId) === String(account.id))
        .reduce((rSum, r) => {
          return rSum + (Array.isArray(r.likes) ? r.likes.length : (r.likes || 0));
        }, 0);
      sum += replyLikes;
    }
    return sum;
  }, 0);

  const totalLaughs = posts.reduce((sum, post) => {
    if (String(post.userId) === String(account.id)) {
      sum += Array.isArray(post.laughs) ? post.laughs.length : (post.laughs || 0);
    }
    if (post.replies?.length) {
      const replyLaughs = post.replies
        .filter((r) => String(r.userId) === String(account.id))
        .reduce((rSum, r) => {
          return rSum + (Array.isArray(r.laughs) ? r.laughs.length : (r.laughs || 0));
        }, 0);
      sum += replyLaughs;
    }
    return sum;
  }, 0);

  // 投稿一覧
  const recentPosts = posts
    .filter((p) => p.userId === account.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 概要タブ
  const overviewItems = [
    ...posts
      .filter((p) => String(p.userId) === String(account.id))
      .map((p) => ({ ...p, type: "投稿", date: new Date(p.createdAt) })),
    ...posts.flatMap((p) =>
      (p.replies || [])
        .filter((r) => r.userId && String(r.userId) === String(account.id))
        .map((r) => ({
          ...r,
          type: "回答",
          date: r.createdAt ? new Date(r.createdAt) : new Date(p.createdAt),
          parentCategory: p.category,
        }))
    ),
  ].sort((a, b) => b.date - a.date);

  const tabItems = ["概要", "投稿", "回答"];

  const handleImageClick = (images, index) => {
    setModalImageIndex(index);
    setCurrentImages(images);
    setShowImageModal(true);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 gap-8 w-full px-4 lg:px-8">
        <div className="w-full lg:flex-[0.8] lg:max-w-[950px]">
          <Header title="プロフィール" />
          <main className="pt-4 pb-14">
            <LayoutContainer>
              {/* --- プロフィールヘッダー --- */}
              <div className="text-center pb-6 mb-6 border-b border-gray-200">
                <div
                  onClick={() => isMyProfile && navigate("/settings")}
                  className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center
                    bg-gray-50 border border-gray-200 shadow-inner
                    ${isMyProfile ? "cursor-pointer hover:scale-105 active:scale-95 transition-transform" : ""}
                    overflow-hidden`}
                >
                  {displayEmoji?.startsWith("/icons/") ? (
                    <img
                      src={displayEmoji}
                      onError={(e) => {
                        if (displayEmoji.endsWith(".png"))
                          e.target.src = displayEmoji.replace(".png", ".jpg");
                      }}
                      alt="プロフィールアイコン"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl sm:text-6xl">{displayEmoji}</span>
                  )}
                </div>

                <h2 className="mt-4 text-lg sm:text-2xl font-bold text-gray-800 break-words">
                  {displayUsername}
                </h2>

                <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
                  {account.bio || (isMyProfile ? "よろしくお願いします！" : "投稿ユーザーです。")}
                </p>

                <p className="mt-3 text-xs sm:text-sm text-gray-400 italic">
                  {formatAccountDate(account.createdAt)}・{calcAccountAge(account.createdAt)}
                </p>

                <div className="mt-6 flex justify-center border-t border-gray-100 pt-4 text-gray-700">
                  <div className="flex gap-6 sm:gap-10">
                    <Stat label="投稿" value={postCount} />
                    <Stat label="回答" value={answerCount} />
                    <IconStat icon={<IconLike width={18} height={18} />} value={totalLikes} />
                    <IconStat icon={<IconLaugh width={18} height={18} />} value={totalLaughs} />
                  </div>
                </div>
              </div>

              {/* --- タブ --- */}
              <div className="flex justify-center mb-6 border-b border-gray-200">
                {tabItems.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium text-sm sm:text-base transition-all ${activeTab === tab
                        ? "text-brand border-b-2 border-brand"
                        : "text-gray-500 hover:text-brand/70"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* --- 各タブ内容 --- */}
              {activeTab === "概要" && (
                <Section title="📜 概要">
                  {overviewItems.length > 0 ? (
                    <div className="space-y-4">
                      {overviewItems.map((item, i) => (
                        <PostCard
                          key={i}
                          post={item}
                          emoji={displayEmoji}
                          username={displayUsername}
                          navigate={navigate}
                          showCategory
                          onImageClick={handleImageClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyCard text="まだ投稿や回答がありません" />
                  )}
                </Section>
              )}

              {activeTab === "投稿" && (
                <Section title="📝 投稿">
                  {recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {recentPosts.map((post, i) => (
                        <PostCard
                          key={post.id || i}
                          post={post}
                          emoji={displayEmoji}
                          username={displayUsername}
                          navigate={navigate}
                          showCategory
                          onImageClick={handleImageClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyCard text="まだ投稿がありません" />
                  )}
                </Section>
              )}

              {activeTab === "回答" && (
                <Section title="💬 回答">
                  {overviewItems.filter((i) => i.type === "回答").length > 0 ? (
                    <div className="space-y-4">
                      {overviewItems
                        .filter((i) => i.type === "回答")
                        .map((reply, i) => (
                          <PostCard
                            key={i}
                            post={reply}
                            emoji={displayEmoji}
                            username={displayUsername}
                            navigate={navigate}
                            showCategory
                            onImageClick={handleImageClick}
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyCard text="まだ回答がありません" />
                  )}
                </Section>
              )}
            </LayoutContainer>
          </main>
        </div>

        {/* サイド */}
        <div className="hidden lg:block lg:flex-[0.2] lg:w-[300px] shrink-0 mt-[72px]">
          <RecentPosts />
        </div>
      </div>

      {showImageModal && (
        <ImageModal
          imageSrc={currentImages[modalImageIndex]}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}

/* --- 補助コンポーネント --- */
function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-base sm:text-lg font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    </div>
  );
}

function IconStat({ icon, value }) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      <p className="text-xs sm:text-sm mt-0.5 text-gray-600">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-gray-700 font-semibold text-base sm:text-lg flex items-center gap-2 mb-3 sm:mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function PostCard({ post, emoji, username, navigate, showCategory, onImageClick }) {
  const category = post.category || post.parentCategory || "未分類";
  const postImages =
    Array.isArray(post.images) && post.images.length > 0
      ? post.images
      : post.image
        ? [post.image]
        : [];
  const urls = extractURLs(post.text || "");
  const textWithoutURLs = removeURLsFromText(post.text || "");

  return (
    <div
      onClick={() => {
        if (post.postId) navigate(`/post/${post.postId}?commentId=${post.id}`);
        else navigate(`/post/${post.id}`);
      }}
      className="py-5 border-b border-gray-200 hover:bg-gray-50/70 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
            {emoji?.startsWith("/icons/") ? (
              <img
                src={emoji}
                onError={(e) => (e.target.src = emoji.replace(".png", ".jpg"))}
                alt="ユーザーアイコン"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl">{emoji || "👤"}</span>
            )}
          </div>
          <span className="font-semibold text-[15px]">{username || "名無し"}</span>
          <span className="text-gray-400 text-sm">
            ・
            {new Date(post.createdAt).toLocaleString("ja-JP", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {showCategory && (
          <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {category}
          </span>
        )}
      </div>

      {textWithoutURLs && (
        <p className="text-[15px] sm:text-[16px] text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
          {textWithoutURLs}
        </p>
      )}

      {urls.length > 0 && (
        <div className="mb-3">
          {urls.map((url, index) => (
            <div key={index} className="mb-2">
              <URLCard url={url} />
            </div>
          ))}
        </div>
      )}

      {postImages.length > 0 && (
        <div className="mb-3">
          <ImageCarousel
            images={postImages}
            onImageClick={(i, e) => {
              e.stopPropagation();
              onImageClick && onImageClick(postImages, i);
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-6 text-[14px] text-gray-500">
        {/* 👍 いいね */}
        <div className="flex items-center gap-1.5">
          <IconLike width={16} height={16} />
          <span>{Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}</span>
        </div>

        {/* 🤣 笑い */}
        <div className="flex items-center gap-1.5">
          <IconLaugh width={16} height={16} />
          <span>{Array.isArray(post.laughs) ? post.laughs.length : (post.laughs || 0)}</span>
        </div>

        {/* 💬 コメント */}
        <div className="flex items-center gap-1.5">
          <IconComment width={16} height={16} />
          <span>{post.replies?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <p className="text-gray-500 text-sm text-center bg-white py-5 rounded-xl shadow-inner">
      {text}
    </p>
  );
}