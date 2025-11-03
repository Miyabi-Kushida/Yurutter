import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

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
          `https://corsproxy.io/?${encodeURIComponent(url)}`
        ];

        let success = false;

        for (const proxyUrl of proxies) {
          try {
            const response = await fetch(proxyUrl);
            if (!response.ok) continue;

            const data = await response.json();
            const htmlContent = data.contents || data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');

            const title = doc.querySelector('meta[property="og:title"]')?.content ||
              doc.querySelector('meta[name="twitter:title"]')?.content ||
              doc.querySelector('title')?.textContent ||
              'タイトルなし';

            const description = doc.querySelector('meta[property="og:description"]')?.content ||
              doc.querySelector('meta[name="twitter:description"]')?.content ||
              doc.querySelector('meta[name="description"]')?.content ||
              '';

            let image = doc.querySelector('meta[property="og:image"]')?.content ||
              doc.querySelector('meta[name="twitter:image"]')?.content ||
              doc.querySelector('meta[name="twitter:image:src"]')?.content ||
              '';

            if (image && !image.startsWith('http')) {
              const baseUrl = new URL(url).origin;
              image = image.startsWith('/') ? baseUrl + image : baseUrl + '/' + image;
            }

            if (!image) {
              const firstImg = doc.querySelector('img');
              if (firstImg && firstImg.src) {
                image = firstImg.src;
                if (!image.startsWith('http')) {
                  const baseUrl = new URL(url).origin;
                  image = image.startsWith('/') ? baseUrl + image : baseUrl + '/' + image;
                }
              }
            }

            const siteName = doc.querySelector('meta[property="og:site_name"]')?.content ||
              doc.querySelector('meta[name="twitter:site"]')?.content ||
              new URL(url).hostname;

            setMetadata({ title, description, image, siteName, url });
            success = true;
            break;
          } catch (err) {
            console.log(`Proxy failed: ${proxyUrl}`, err);
            continue;
          }
        }

        if (!success) {
          const domain = new URL(url).hostname;
          const title = domain.includes('youtube') ? 'YouTube動画' :
            domain.includes('twitter') || domain.includes('x.com') ? 'ツイート' :
              domain.includes('instagram') ? 'Instagram投稿' :
                domain.includes('tiktok') ? 'TikTok動画' :
                  `${domain} の記事`;

          setMetadata({
            title,
            description: `この${title}を開く`,
            image: '',
            siteName: domain,
            url
          });
        }

      } catch (err) {
        console.error('URL metadata fetch error:', err);
        setError('メタデータの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchMetadata();
  }, [url]);

  // ローディング時のプレースホルダー
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 animate-pulse max-w-full overflow-hidden">
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // エラー時またはメタデータなし
  if (error || !metadata) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 text-gray-500">
          <ExternalLink className="w-4 h-4" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-full">
            {url}
          </a>
        </div>
      </div>
    );
  }

  // ✅ 正常表示
  return (
    <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-200 hover:border-gray-300 w-full max-w-full">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full group">
        {/* 画像エリア */}
        {metadata.image && (
          <div className="relative bg-gray-100 overflow-hidden w-full max-w-full rounded-t-xl">
            <img
              src={metadata.image}
              alt={metadata.title}
              className="w-full h-auto max-h-[400px] object-contain sm:object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* コンテンツエリア */}
        <div className="p-4 w-full max-w-full">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors duration-200">
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1 font-medium truncate">{metadata.siteName}</div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {metadata.title}
              </h3>
              {metadata.description && (
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                  {metadata.description}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-400 truncate">{url}</div>
            </div>
          </div>
        </div>

        {/* ✅ ホバー時アクション（右にはみ出さない） */}
        <div className="absolute top-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-gray-600 font-medium whitespace-nowrap">
            開く
          </div>
        </div>
      </a>
    </div>
  );
}