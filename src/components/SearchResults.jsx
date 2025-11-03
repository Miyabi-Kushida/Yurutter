import { useLocation } from "react-router-dom";
import { usePosts } from "../context/PostsContext";
import PostCard from "./PostCard";

export default function SearchResults() {
  const { search } = useLocation();
  const { posts } = usePosts();
  const query = new URLSearchParams(search).get("q")?.toLowerCase() || "";

  const results = posts.filter(
    (p) =>
      p.text?.toLowerCase().includes(query) ||
      p.username?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-3xl mx-auto pt-20 px-4 pb-28"> {/* ← ✅ ここ！ pb-28 を追加 */}
      <h1 className="text-xl font-bold mb-4">
        「{query}」の検索結果 ({results.length}件)
      </h1>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((post) => (
            <PostCard key={post.id} post={post} showCategory />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          該当する投稿がありません。
        </p>
      )}
    </div>
  );
}