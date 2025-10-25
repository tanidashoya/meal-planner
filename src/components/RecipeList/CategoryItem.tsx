//RecipeListの子コンポーネントとして、カテゴリーのリストを実装する
//追加機能をpropsで受け取る

// CategoryItem.tsx
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecipeItem } from "./RecipeItem";
import { Recipe } from "../../modules/recipes/recipe.entity";
import meatIcon from "../../assets/meat.webp";
import fishIcon from "../../assets/fish.webp";
import donIcon from "../../assets/don.webp";
import menIcon from "../../assets/men.webp";
import kozareIcon from "../../assets/kozara.webp";
import otherIcon from "../../assets/other.webp";

interface CategoryItemProps {
  category: string;
  recipes: Recipe[];
  //Promise<void> は「非同期処理はあるけど 結果として特に返す値はない」ことを意味
  onDeleteRecipe: (id: number) => Promise<void>;
  setOpen: (open: boolean) => void;
}

export const CategoryItem = ({
  category,
  recipes,
  onDeleteRecipe,
  setOpen,
}: CategoryItemProps) => {
  //isOpenはカテゴリーが開いているかどうかを管理する
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Collapsible>
      <CollapsibleTrigger
        onClick={handleOpen}
        className="pl-2 py-1.5 px-1 outline-none w-full"
      >
        <div role="button" className="flex gap-1 items-center">
          {isOpen ? <ChevronDown /> : <ChevronRight />}
          {category === "肉料理" && (
            <img
              src={meatIcon}
              alt="meat icon"
              className="w-7 h-7 lg:w-7 lg:h-7"
            />
          )}
          {category === "魚料理" && (
            <img
              src={fishIcon}
              alt="fish icon"
              className="w-7 h-7 lg:w-7 lg:h-7"
            />
          )}
          {category === "丼・ルー料理" && (
            <img
              src={donIcon}
              alt="dish icon"
              className="w-7 h-7 lg:w-7 lg:h-7"
            />
          )}
          {category === "麺料理" && (
            <img
              src={menIcon}
              alt="noodle icon"
              className="w-7 h-7 lg:w-7 lg:h-7"
            />
          )}
          {category === "小物" && (
            <img
              src={kozareIcon}
              alt="kozare icon"
              className="w-7 h-7 lg:w-7 lg:h-7"
            />
          )}
          {category === "その他" && (
            <img
              src={otherIcon}
              alt="other icon"
              className="w-7 h-7 lg:w-7 lg:h-7"
            />
          )}
          <span className="font-bold text-gray-600 text-lg">{category}</span>
          <span className="ml-3 font-normal">{recipes.length} 件</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div>
          {recipes.map((recipe, index) => {
            return (
              <RecipeItem
                key={index}
                recipe={recipe}
                ondeleteRecipe={onDeleteRecipe}
                setOpen={setOpen}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
