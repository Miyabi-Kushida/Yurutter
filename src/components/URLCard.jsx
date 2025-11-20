import { useState, useEffect } from "react";

export default function URLCard({ url }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);

        // Supabase Edge Function を叩く
        const res = await fetch(
          "https://nizcfjxngngqidgwzexc.supabase.co/functions/v1/url-preview",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          }
        );

        const data = await res.json();

        if (!data.success) {
          setMetadata(null);
          return;
        }

        setMetadata({
          image: data.image,
          siteName: data.siteName,
        });
      } catch (err) {
        console.error(err);
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchMetadata();
  }, [url]);

  // ローディング
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl bg-gray-100 animate-pulse w-full aspect-[16/9]" />
    );
  }

  // 画像なし or メタデータなし
  if (!metadata) {
    return (
      <a href={url} className="block border p-2 rounded-xl text-xs text-gray-500">
        {new URL(url).hostname}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-xl overflow-hidden bg-white"
    >
      {/* サムネイル */}
      {metadata.image ? (
        <img src={metadata.image} className="w-full aspect-[16/9] object-cover" />
      ) : (
        <div className="w-full aspect-[16/9] bg-gray-200" />
      )}

      <div className="px-3 py-2 text-xs text-gray-500 break-all">
        {metadata.siteName}
      </div>
    </a>
  );
}
