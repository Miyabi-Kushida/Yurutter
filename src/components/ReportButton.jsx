import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";

export default function ReportButton({ post }) {
  const { openAuthModal } = useAuth();
  const { deletePost, reportedItems, setReportedItems } = usePosts();

  const account = JSON.parse(localStorage.getItem("bakatter-account") || "{}");

  const isMyPost = post?.userId && account?.id && post.userId === account.id;
  const alreadyReported = post?.id ? reportedItems?.includes(post.id) : false;

  const handleReport = (e) => {
    e.stopPropagation();

    if (!account?.id) {
      openAuthModal();
      return;
    }

    if (alreadyReported) {
      alert("この投稿はすでに通報しました。");
      return;
    }

    setReportedItems((prev) => [...prev, post.id]);
    alert("通報しました！");
  };

  const handleDelete = (e) => {
    e.stopPropagation();

    if (window.confirm("この投稿を削除しますか？")) {
      deletePost(post.id);
      alert("削除しました。");
    }
  };

  return (
    <button
      onClick={isMyPost ? handleDelete : handleReport}
      className={`ml-auto rounded-full border px-3 py-1 text-xs 
        ${isMyPost
          ? "border-gray-300 text-gray-600 hover:bg-gray-50"
          : alreadyReported
          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
          : "border-red-200 text-red-600 hover:bg-red-50"}
        active:scale-[0.98]`}
      disabled={!isMyPost && alreadyReported}
    >
      {isMyPost ? "削除" : alreadyReported ? "通報済み" : "通報"}
    </button>
  );
}