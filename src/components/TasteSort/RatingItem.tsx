import { Recipe } from "../../modules/recipes/recipe.entity";
import { Trash2, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RatingItemProps {
  recipes: Recipe[];
  deleteRecipe: (id: number) => Promise<void>;
}

export const RatingItem = ({ recipes, deleteRecipe }: RatingItemProps) => {
  const navigate = useNavigate();

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="flex flex-col gap-4 px-1">
      {recipes.length === 0 && (
        <div className="font-['Inter'] text-center text-gray-400 text-base lg:text-2xl mb-5 lg:mb-8">
          レシピがありません
        </div>
      )}
      {recipes.map((recipe, index) => {
        return (
          <div
            key={index}
            className="flex gap-3 lg:gap-6 justify-center items-center cursor-pointer"
          >
            <Utensils
              className="w-5 h-5 lg:w-7 lg:h-7 fill-gray-200 text-gray-400"
              strokeWidth={1.0}
            />
            <div className="flex-1" onClick={() => moveToDetail(recipe.id)}>
              <h3 className="font-['Inter'] text-base lg:text-2xl text-gray-700 truncate">
                {recipe.title}
              </h3>
            </div>
            <Trash2
              className="w-5 h-5 text-gray-500"
              onClick={() => deleteRecipe(recipe.id)}
            />
          </div>
        );
      })}
    </div>
  );
};
