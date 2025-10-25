import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useNavigate } from "react-router-dom";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { toast } from "react-toastify";
import { Utensils } from "lucide-react";

export const AllRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const { currentUser } = useCurrentUserStore();
  //   const imgTaste = tasteIcon;
  const navigate = useNavigate();
  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

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
    <div>
      <h1>All Recipes</h1>
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="flex gap-3 lg:gap-6 justify-center items-center mb-5 lg:mb-8 cursor-pointer"
          onClick={() => moveToDetail(recipe.id)}
        >
          <Utensils
            className="w-5 h-5 lg:w-7 lg:h-7 fill-gray-200 text-gray-400"
            strokeWidth={1.0}
          />
          <h3 className="font-['Inter'] text-lg lg:text-2xl text-gray-700">
            {recipe.title}
          </h3>
        </div>
      ))}
    </div>
  );
};
