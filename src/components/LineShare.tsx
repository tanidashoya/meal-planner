import { isURL } from "../lib/common";
import { Recipe } from "../modules/recipes/recipe.entity";
import { toast } from "react-toastify";
import { Button } from "./ui/button";

type Props = {
  targetRecipe: Recipe;
};

export const LineShare = ({ targetRecipe }: Props) => {
  const shareUrl =
    targetRecipe?.source && isURL(targetRecipe.source)
      ? targetRecipe.source
      : "";
  //lineShareUrlはshareUrlがURLの場合はそのURLを、それ以外は空文字列を返す
  // https://line.me/R/msg/text/?... は LINE公式の共有URL（Webリンク方式）
  //encodeURIComponent:URL として使っても壊れないように、安全な文字列に変換するための関数(URLエンコードしてエラーを起こさないようにする)
  const lineShareUrl = isURL(shareUrl)
    ? `https://line.me/R/msg/text/?${encodeURIComponent(shareUrl)}`
    : "";
  // LINE共有のハンドラー（ボタンを押したら共有する）
  const handleShareToLine = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isURL(shareUrl)) {
      toast.error("URLが不正です");
      return;
    }

    //navigater.share（Web Share APIのメソッド）に指定したオブジェクトをOSの共有UIに渡して、ユーザーが選んだ共有先アプリにその情報を共有する
    //Web Share API:スマホ（iPhone/Android）のブラウザで シェア用のネイティブUI（共有メニュー）を開く API。
    //Web Share APIは非同期関数async-awaitと組み合わせて使用する
    // if (navigator.share) :「このブラウザで Web Share API が使えるかどうか？」を確認している。
    try {
      if (navigator.share) {
        await navigator.share({
          title: targetRecipe?.title || "",
          text: targetRecipe?.title || "",
          url: shareUrl,
        });
      } else {
        // フォールバック: LINE URLを直接開く（Web Share APIが使えない場合はLINE URLを直接開く）
        // LINEの共有UIが立ち上がる
        window.open(lineShareUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      // ユーザーが共有をキャンセルした場合など
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("共有エラー:", error);
        toast.error("LINE共有エラーが発生しました");
        // エラー時もフォールバックとしてLINE URLを開く
        window.open(lineShareUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <>
      {shareUrl && (
        <Button
          variant="outline"
          className="!px-4 !py-5 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 bg-[#00C300] focus:!bg-[#00C300] focus-visible:!bg-[#00C300] !text-white focus:!text-white focus-visible:!text-white font-bold"
          onClick={handleShareToLine}
        >
          LINEで共有
        </Button>
      )}
    </>
  );
};
