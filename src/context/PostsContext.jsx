import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const PostsContext = createContext();

/** ✅ データ整形関数（旧仕様との互換保持） */
const normalizePosts = (posts) => {
  return posts.map((post) => ({
    ...post,
    likes: Array.isArray(post.likes) ? post.likes : [],
    laughs: Array.isArray(post.laughs) ? post.laughs : [],
    replies: Array.isArray(post.replies) ? post.replies : [],
    createdAt: post.createdAt ?? post.created_at ?? null,
  }));
};

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);

  /** ✅ 投稿一覧取得 */
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      const saved = localStorage.getItem("bakatter-posts");
      if (saved) setPosts(JSON.parse(saved));
    } else {
      const normalized = normalizePosts(data || []);
      setPosts(normalized);
      localStorage.setItem("bakatter-posts", JSON.stringify(normalized));
    }
  };

  /** ✅ 初回ロード */
  useEffect(() => {
    fetchPosts();

    const savedReports = localStorage.getItem("reported-items");
    if (savedReports) setReportedItems(JSON.parse(savedReports));
  }, []);

  /** ✅ 投稿追加（SupabaseにINSERT + 直後にDBから最新行を再取得） */
const addPost = async (newPost) => {
  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

  // INSERT 用のデータ
  const post = {
    userId: savedAccount.id || "guest",
    username: savedAccount.username || "名無し",
    emoji: savedAccount.emoji || "👤",
    text: newPost.text || "",
    category: newPost.category || "未分類",
    images: Array.isArray(newPost.images)
      ? newPost.images
      : newPost.image
      ? [newPost.image]
      : [],
    likes: [],
    laughs: [],
    replies: [],
    comments: 0,
    created_at: new Date().toISOString(),
  };

  // -----------------------------
  // ① Supabase に INSERT
  // -----------------------------
  const { data: inserted, error: insertError } = await supabase
    .from("posts")
    .insert([post])
    .select()
    .single();

  if (insertError) {
    console.error("❌ Supabase insert error:", insertError.message);
    setPosts((prev) => [post, ...prev]);
    return post;
  }

  // -----------------------------
  // ② INSERT 終了後、DB の最新行を取得
  //     ここで og_image / og_title / og_description が反映される
  // -----------------------------
  const { data: fresh, error: fetchError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", inserted.id)
    .single();

  const finalPost = fetchError ? inserted : fresh;

  // -----------------------------
  // ③ ローカル state の更新
  // -----------------------------
  setPosts((prev) => [finalPost, ...prev]);

  return finalPost;
};

  /** ✅ コメント追加（親コメント対応） */
  const addNestedComment = async (postId, parentId, newComment) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("replies")
        .eq("id", postId)
        .single();

      if (error) throw error;

      const currentReplies = Array.isArray(data.replies) ? data.replies : [];

      // 🧠 再帰的に対象コメントへ挿入
      const insertReply = (comments, parentId, newReply) => {
        if (!parentId) return [...comments, newReply];
        return comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : { ...c, replies: insertReply(c.replies || [], parentId, newReply) }
        );
      };

      const updatedReplies = insertReply(currentReplies, parentId, newComment);

      const { error: updateError } = await supabase
        .from("posts")
        .update({ replies: updatedReplies })
        .eq("id", postId);

      if (updateError) throw updateError;

      // ✅ ローカルstateも更新
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, replies: updatedReplies } : p))
      );
    } catch (err) {
      console.error("❌ コメント追加失敗:", err.message);
    }
  };

  /** ✅ リアクション更新（Supabase + ローカル両方反映） */
  const toggleReaction = async (targetId, userId, type) => {
    let optimisticValue = null;

    setPosts((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(targetId)) {
          const arr = Array.isArray(item[type]) ? item[type] : [];
          const already = arr.includes(userId);
          optimisticValue = already ? arr.filter((id) => id !== userId) : [...arr, userId];
          return { ...item, [type]: optimisticValue };
        }
        return item;
      })
    );

    if (!optimisticValue) return null;

    const { error } = await supabase
      .from("posts")
      .update({ [type]: optimisticValue })
      .eq("id", targetId);

    if (error) {
      console.error("❌ Supabase update error:", error.message);
      fetchPosts();
    } else {
      fetchPosts();
    }

    return optimisticValue;
  };

  /** ✅ コメント・返信のリアクション更新 */
  const toggleCommentReaction = async (postId, commentId, userId, type) => {
    let optimisticReplies = null;
    let updatedTarget = null;

    const updateReplies = (items = []) => {
      let changed = false;

      const updatedItems = items.map((item) => {
        if (String(item.id) === String(commentId)) {
          const arr = Array.isArray(item[type]) ? item[type] : [];
          const already = arr.includes(userId);
          const nextValue = already ? arr.filter((id) => id !== userId) : [...arr, userId];
          changed = true;
          updatedTarget = nextValue;
          return {
            ...item,
            [type]: nextValue,
          };
        }

        if (item.replies?.length) {
          const { updated: nestedUpdated, changed: nestedChanged } = updateReplies(
            item.replies
          );
          if (nestedChanged) {
            changed = true;
            return { ...item, replies: nestedUpdated };
          }
        }

        return item;
      });

      return { updated: updatedItems, changed };
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (String(post.id) !== String(postId)) return post;

        const { updated, changed } = updateReplies(post.replies || []);
        if (!changed) return post;

        optimisticReplies = updated;
        return { ...post, replies: updated };
      })
    );

    if (!optimisticReplies || !updatedTarget) return null;

    const { error } = await supabase
      .from("posts")
      .update({ replies: optimisticReplies })
      .eq("id", postId);

    if (error) {
      console.error("❌ コメントリアクション更新失敗:", error.message);
      fetchPosts();
    } else {
      fetchPosts();
    }

    return updatedTarget;
  };

  /** 🗑 投稿削除 */
  const deletePost = async (targetId) => {
    await supabase.from("posts").delete().eq("id", targetId);
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(targetId)));
  };

  /** 🔹 コメント削除（ネスト対応） */
  const deleteComment = async (postId, commentId) => {
    try {
      const { data } = await supabase.from("posts").select("replies").eq("id", postId).single();

      if (!data) return;
      const currentReplies = Array.isArray(data.replies) ? data.replies : [];

      // 再帰的削除
      const removeRecursive = (comments) =>
        comments
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: removeRecursive(c.replies || []),
          }));

      const updatedReplies = removeRecursive(currentReplies);

      // Supabase更新
      const { error } = await supabase
        .from("posts")
        .update({ replies: updatedReplies })
        .eq("id", postId);
      if (error) throw error;

      // State更新
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, replies: updatedReplies } : p))
      );
    } catch (err) {
      console.error("❌ コメント削除失敗:", err.message);
    }
  };

  /** 🪶 投稿取得 */
  const getPostById = (id) => posts.find((p) => String(p.id) === String(id));

  /** 🚨 通報リスト保存 */
  useEffect(() => {
    localStorage.setItem("reported-items", JSON.stringify(reportedItems));
  }, [reportedItems]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        addPost,
        addNestedComment,
        toggleReaction,
        toggleCommentReaction,
        getPostById,
        deletePost,
        deleteComment, // 🔹 追加
        fetchPosts,
        reportedItems,
        setReportedItems,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) throw new Error("usePosts must be used within a PostsProvider");
  return context;
}
