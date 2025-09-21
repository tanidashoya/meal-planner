//RecipeListの子コンポーネントとして、カテゴリーのリストを実装する
//追加機能をpropsで受け取る

// CategoryItem.tsx
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RecipeItem } from './RecipeItem';
import { Recipe } from '../../modules/recipes/recipe.entity';

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
  setOpen
}: CategoryItemProps) => {
  //isOpenはカテゴリーが開いているかどうかを管理する
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen)
  }  

  return (
    <Collapsible>
        <CollapsibleTrigger onClick={handleOpen} className= "pl-2 py-1.5 px-1 outline-none w-full">
            <div role="button"  className="flex items-center">
                {isOpen ? <ChevronDown/> : <ChevronRight/>}
                <span className="font-normal text-lg">{category}</span>
                <span className="ml-3 font-normal">{recipes.length} 件</span>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div>
                {recipes.map((recipe,index) => {
                    return (
                      <RecipeItem
                        key={index}
                        recipe={recipe}
                        ondeleteRecipe={onDeleteRecipe}
                        setOpen={setOpen}
                    />
                    )
                })}
            </div>
        </CollapsibleContent>
    </Collapsible>

  );
};
