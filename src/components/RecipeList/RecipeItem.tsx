//サイドバーに表示するレシピ本体
//タイトルを表示しており、クリックするとレシピの詳細画面に遷移する

import { Recipe } from '../../modules/recipes/recipe.entity';
import {useNavigate} from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface RecippeItemProps {
    recipe: Recipe;
    ondeleteRecipe: (id: number) => Promise<void>;
    setOpen: (open: boolean) => void;
}

export const RecipeItem = ({recipe,ondeleteRecipe,setOpen}:RecippeItemProps) => {

    const navigate = useNavigate();
    const moveToDetail = () => {
        setOpen(false)
        navigate(`/recipes/${recipe.id}`)
    }

    return(
        <div className="flex items-center cursor-pointer hover:bg-gray-200 pl-8 py-1.5 text-lg text-gray-700">
            {/* truncate:文字が長すぎる場合に省略する。（その場合は…と表示される） */}
            <span className="truncate flex-1" onClick={moveToDetail}>{recipe.title}</span>
            <Trash2 className="w-5 h-5 text-gray-500 ml-auto mr-2" onClick={() => ondeleteRecipe(recipe.id)}/>
        </div>
    )
}
