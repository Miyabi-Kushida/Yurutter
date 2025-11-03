import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PostsProvider } from "./context/PostsContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./components/Home";
import PostDetail from "./components/PostDetail";
import ReplyDetail from "./components/ReplyDetail";
import NewPost from "./components/NewPost";
import Profile from "./components/Profile";
import AccountSettings from "./components/AccountSettings";
import AuthModal from "./components/AuthModal";
import SearchResults from "./components/SearchResults";
import ScrollToTop from "./components/ScrollToTop";
import AccountCreate from "./components/AccountCreate";

// ✅ ログイン済みなら /account/create に入れないように制御
function ProtectedRoute({ children }) {
  const savedAccount = JSON.parse(localStorage.getItem("bakatter-account") || "null");
  if (savedAccount) {
    return <Navigate to="/" replace />; // トップへリダイレクト
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <ScrollToTop />
        <Routes>
          {/* ✅ 共通レイアウトを使用するルート */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:name" element={<Home />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/post/:postId/answers/:answerId" element={<ReplyDetail />} />
            <Route path="/new" element={<NewPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>

          {/* ✅ アカウント作成ページは未ログイン時のみアクセス可 */}
          <Route
            path="/account/create"
            element={
              <ProtectedRoute>
                <AccountCreate />
              </ProtectedRoute>
            }
          />
        </Routes>

        <AuthModal />
      </PostsProvider>
    </AuthProvider>
  );
}