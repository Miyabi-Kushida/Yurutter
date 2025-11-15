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
import { supabase } from "../utils/supabaseClient";

export default function Profile() {
  const [account, setAccount] = useState(null);
  const { posts } = usePosts();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("概要");
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  // ✅ アカウント情報を取得
  useEffect(() => {
    const fetchProfile = async () => {
      const saved = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

      try {
        if (id) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (error) console.error("Supabase取得エラー:", error.message);

          if (data) {
            setAccount({
              id: data.id,
              username: data.username || "名無し",
              emoji: data.avatar_url || "/icons/icon1.webp",
              bio: data.bio || "",
              createdAt: data.created_at || new Date().toISOString(),
            });
          } else {
            setAccount({
              id,
              username: "名無し",
              emoji: "👤",
              bio: "",
              createdAt: new Date().toISOString(),
            });
          }
        } else if (saved.id) {
          setAccount(saved);
        } else {
          navigate("/account-create", { replace: true });
        }
      } catch (err) {
        console.error("プロフィール取得エラー:", err);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        読み込み中...
      </div>
    );
  }

  const saved = JSON.parse(localStorage.getItem("bakatter-account") || "{}");
  const isMyProfile = !id || account.id === saved.id;
  const displayUsername = account.username || "名無し";
  const displayEmoji = account.emoji || "👤";

  // 投稿数・統計など
  const postCount = posts.filter((p) => String(p.userId) === String(account.id)).length;
  const answerCount = posts.reduce(
    (count, post) =>
      count + (post.replies?.filter((r) => String(r.userId) === String(account.id)).length || 0),
    0
  );

  const totalLikes = posts.reduce((sum, post) => {
    if (String(post.userId) === String(account.id))
      sum += Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
    if (post.replies?.length)
      sum += post.replies
        .filter((r) => String(r.userId) === String(account.id))
        .reduce(
          (rSum, r) => rSum + (Array.isArray(r.likes) ? r.likes.length : (r.likes || 0)),
          0
        );
    return sum;
  }, 0);

  const totalLaughs = posts.reduce((sum, post) => {
    if (String(post.userId) === String(account.id))
      sum += Array.isArray(post.laughs) ? post.laughs.length : (post.laughs || 0);
    if (post.replies?.length)
      sum += post.replies
        .filter((r) => String(r.userId) === String(account.id))
        .reduce(
          (rSum, r) => rSum + (Array.isArray(r.laughs) ? r.laughs.length : (r.laughs || 0)),
          0
        );
    return sum;
  }, 0);

  const recentPosts = posts
    .filter((p) => String(p.userId) === String(account.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const overviewItems = [
    ...posts
      .filter((p) => String(p.userId) === String(account.id))
      .map((p) => ({ ...p, type: "投稿", date: new Date(p.createdAt) })),
    ...posts.flatMap((p) =>
      (p.replies || [])
        .filter((r) => String(r.userId) === String(account.id))
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
                      alt="プロフィールアイコン"
                      onError={(e) => {
                        if (e.target.src !== "/icons/icon1.webp") {
                          e.target.src = "/icons/icon1.webp";
                        }
                      }}
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

              {/* --- タブ切り替え --- */}
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

              {/* --- タブ内容 --- */}
              <TabContent
                activeTab={activeTab}
                overviewItems={overviewItems}
                recentPosts={recentPosts}
                displayEmoji={displayEmoji}
                displayUsername={displayUsername}
                navigate={navigate}
                handleImageClick={handleImageClick}
              />
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

function EmptyCard({ text }) {
  return (
    <p className="text-gray-500 text-sm text-center bg-white py-5 rounded-xl shadow-inner">
      {text}
    </p>
  );
}

function TabContent({ activeTab, overviewItems, recentPosts, displayEmoji, displayUsername, navigate, handleImageClick }) {
  const filteredReplies = overviewItems.filter((i) => i.type === "回答");
  return (
    <>
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
          {filteredReplies.length > 0 ? (
            <div className="space-y-4">
              {filteredReplies.map((reply, i) => (
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
    </>
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
                alt="ユーザーアイコン"
                onError={(e) => {
                  if (e.target.src !== "/icons/icon1.webp") {
                    e.target.src = "/icons/icon1.webp";
                  }
                }}
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
            onImageClick={(i, e) => {
              e.stopPropagation();
              onImageClick && onImageClick(postImages, i);
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-6 text-[14px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <IconLike width={16} height={16} />
          <span>{Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <IconLaugh width={16} height={16} />
          <span>{Array.isArray(post.laughs) ? post.laughs.length : (post.laughs || 0)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <IconComment width={16} height={16} />
          <span>{post.replies?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}