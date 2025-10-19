import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useMemo } from "react";
import { Recipe } from "../modules/recipes/recipe.entity";
import { Card, CardHeader, CardTitle, CardContent} from "../components/ui/card";
import { RatingGroup } from "../components/TasteSort/RatingGroup";
import tasteIcon from "../assets/taste_icon.png";



export const TasteSort = () => {


    const starRating = [1,2,3,4,5];
    const recipesStore = useRecipeStore();
    const recipes = recipesStore.getAll();
    const imgTaste = tasteIcon;

    //5 のグループ → rating が 5 または 4.5
    // 4 のグループ → rating が 4 または 3.5
    // 3 のグループ → rating が 3 または 2.5
    // ・・・というようなオブジェクトを作成
    const recipesByStarRating = useMemo(() => {
        return starRating.reduce((acc,rating) => {
            acc[rating] = recipes.filter(recipe => recipe.rating === rating)
            return acc;
        },{} as Record<number,Recipe[]>)
    },[recipes,starRating])

    const unsetRecipes = recipes.filter(recipe => recipe.rating === null);
    const unsetRecipesObject = {["未設定"]:unsetRecipes};

    console.log(unsetRecipesObject);
    return (
        <Card className="border-0 shadow-none m-auto lg:w-3/5 w-19/20 h-full pb-8 mt-12 gap-3">
            <CardHeader>
                <CardTitle 
                className="font-['Inter'] text-xl md:text-4xl font-medium tracking-wide text-center text-gray-600 lg:mb-12 font-bold"
                >
                    おいしさでレシピを探す
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pb-20">
                <RatingGroup 
                recipesByRating={recipesByStarRating} 
                unsetRecipesObject={unsetRecipesObject} 
                img={imgTaste}
                type="star"
                />
            </CardContent>

        </Card>
    )
}
