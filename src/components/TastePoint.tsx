import { useState, useEffect } from "react";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { useRecipeStore } from "../modules/recipes/recipe.state";

interface TastePointProps {
  recipeId: number;
  img?: string;
  Word?: string[];
}

export function TastePoint({ recipeId, img, Word }: TastePointProps) {
  const ratingScale = [1, 2, 3, 4, 5];
  const { currentUser } = useCurrentUserStore();
  const recipeStore = useRecipeStore();
  const [isLoading, setIsLoading] = useState(false);
  //現在の評価値を保持
  const [rating, setRating] = useState<number>(0);
  // 初期ロードでDBの値を取得
  //currentUser（ログインしているユーザー）とrecipeIDが変更になるたび（レシピ詳細画面に遷移するたび）に実行される
  useEffect(() => {
    if (!currentUser) return;
    const fetchRating = async () => {
      try {
        setIsLoading(true);
        const data = await recipeRepository.fetchRating(
          currentUser.id,
          recipeId
        );
        setRating(data.rating || 0);
      } catch {
        setRating(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRating();
  }, [currentUser, recipeId]);

  //第一引数ratingValue:numberは何番目の星かが渡される
  //クリックした星のonClickで実行する
  const handleClick = (ratingValue: number) => {
    if (!currentUser) return;
    //新しい評価値をデータベースとグローバルステートに保存する関数定義
    const updateRating = async (newRating: number) => {
      try {
        const updatedRecipe = await recipeRepository.updateRating(
          currentUser.id,
          recipeId,
          newRating
        );
        recipeStore.updateRating(updatedRecipe);
      } catch {
        setRating(0);
      }
    };
    setRating(ratingValue);
    updateRating(ratingValue);
  };

  return (
    <div className="flex items-center gap-3 lg:gap-6 mt-4 mb-4">
      {ratingScale.map((ratingValue) => {
        // rating:現在の評価値 , ratingValue:順番に1～5が入って判定される
        const isActive = rating >= ratingValue;

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
            {/* にこちゃんの表示 */}
            <img
              src={img}
              alt="taste icon"
              className={`w-7 h-7 lg:w-10 lg:h-10 ${
                isActive ? "" : "opacity-20"
              }`}
            />
            {/* Word?.[index] 配列の中のindex番目の要素を表示 （配列にオプショナルチュイニングを設定している）*/}
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
