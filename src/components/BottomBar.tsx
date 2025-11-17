import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import tasteIcon from "@/assets/taste_icon.webp";
import watchIcon from "@/assets/watch_icon.webp";
import { useNavigate } from "react-router-dom";
import unratedIcon from "@/assets/unrated_icon.webp";
import allIcon from "@/assets/all_recipes.webp";
import { useRef } from "react";

export const BottomBar = () => {
  const navigate = useNavigate();
  // タッチイベントが発火したかどうかを追跡するためのref
  // これはタッチとクリックの重複を防ぐための一般的なパターンです
  const touchHandled = useRef(false);

  //onTouchStart={(e) => {
  //  e.preventDefault();
  //  navigate("/");
  //}}
  //これでスマホでタッチしたときにブラウザのデフォルトの動作を防止して、コンポーネントの遷移を可能にしている
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-gray-200 bg-white w-full flex justify-center items-center gap-0 px-2 h-16 pb-1">
      <Button
        variant="outline"
        className="flex flex-col items-center hover:bg-white !px-2 !py-6 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none gap-1 flex-1"
        onClick={() => {
          // タッチイベントで既に遷移している場合はonClickを無視
          if (!touchHandled.current) {
            navigate("/");
          }
          // フラグをリセット
          touchHandled.current = false;
        }}
        onTouchStart={() => {
          touchHandled.current = true;
          navigate("/");
        }}
      >
        <PlusCircle className="size-7 text-gray-500" strokeWidth={1.5} />
        <span className="text-gray-500 text-[11px]">レシピ追加</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col items-center hover:bg-white !px-2 !py-6 lg:mt-2 !shadow-none  !outline-none focus:!outline-none focus-visible:!outline-none gap-1 flex-1"
        onClick={() => {
          if (!touchHandled.current) {
            navigate("/all-recipes");
          }
          touchHandled.current = false;
        }}
        onTouchStart={() => {
          touchHandled.current = true;
          navigate("/all-recipes");
        }}
      >
        <img src={allIcon} alt="all icon" className="size-7" />
        <span className="text-gray-500 text-[11px]">レシピ一覧</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col items-center hover:bg-white !px-2 !py-6 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none gap-1 flex-1"
        onClick={() => {
          if (!touchHandled.current) {
            navigate("/star-sort");
          }
          touchHandled.current = false;
        }}
        onTouchStart={() => {
          touchHandled.current = true;
          navigate("/star-sort");
        }}
      >
        <img src={tasteIcon} alt="taste icon" className="size-7" />
        <span className="text-gray-500 text-[11px]">おいしさ</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col items-center hover:bg-white !px-2 !py-6 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none gap-1 flex-1"
        onClick={() => {
          if (!touchHandled.current) {
            navigate("/time-sort");
          }
          touchHandled.current = false;
        }}
        onTouchStart={() => {
          touchHandled.current = true;
          navigate("/time-sort");
        }}
      >
        <img src={watchIcon} alt="watch icon" className="size-7" />
        <span className="text-gray-500 text-[11px]">調理時間</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col items-center hover:bg-white !px-2 !py-6 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none gap-1 flex-1"
        onClick={() => {
          if (!touchHandled.current) {
            navigate("/unrated-recipes");
          }
          touchHandled.current = false;
        }}
        onTouchStart={() => {
          touchHandled.current = true;
          navigate("/unrated-recipes");
        }}
      >
        <img src={unratedIcon} alt="unrated icon" className="size-7" />
        <span className="text-gray-500 text-[11px]">未評価</span>
      </Button>
    </div>
  );
};
