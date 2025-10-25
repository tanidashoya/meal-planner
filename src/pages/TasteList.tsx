import { useParams } from "react-router-dom";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { RatingItem } from "../components/TasteSort/RatingItem";
import tasteIcon from "../assets/taste_icon.png";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { toast } from "react-toastify";

export const TasteList = () => {
  //URLからstarの値（文字列）を取得
  const { star } = useParams();
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();

  //starの値（文字列）を数値に変換して、ratingがその数値と等しいレシピを取得
  const starRecipes = recipes.filter(
    (recipe) =>
      recipe.rating === Number(star) || recipe.rating === Number(star) - 0.5
  );
  const { currentUser } = useCurrentUserStore();
  const deleteRecipe = async (id: number) => {
    if (!currentUser) return;
    try {
      await recipesStore.delete(currentUser.id, id);
      toast.success("レシピを削除しました");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      );
    }
  };
  //&&：かつという意味
  return (
    <div className="font-['Inter'] flex flex-col items-center h-full pt-25 lg:pt-35">
      <div className="flex items-center justify-center gap-0.8 mb-12 lg:mb-16 border-b-1 border-gray-300 pb-4 gap-2">
        {Array.from({ length: Number(star) }, (_, i) => (
          <img
            key={i}
            src={tasteIcon}
            alt="taste icon"
            className="lg:w-12 lg:h-12 w-8 h-8"
          />
        ))}
        <span className="text-gray-500 text-xl lg:text-4xl">のレシピ</span>
      </div>
      <RatingItem recipes={starRecipes} deleteRecipe={deleteRecipe} />
    </div>
  );
};
