import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { toast } from "react-toastify";
import meatIcon from "../assets/meat.webp";
import fishIcon from "../assets/fish.webp";
import donIcon from "../assets/don.webp";
import menIcon from "../assets/men.webp";
import kozareIcon from "../assets/kozara.webp";
import otherIcon from "../assets/other.webp";
import { RecipeIcon } from "../components/RecipeIcon";

export const UnratedRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const { currentUser } = useCurrentUserStore();
  const navigate = useNavigate();
  const unratedRecipes = recipes.filter(
    (recipe) => recipe.rating === null || recipe.time === null
  );
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

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="w-full lg:w-4/5 mx-auto rounded-md px-8 py-5 lg:p-8 mt-12 lg:mb-8">
      <div className="flex items-center justify-center gap-2 mb-12 lg:mb-12">
        <h2 className="font-['Inter'] text-xl font-bold text-gray-600">
          未評価項目があるレシピ
        </h2>
      </div>
      {unratedRecipes.map((recipe) => (
        <div
          key={recipe.id}
          className="flex gap-3 lg:gap-6 justify-center items-center mb-5 lg:mb-8"
        >
          <div className="flex-shrink-0">
            <RecipeIcon category={recipe.category || "その他"} />
          </div>
          <h3
            className="font-['Inter'] text-base lg:text-2xl text-gray-700 truncate cursor-pointer flex-1"
            onClick={() => moveToDetail(recipe.id)}
          >
            {recipe.title}
          </h3>
          <Trash2
            className="w-5 h-5 text-gray-500 ml-auto mr-2 cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              deleteRecipe(recipe.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};
