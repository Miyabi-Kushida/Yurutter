import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageCarousel({ images = [], onImageClick }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;

  const next = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-black">
      {/* 🖼 スライダー本体 */}
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex justify-center items-center flex-none w-full bg-black"
            style={{
              height: "auto",
              maxHeight: "500px", // Redditっぽい高さ上限
            }}
          >
            <img
              src={src}
              alt={`投稿画像 ${i + 1}`}
              className="max-h-[500px] max-w-full object-contain rounded-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
              // 🧩 イベントとindexを渡す（e.stopPropagation用）
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.(i, e);
              }}
            />
          </div>
        ))}
      </div>

      {/* ⬅️➡️ ナビゲーション */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <ChevronRight size={20} />
          </button>

          {/* 🔵 ページインジケータ */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === current ? "bg-white" : "bg-gray-400/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}