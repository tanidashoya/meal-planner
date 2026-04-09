//meal-plannerアプリのサイドバーの機能を実装する
import { authRepository } from "../../modules/auth/auth.repository";
import { useCurrentUserStore } from "../../modules/auth/current-user.state";
import { useNavigate } from "react-router-dom";
import { UserItem } from "./UserItem";
import { RecipeList } from "../RecipeList";
import { Item } from "./Item";
import { Search, PlusCircle, List } from "lucide-react";
import tasteIcon from "../../assets/taste_icon.webp";
import { Sheet } from "../ui/sheet";
import { PanelLeft } from "lucide-react";
import { SheetTrigger } from "../ui/sheet";
import { SheetContent } from "../ui/sheet";
import { useEffect, useRef } from "react";
import watchIcon from "../../assets/watch_icon.webp";
// import randomPicksIcon from "../../assets/random_picks.webp";
import { useRecipeStore } from "../../modules/recipes/recipe.state";
import { toast } from "react-toastify";
// import matchRecipeIcon from "../../assets/ai_search.png";
// import { useAiChoiceStore } from "../../modules/aiChoice/ai-choice.state";
// import outsideSiteIcon from "../../assets/outside_site.webp";
import weeklyRecipesIcon from "../../assets/weekly_recipes.png";
import allIcon from "../../assets/all_recipes.webp";

interface SideBarProps {
  openModal: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverLabel = ({ label }: { label: string }) => (
  <span className="pointer-events-none hidden lg:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
    {label}
  </span>
);

const MobileLabel = ({ label }: { label: string }) => (
  <span className="lg:hidden text-[10px] leading-none text-gray-500 mt-1 whitespace-nowrap">
    {label}
  </span>
);

export const SideBar = ({ openModal, open, setOpen }: SideBarProps) => {
  //AI処理中どうかの判定に使うグローバルステート
  // const aiChoiceStore = useAiChoiceStore();
  const currentUserStore = useCurrentUserStore();
  const currentUser = currentUserStore.currentUser;
  const recipeStore = useRecipeStore();
  const navigate = useNavigate();
  const touchHandled = useRef(false);
  //try-catch文を使用してエラーを捕捉する
  //AuthSessionMissingエラー以外のエラーやグローバルステートのnull化やページ遷移に失敗した場合はエラーを捕捉して処理を停止させないようにする
  const handleSignOut = async () => {
    try {
      await authRepository.signout();
      currentUserStore.set(null);
      recipeStore.clear();
      navigate("/signin");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    }
  };

  //サイドバーの開閉のショートカットキー
  //依存配列：open, setOpen
  //open, setOpenが変更されたらuseEffectが実行される
  //openの値が変化してuseEffectが再実行されることでイベントリスナーが再設定されてopenの正しい値を参照するようになる
  useEffect(() => {
    const handleOpenSideBar = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handleOpenSideBar);
    return () => window.removeEventListener("keydown", handleOpenSideBar);
  }, [open, setOpen]);

  const recipePanel = (
    <aside className="h-full bg-secondary border-r flex flex-col">
      {/* flex-shrink-0: 要素のサイズを縮小しない */}
      {/* flex-shrink-0がなければレシピが増えた際にサイドバーのサイズが縮小されてそのあとRecipeListがスクロール可能になる */}
      <div className="flex-shrink-0">
        <UserItem
          userEmail={currentUser?.email ?? ""}
          userName={currentUser?.userName ?? ""}
          signout={handleSignOut}
        />

        <div className="hover:bg-primary/5 mb-4 w-2/3 border ml-2 rounded-3xl bg-white">
          <Item label="Myレシピ検索" icon={Search} onClick={openModal} />
        </div>
        <div className="hover:bg-primary/5 mb-4 w-2/3 border ml-2 rounded-3xl bg-white">
          <Item
            label="全レシピ一覧"
            icon={List}
            onClick={() => {
              navigate("/all-recipes");
              setOpen(false);
            }}
          />
        </div>
      </div>
      {/* overflow-y-auto: 縦方向のスクロールを有効化 */}
      <div className="flex-1 overflow-y-auto h-full">
        <RecipeList setOpen={setOpen} />
      </div>
    </aside>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-white lg:right-auto lg:bottom-0 lg:w-20 lg:border-b-0 lg:border-r">
      <div className="flex items-end justify-around px-1 py-1 lg:flex-col lg:items-center lg:justify-start lg:h-full lg:overflow-y-auto lg:py-2 lg:px-1 lg:gap-2">
        {/* レシピ一覧（Sheet） */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div className="relative group">
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 lg:p-3 rounded-md hover:bg-gray-100"
              >
                <PanelLeft className="h-6 w-6 lg:h-7 lg:w-7 text-gray-500" strokeWidth={1.5} />
                <MobileLabel label="一覧" />
              </button>
              <HoverLabel label={open ? "レシピ一覧を閉じる" : "レシピ一覧を開く"} />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-[340px] md:w-[320px]">
            {recipePanel}
          </SheetContent>
        </Sheet>

        {/* ランダム提案 */}
        <div className="relative group">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 lg:p-3 rounded-md hover:bg-gray-100"
            onClick={() => {
              if (!touchHandled.current) navigate("/suggest-recipes");
              touchHandled.current = false;
            }}
            onTouchStart={() => { touchHandled.current = true; navigate("/suggest-recipes"); }}
          >
            <img src={weeklyRecipesIcon} alt="weekly recipes icon" className="h-6 w-6 lg:h-8 lg:w-8" />
            <MobileLabel label="ランダム" />
          </button>
          <HoverLabel label="ランダム提案" />
        </div>

        {/* === PC専用ボタン群（lg以上で表示） === */}
        <div className="hidden lg:flex flex-col items-center gap-2">
          <div className="relative group">
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 p-3 rounded-md hover:bg-gray-100"
              onClick={() => { if (!touchHandled.current) navigate("/"); touchHandled.current = false; }}
              onTouchStart={() => { touchHandled.current = true; navigate("/"); }}
            >
              <PlusCircle className="h-7 w-7 text-gray-500" strokeWidth={1.5} />
            </button>
            <HoverLabel label="レシピ追加" />
          </div>
          <div className="relative group">
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 p-3 rounded-md hover:bg-gray-100"
              onClick={() => { if (!touchHandled.current) navigate("/star-sort"); touchHandled.current = false; }}
              onTouchStart={() => { touchHandled.current = true; navigate("/star-sort"); }}
            >
              <img src={tasteIcon} alt="taste icon" className="h-7 w-7" />
            </button>
            <HoverLabel label="おいしさ順" />
          </div>
          <div className="relative group">
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 p-3 rounded-md hover:bg-gray-100"
              onClick={() => { if (!touchHandled.current) navigate("/time-sort"); touchHandled.current = false; }}
              onTouchStart={() => { touchHandled.current = true; navigate("/time-sort"); }}
            >
              <img src={watchIcon} alt="watch icon" className="h-7 w-7" />
            </button>
            <HoverLabel label="調理時間順" />
          </div>
          <div className="relative group">
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 p-3 rounded-md hover:bg-gray-100"
              onClick={() => { if (!touchHandled.current) navigate("/all-recipes"); touchHandled.current = false; }}
              onTouchStart={() => { touchHandled.current = true; navigate("/all-recipes"); }}
            >
              <img src={allIcon} alt="all recipes icon" className="h-7 w-7" />
            </button>
            <HoverLabel label="全レシピ一覧" />
          </div>
        </div>
      </div>
    </div>
  );
};
