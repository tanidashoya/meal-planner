import { Recipe } from "../../modules/recipes/recipe.entity";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RecipeIcon } from "../RecipeIcon";

interface RatingItemProps {
  recipes: Recipe[];
  deleteRecipe: (id: number) => Promise<void>;
  className?: string;
}

export const RatingItem = ({
  recipes,
  deleteRecipe,
  className,
}: RatingItemProps) => {
  const navigate = useNavigate();

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  //flex-shrink-0: 指定された要素は縮まない
  return (
    <div className={`flex flex-col gap-5 px-8 w-full ${className}`}>
      {recipes.length === 0 && (
        <div className="font-['Inter'] text-center text-gray-400 text-base lg:text-2xl mb-5 lg:mb-8">
          レシピがありません
        </div>
      )}
      {recipes.map((recipe, index) => {
        return (
          <div
            key={index}
            className="flex gap-3 lg:gap-6 justify-center items-center"
          >
            <div className="w-full cursor-pointer flex items-center justify-between">
              <div className="flex-shrink-0">
                <RecipeIcon category={recipe.category || "その他"} />
              </div>
              <div
                className="flex-1 mx-3 min-w-0"
                onClick={() => moveToDetail(recipe.id)}
              >
                <h3 className="font-['Inter'] text-base lg:text-2xl text-gray-700 truncate">
                  {recipe.title}
                </h3>
              </div>
              <Trash2
                className="w-5 h-5 text-gray-500 cursor-pointer flex-shrink-0"
                //stopPropagation: イベントのバブリング(親要素に伝わるイベントを停止する)を停止する
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRecipe(recipe.id);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
