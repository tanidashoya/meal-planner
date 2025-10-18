import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ImageOgpProps {
  url: string;
  className?: string;
}

export const ImageOgp = ({ url, className }: ImageOgpProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ogp, setOgp] = useState<{ title?: string; description?: string; image?: string } | null>(null);

  const isURL = (url: string | null) => {
    try { new URL(url || ""); return true; } catch { return false; }
  };

  const getOgpPreview = async (url: string | null) => {
    if (!isURL(url)) return null;
    const cacheKey = `ogp_${url}`;
    const cached = localStorage.getItem(cacheKey);

    // 🔹キャッシュ有効期限（7日 = 604800000ms）
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (cached) {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < ONE_WEEK) {
        console.log("📦 ローカルキャッシュから取得:", url);
        return parsed.data;
      } else {
        console.log("🧹 キャッシュ期限切れ → 削除:", url);
        localStorage.removeItem(cacheKey);
      }
    }

    // 🔹Edge Function から取得
    const { data, error } = await supabase.functions.invoke("smooth-function", { body: { url } });
    if (error) {
      console.error("OGP取得エラー:", error);
      return null;
    }

    // 🔹新しいデータをキャッシュ
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    console.log("✅ サーバーから新規取得:", url);
    return data;
  };

  useEffect(() => {
    (async () => {
      if (!url) return;
      setIsLoading(true);
      const data = await getOgpPreview(url);
      setOgp(data);
      setIsLoading(false);
    })();
  }, [url]);

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {isLoading ? (
        <div className={`flex justify-center items-center ${className}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      ) : (
        ogp?.image ? (
          <img src={ogp.image} alt={ogp.title} className="w-full h-full object-contain" />
        ) : (
          <p className="text-gray-500">画像は存在しません</p>
        )
      )}
    </div>
  );
};
