
import { useState, useEffect } from "react";

export default function URLCard({ url }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);

        const proxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
          `https://cors-anywhere.herokuapp.com/${url}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
          `https://thingproxy.freeboard.io/fetch/${url}`,
          `https://corsproxy.io/?${encodeURIComponent(url)}`,
        ];

        let success = false;

        for (const proxyUrl of proxies) {
          try {
            const response = await fetch(proxyUrl);
            if (!response.ok) continue;

            const data = await response.json();
            const htmlContent = data.contents || data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");

            const image =
              doc.querySelector('meta[property="og:image"]')?.content ||
              doc.querySelector('meta[name="twitter:image"]')?.content ||
              doc.querySelector('meta[name="twitter:image:src"]')?.content ||
              "";

            const siteName =
              doc.querySelector('meta[property="og:site_name"]')?.content ||
              new URL(url).hostname;

            setMetadata({ image, siteName, url });
            success = true;
            break;
          } catch {
            continue;
          }
        }

        if (!success) {
          setMetadata({
            image: "",
            siteName: new URL(url).hostname,
            url,
          });
        }
      } catch (err) {
        console.error("URL metadata fetch error:", err);
        setError("メタデータ取得失敗");
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchMetadata();
  }, [url]);

  // ローディング時
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl bg-gray-100 animate-pulse w-full aspect-[16/9]" />
    );
  }

  // エラー or メタデータなし
  if (error || !metadata) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-gray-200 rounded-xl overflow-hidden bg-gray-50 w-full"
      >
        <div className="aspect-[16/9] bg-gray-200" />
        <div className="px-3 py-2 text-xs text-gray-500 break-all">
          {new URL(url).hostname}
        </div>
      </a>
    );
  }

  // ✅ X風 レスポンシブカード
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-xl overflow-hidden bg-white hover:bg-gray-50 transition w-full"
    >
      {/* サムネイル */}
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

      {/* URLのみ */}
      <div className="px-3 py-2 text-xs text-gray-500 break-all">
        {metadata.siteName}
      </div>
    </a>
  );
}