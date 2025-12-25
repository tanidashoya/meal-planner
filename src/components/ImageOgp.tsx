import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { isURL } from "../lib/common";

interface ImageOgpProps {
  url: string;
  className?: string;
  onOgpError?: () => void; // OGP取得失敗時のコールバック
}

export const ImageOgp = ({ url, className, onOgpError }: ImageOgpProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ogp, setOgp] = useState<{
    title?: string;
    description?: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    // isMounted:コンポーネントがマウントされているかどうかを管理
    let isMounted = true;

    const getOgpPreview = async (url: string | null) => {
      if (!isURL(url)) {
        return null;
      }
      const cacheKey = `ogp_${url}`;
      const ONE_DAY = 24 * 60 * 60 * 1000;
      const cached = localStorage.getItem(cacheKey);
      const now = Date.now();

      if (cached) {
        const parsed = JSON.parse(cached);
        // キャッシュされたデータが404エラーの場合はnullを返す
        if (parsed.data?.status === 404 || parsed.data?.error) {
          return null;
        }
        if (now - parsed.timestamp < ONE_DAY) {
          // console.log("📦 ローカルキャッシュから取得:", url);
          return parsed.data;
        } else {
          // console.log("🧹 キャッシュ期限切れ → 削除:", url);
          localStorage.removeItem(cacheKey);
        }
      }

      // 🔹Edge Function から取得
      const { data, error } = await supabase.functions.invoke("ogp-image", {
        body: { url },
      });
      if (error) {
        console.error("OGP取得エラー:", error);
        return null;
      }

      // 404エラーの場合はnullを返す
      if (data?.status === 404 || data?.error) {
        console.log("📛 ページが見つかりません:", url);
        return null;
      }

      // 🔹新しいデータをキャッシュ
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
      console.log("✅ サーバーから新規取得:", url);
      return data;
    };

    // 🔹URLが無効な場合は早期リターン（ogpとisLoadingをnullにして、コンポーネントをアンマウント）
    if (!url || !isURL(url)) {
      if (isMounted) {
        setOgp(null);
        setIsLoading(false);
      }
      return;
    }

    (async () => {
      setIsLoading(true);
      try {
        const data = await getOgpPreview(url);
        console.log("OGP結果:", url, data);
        if (isMounted) {
          setOgp(data);
          // OGP画像がない場合（dataがnull、またはdata.imageがない場合）はエラーコールバックを呼び出す
          if (!data || !data.image) {
            console.log("📛 OGP画像なし → 非表示対象:", url);
            onOgpError?.();
          }
        }
      } catch (err) {
        console.error("OGP取得エラー:", err);
        if (isMounted) {
          onOgpError?.();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    // ✅ クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [url, onOgpError]);

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {isLoading ? (
        <div className={`flex justify-center items-center ${className}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      ) : ogp?.image ? (
        <img
          src={ogp.image}
          alt={ogp.title}
          className="w-full h-full object-contain"
        />
      ) : (
        <p className="text-gray-500 text-center text-sm">画像は存在しません</p>
      )}
    </div>
  );
};
