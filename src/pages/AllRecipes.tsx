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
    <div className="font-['Inter'] flex flex-col items-center min-h-screen mt-18 mb-48">
      <h2 className="font-['Inter'] text-xl font-bold text-gray-600 mb-12">
        Myレシピ一覧（全{recipes.length}件）
      </h2>
      <RatingItem
        recipes={recipes}
        deleteRecipe={deleteRecipe}
        className="border-1 border-gray-300 rounded-md py-7 px-9 gap-6 lg:p-10"
      />
    </div>
  );
};
