// src/components/IconTest.jsx
import { IconLike, IconLaugh, IconComment, IconShare } from "./Icons";

export default function IconTest() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Reddit風アイコンテスト</h1>
      <div className="flex gap-8">
        <IconLike />
        <IconLaugh />
        <IconComment />
        <IconShare />
      </div>
    </div>
  );
}