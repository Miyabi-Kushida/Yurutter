import { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ImageModal({ imageSrc, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-w-4xl max-h-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✕ ボタン */}
        <button
          onClick={() => {
            console.log("close button clicked");
            onClose();
          }}
          className="absolute top-2 right-2 z-[10000] w-8 h-8 
             bg-black bg-opacity-50 text-white rounded-full 
             flex items-center justify-center hover:bg-opacity-70 transition-colors"
        >
          ✕
        </button>

        {/* 画像 */}
        <img
          src={imageSrc}
          alt="拡大画像"
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>,
    document.body
  );
}