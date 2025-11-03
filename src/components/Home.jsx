
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostsContext";
import PostCard from "./PostCard";
import Header from "./Header";
import LayoutContainer from "./LayoutContainer";
import Sidebar from "./Sidebar";
import RecentPosts from "./RecentPosts";

export default function Home() {
  const { posts } = usePosts();
  const { name } = useParams();
  const navigate = useNavigate();

  const categories = [
    "総合",
    "くだらない日常",
    "インターネット文化",
    "ゲーム",
    "ポップカルチャー",
    "アニメ・コスプレ",
    "今日の飯ログ",
    "買ったもの・戦利品",
    "雑談なんでも",
  ];

  const defaultCategory = name ? decodeURIComponent(name) : "総合";
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  useEffect(() => {
    setActiveCategory(defaultCategory);
  }, [name]);

  const normalize = (str) => (str ? str.trim() : "");
  const filteredPosts =
    activeCategory === "総合"
      ? posts
      : posts.filter(
        (post) => normalize(post.category) === normalize(activeCategory)
      );

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === "総合") {
      navigate("/");
    } else {
      navigate(`/category/${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* 🧭 左サイドバー */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryClick}
      />

      {/* 🧱 メインコンテンツ全体 */}
      <div
        className="
          flex flex-1 gap-8
          w-full
          px-0 lg:px-8
          sm:pl-56
        "
      >
        {/* 🏠 投稿エリア（最大幅） */}
        <div className="flex-1 w-full">
          <Header />
          <main className="pt-4 pb-14">
            <LayoutContainer>
              {filteredPosts.length > 0 ? (
                <div className="space-y-0">
                  {filteredPosts.map((post, index) => (
                    <PostCard key={`${post.id}_${index}`} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                  {activeCategory} の投稿はまだありません
                </div>
              )}
            </LayoutContainer>
          </main>
        </div>

        {/* 🧩 最近の投稿（固定幅） */}
        <div
          className="
            hidden lg:block 
            w-[280px] shrink-0
            mt-[72px]
          "
        >
          <RecentPosts />
        </div>
      </div>
    </div>
  );
}