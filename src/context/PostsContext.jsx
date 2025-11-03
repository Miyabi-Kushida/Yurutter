// src/context/PostsContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import postsData from "../data/posts.json";

const PostsContext = createContext();

/** ✅ 旧データ（数値形式）を配列形式に変換 */
const normalizePosts = (posts) => {
  return posts.map((post) => {
    const normalizeReplies = (replies) =>
      replies?.map((reply) => ({
        ...reply,
        likes: Array.isArray(reply.likes) ? reply.likes : [],
        laughs: Array.isArray(reply.laughs) ? reply.laughs : [],
        replies: normalizeReplies(reply.replies || []),
      })) || [];

    return {
      ...post,
      likes: Array.isArray(post.likes) ? post.likes : [],
      laughs: Array.isArray(post.laughs) ? post.laughs : [],
      replies: normalizeReplies(post.replies || []),
    };
  });
};

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem("bakatter-posts");
    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts);
        return normalizePosts(parsed);
      } catch (error) {
        console.error("Failed to parse saved posts:", error);
      }
    }
    return normalizePosts(postsData);
  });

  const [reportedItems, setReportedItems] = useState(() => {
    const saved = localStorage.getItem("reported-items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("bakatter-posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("reported-items", JSON.stringify(reportedItems));
  }, [reportedItems]);

  /** 投稿追加 */
  const addPost = (newPost) => {
    const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

    const post = {
      id: `p${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
      likes: [], // ← 配列に変更
      laughs: [],
      comments: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setPosts((prev) => [post, ...prev]);
    return post;
  };

  /** コメント追加（再帰） */
  const addNestedComment = (postId, parentId, newComment) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (String(post.id) !== String(postId)) return post;

        const addReplyRecursive = (comments) =>
          comments.map((c) => {
            if (String(c.id) === String(parentId)) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            if (c.replies?.length) {
              return { ...c, replies: addReplyRecursive(c.replies) };
            }
            return c;
          });

        if (!parentId) {
          return {
            ...post,
            replies: [...(post.replies || []), newComment],
          };
        } else {
          return {
            ...post,
            replies: addReplyRecursive(post.replies || []),
          };
        }
      })
    );
  };

  /** 👍😂 リアクションのトグル（投稿・コメント・返信対応：完全修正版） */
  const toggleReaction = (targetId, userId, type) => {
    const updateItem = (item) => {
      // 対象IDに一致
      if (String(item.id) === String(targetId)) {
        const arr = Array.isArray(item[type]) ? item[type] : [];
        const already = arr.includes(userId);
        const newArr = already
          ? arr.filter((id) => id !== userId)
          : [...arr, userId];
        return { ...item, [type]: newArr };
      }

      // 返信を再帰的に更新
      if (item.replies?.length) {
        const updatedReplies = item.replies.map(updateItem);
        return { ...item, replies: updatedReplies };
      }

      return item;
    };

    setPosts((prev) => prev.map(updateItem));
  };

  /** 投稿取得 */
  const getPostById = (postId) =>
    posts.find((p) => String(p.id) === String(postId));

  /** 削除（再帰対応） */
  const deletePost = (targetId) => {
    const removeRecursive = (items) =>
      items
        .filter((item) => String(item.id) !== String(targetId))
        .map((item) => ({
          ...item,
          replies: item.replies ? removeRecursive(item.replies) : [],
        }));
    setPosts((prev) => removeRecursive(prev));
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        addPost,
        addNestedComment,
        toggleReaction, // ← 完全修正版
        getPostById,
        deletePost,
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
  if (!context)
    throw new Error("usePosts must be used within a PostsProvider");
  return context;
}