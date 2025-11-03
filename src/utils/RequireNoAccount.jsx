import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireNoAccount({ element }) {
  const navigate = useNavigate();

  useEffect(() => {
    const account = JSON.parse(localStorage.getItem("bakatter-account") || "null");
    if (account) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const account = JSON.parse(localStorage.getItem("bakatter-account") || "null");
  if (account) {
    return null; // リダイレクト中は何も表示しない
  }

  return element;
}