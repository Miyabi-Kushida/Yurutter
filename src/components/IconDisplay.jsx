// src/components/IconDisplay.jsx
import React from "react";

/**
 * アイコン表示用コンポーネント
 * @param {string} iconValue - 絵文字または /icons/ パス
 * @param {string} size - Tailwindのサイズクラス（例: text-2xl, text-6xl）
 * @param {string} className - 追加のクラス指定
 */
export default function IconDisplay({ iconValue, size = "text-2xl", className = "" }) {
  // 画像アイコンの場合（/icons/〜で始まる）
  if (iconValue && iconValue.startsWith("/icons/")) {
    return (
      <img
        src={iconValue}
        alt="プロフィールアイコン"
        className={`${className}`}
        style={{
          width:
            size === "text-6xl"
              ? "4rem"
              : size === "text-2xl"
              ? "1.75rem"
              : "2.5rem",
          height: "auto",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  }

  // 絵文字などフォールバック
  return <span className={`${size} ${className}`}>{iconValue || "😎"}</span>;
}