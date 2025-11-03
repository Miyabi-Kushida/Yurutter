import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { showModal, closeAuthModal } = useAuth(); // ← showAuthModal → showModal に修正
  const navigate = useNavigate();

  if (!showModal) return null; // ← 同じく showModal に修正

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-lg p-6 w-80 text-center">
        <h2 className="text-lg font-bold mb-2">アカウントが必要です</h2>
        <p className="text-sm text-gray-600 mb-4">
          この機能を利用するにはアカウントを作成してください。
        </p>

        <button
          onClick={() => {
            closeAuthModal();
            navigate("/account/create");
          }}
          className="w-full bg-brand text-white py-2 rounded-lg mb-2"
        >
          アカウント作成へ
        </button>

        <button
          onClick={closeAuthModal}
          className="w-full bg-gray-200 py-2 rounded-lg"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}