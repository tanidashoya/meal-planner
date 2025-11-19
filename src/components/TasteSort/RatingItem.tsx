import { Recipe } from "../../modules/recipes/recipe.entity";
import { useNavigate } from "react-router-dom";
import { ImageOgp } from "../ImageOgp";
import { DeleteButton } from "../DeleteButton";

interface RatingItemProps {
  recipes: Recipe[];
  deleteRecipe: (id: number) => Promise<void>;
  className?: string;
}

export const RatingItem = ({
  recipes,
  // deleteRecipe,
  className,
}: RatingItemProps) => {
  const navigate = useNavigate();

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  //flex-shrink-0: 指定された要素は縮まない
  return (
    <div className={`flex flex-col gap-4 px-3 w-full ${className}`}>
      {recipes.length === 0 && (
        <div className="font-['Inter'] text-center text-gray-400 text-base lg:text-2xl mb-5 lg:mb-8">
          レシピがありません
        </div>
      )}
      {recipes.map((recipe) => {
        return (
          <div
            key={recipe.id}
            onClick={() => moveToDetail(recipe.id ?? 0)}
            className="relative flex items-center justify-space-between gap-3 w-full px-4 border-[1px] shadow-sm border-gray-300 rounded-md py-2"
          >
            <ImageOgp
              // sourceは空文字の可能性もある。一応空文字で確定的・安全に扱うためにデフォルト値を空文字にしておく
              url={recipe.source || ""}
              className="w-36 h-24 flex-shrink-0 border-[1px] border-gray-300 rounded-md"
            />
            <div className="flex flex-col items-start justify-center gap-2">
              <span className="text-base border-b-[2px] border-gray-300">
                {recipe.category}
              </span>
              <span className="text-sm font-bold">{recipe.title}</span>
            </div>
            <DeleteButton
              id={recipe.id ?? 0}
              className="absolute top-2 right-3 bg-gray-400 text-white p-1 rounded-md opacity-70"
              size="w-4 h-4 text-white"
            />
          </div>
        );
      })}
    </div>
  );
};
