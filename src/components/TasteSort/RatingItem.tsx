import { Recipe } from "../../modules/recipes/recipe.entity";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import meatIcon from "../../assets/meat.webp";
import fishIcon from "../../assets/fish.webp";
import donIcon from "../../assets/don.webp";
import menIcon from "../../assets/men.webp";
import kozareIcon from "../../assets/kozara.webp";
import otherIcon from "../../assets/other.webp";

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

  return (
    <div className={`flex flex-col gap-4 px-1 ${className}`}>
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
            {/* <Utensils
              className="w-5 h-5 lg:w-7 lg:h-7 fill-gray-200 text-gray-400"
              strokeWidth={1.0}
            /> */}
            {recipe.category === "肉料理" && (
              <img
                src={meatIcon}
                alt="meat icon"
                className="w-7 h-7 lg:w-7 lg:h-7"
              />
            )}
            {recipe.category === "魚料理" && (
              <img
                src={fishIcon}
                alt="fish icon"
                className="w-7 h-7 lg:w-7 lg:h-7"
              />
            )}
            {recipe.category === "丼・ルー料理" && (
              <img
                src={donIcon}
                alt="dish icon"
                className="w-7 h-7 lg:w-7 lg:h-7"
              />
            )}
            {recipe.category === "麺料理" && (
              <img
                src={menIcon}
                alt="noodle icon"
                className="w-7 h-7 lg:w-7 lg:h-7"
              />
            )}
            {recipe.category === "小物" && (
              <img
                src={kozareIcon}
                alt="kozare icon"
                className="w-7 h-7 lg:w-7 lg:h-7"
              />
            )}
            {recipe.category === "その他" && (
              <img
                src={otherIcon}
                alt="other icon"
                className="w-7 h-7 lg:w-7 lg:h-7"
              />
            )}
            <div
              className="flex-1 cursor-pointer"
              onClick={() => moveToDetail(recipe.id)}
            >
              <h3 className="font-['Inter'] text-base lg:text-2xl text-gray-700 truncate">
                {recipe.title}
              </h3>
            </div>
            <Trash2
              className="w-5 h-5 text-gray-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                deleteRecipe(recipe.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
