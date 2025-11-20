import { useState, useEffect } from "react";

export default function URLCard({ url }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;

    const fetchMeta = async () => {
      try {
        const response = await fetch(
          "https://nizcfjxngngqidgwzexc.supabase.co/functions/v1/url-preview",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          }
        );

        const data = await response.json();
        if (data.success) {
          setMetadata(data);
        } else {
          setMetadata({ image: "", siteName: new URL(url).hostname });
        }
      } catch (err) {
        setMetadata({ image: "", siteName: new URL(url).hostname });
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [url]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl bg-gray-100 animate-pulse w-full aspect-[16/9]" />
    );
  }

  if (!metadata) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-xl overflow-hidden bg-white hover:bg-gray-50 transition w-full"
    >
      {metadata.image ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={metadata.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-gray-100" />
      )}

      <div className="px-3 py-2 text-xs text-gray-500 break-all">
        {metadata.siteName}
      </div>
    </a>
  );
}
