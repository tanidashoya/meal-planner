import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { toast } from "react-toastify";
import { RatingItem } from "../components/TasteSort/RatingItem";

export const AllRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const { currentUser } = useCurrentUserStore();
  //   const imgTaste = tasteIcon;
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

  return (
    <div className="font-['Inter'] flex flex-col items-center h-full pt-25 lg:pt-35">
      <h2 className="font-['Inter'] text-xl font-bold text-gray-600">
        すべてのレシピ
      </h2>
      <RatingItem recipes={recipes} deleteRecipe={deleteRecipe} />
    </div>
  );
};
