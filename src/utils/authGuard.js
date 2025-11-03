// src/utils/authGuard.js

// 共通のアカウントチェック関数
export function hasAccount(openAuthModal) {
  const account = localStorage.getItem("bakatter-account");

  if (!account) {
    // モーダルを開く（関数が渡されている場合のみ）
    if (typeof openAuthModal === "function") {
      openAuthModal();
    }
    return false;
  }

  return true;
}