import { useState, useEffect } from "react";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { toast } from "react-toastify";

interface TimeProps {
  recipeId: number;
  img?: string;
  Word?: string[];
}

export function WatchPoint({ recipeId, img, Word }: TimeProps) {
  const ratingScale = [1, 2, 3, 4, 5];
  const { currentUser } = useCurrentUserStore();
  const recipeStore = useRecipeStore();
  const [isLoading, setIsLoading] = useState(false);
  //現在の評価値を保持
  const [time, setTime] = useState<number>(0);
  //現在の評価値を保持
  // 初期ロードでDBの値を取得
  //recipeIDが変更になるたび（レシピ詳細画面に遷移するたび）に実行される
  useEffect(() => {
    if (!currentUser) return;
    const fetchTime = async () => {
      try {
        setIsLoading(true);
        const data = await recipeRepository.fetchTime(currentUser.id, recipeId);
        setTime(data.time || 0);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "不明なエラーが発生しました"
        );
        setTime(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTime();
  }, [currentUser, recipeId]);

  //第一引数ratingValue:numberは何番目の星かが渡される
  //クリックした星のonClickで実行する
  const handleClick = (ratingValue: number) => {
    if (!currentUser) return;
    //新しい評価値をデータベースとグローバルステートに保存する関数定義
    const updateTime = async (newTime: number) => {
      try {
        const updatedRecipe = await recipeRepository.updateTime(
          currentUser.id,
          recipeId,
          newTime
        );
        recipeStore.set([updatedRecipe]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "不明なエラーが発生しました"
        );
        setTime(0);
      }
    };

    setTime(ratingValue);

    updateTime(ratingValue);
  };

  //whitespace-nowrap: テキストを折り返さない
  return (
    <div className="flex items-center gap-3 lg:gap-6 mt-4 mb-4">
      {ratingScale.map((ratingValue) => {
        const isActive = time >= ratingValue;

        return isLoading ? (
          <div
            key={ratingValue}
            className="flex flex-col items-center justify-center w-11.5 h-11.5 lg:w-13 lg:h-13"
          >
            <div className="animate-spin rounded-full w-7 h-7 lg:w-10 lg:h-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div
            key={ratingValue}
            className="flex flex-col items-center justify-center relative cursor-pointer w-11.5 h-11.5 lg:w-13 lg:h-13"
            onClick={() => handleClick(ratingValue)}
          >
            {/* 星の表示 */}
            <img
              src={img}
              alt="watch icon"
              className={`w-7 h-7 lg:w-10 lg:h-10 ${
                isActive ? "" : "opacity-20"
              }`}
            />
            <div className="w-full text-center">
              <span
                className={`text-xs lg:text-xs text-gray-600 font-medium whitespace-nowrap ${
                  isActive ? "" : "opacity-20"
                }`}
              >
                {Word?.[ratingValue - 1] ?? ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
