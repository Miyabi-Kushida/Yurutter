import { useState, useEffect } from "react";

export default function URLCard({ url }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const FUNCTION_URL =
    "https://nizcfjxngngqidgwzexc.supabase.co/functions/v1/url-preview";

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("URLメタ取得失敗:", e);
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <div className="border rounded-xl bg-gray-100 animate-pulse w-full aspect-[16/9]" />
    );
  }

  if (!data?.success) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-gray-200 rounded-xl bg-gray-50 w-full"
      >
        <div className="aspect-[16/9] bg-gray-200" />
        <div className="px-3 py-2 text-xs text-gray-500 break-all">
          {new URL(url).hostname}
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition w-full"
    >
      {data.image ? (
        <img
          src={data.image}
          className="w-full h-auto aspect-[16/9] object-cover"
        />
      ) : (
        <div className="aspect-[16/9] bg-gray-100" />
      )}
      <div className="px-3 py-2 text-xs text-gray-500 break-all">
        {data.siteName}
      </div>
    </a>
  );
}
