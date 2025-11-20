// src/components/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token) {
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(() => {
          navigate("/"); // 認証後にトップへ
        })
        .catch((e) => {
          console.error("Auth callback error:", e);
        });
    }
  }, []);

  return <div>ログイン処理中...</div>;
}
