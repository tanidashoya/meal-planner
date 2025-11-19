import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useNavigate } from "react-router-dom";
// import { MoreVertical, Trash2 } from "lucide-react";
// import { useCurrentUserStore } from "../modules/auth/current-user.state";
// import { toast } from "react-toastify";
import { ImageOgp } from "../components/ImageOgp";
import { DeleteButton } from "../components/DeleteButton";

export const UnratedRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  // const { currentUser } = useCurrentUserStore();
  const navigate = useNavigate();
  const unratedRecipes = recipes.filter(
    (recipe) => recipe.rating === null || recipe.time === null
  );
  // const deleteRecipe = async (id: number) => {
  //   if (!currentUser) return;
  //   try {
  //     await recipesStore.delete(currentUser.id, id);
  //     toast.success("レシピを削除しました");
  //   } catch (error) {
  //     toast.error(
  //       error instanceof Error ? error.message : "不明なエラーが発生しました"
  //     );
  //   }
  // };

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="w-full lg:w-4/5 mx-auto rounded-md px-5 py-5 lg:p-8 mt-12 lg:mb-8">
      <div className="flex items-center justify-center gap-2 mb-12 lg:mb-12">
        <h2 className="font-['Inter'] text-xl font-bold text-gray-600">
          未評価項目があるレシピ
        </h2>
        <span className="text-xl text-gray-600 font-bold">
          ({unratedRecipes.length}件)
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {unratedRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="relative flex flex-col items-center justify-center gap-2 border-[1px] mb-1 shadow-sm border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50"
            onClick={() => moveToDetail(recipe.id)}
          >
            <ImageOgp
              url={recipe.source || ""}
              className="w-36 h-24 flex-shrink-0"
            />
            <h3 className="text-sm text-gray-600 font-bold truncate w-full">
              {recipe.title}
            </h3>
            <DeleteButton
              id={recipe.id}
              className="absolute top-1 right-2 bg-gray-400 text-white p-1 rounded-md opacity-70"
              size="w-4 h-4 text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
