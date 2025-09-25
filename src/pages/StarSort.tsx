import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useMemo } from "react";
import { Recipe } from "../modules/recipes/recipe.entity";
import { Card, CardHeader, CardTitle, CardContent} from "../components/ui/card";
import { RatingGroup } from "../components/StarSort/RatingGroup";



export const StarSort = () => {


    const starRating = [1,2,3,4,5];
    const recipesStore = useRecipeStore();
    const recipes = recipesStore.getAll();
    

    //5 のグループ → rating が 5 または 4.5
    // 4 のグループ → rating が 4 または 3.5
    // 3 のグループ → rating が 3 または 2.5
    // ・・・というようなオブジェクトを作成
    const recipesByStarRating = useMemo(() => {
        return starRating.reduce((acc,rating) => {
            acc[rating] = recipes.filter(recipe => recipe.rating === rating || recipe.rating === rating - 0.5)
            return acc;
        },{} as Record<number,Recipe[]>)
    },[recipes,starRating])


    return (
        <Card className="border-0 shadow-none m-auto w-19/20 h-full lg:w-3/5 lg:py-15">
            <CardHeader>
                <CardTitle className="text-2xl md:text-5xl font-medium tracking-wide text-center text-gray-800 mb-6">
                    星別レシピ一覧
                </CardTitle>
            </CardHeader>
            <CardContent>
                <RatingGroup recipesByStarRating={recipesByStarRating} />
            </CardContent>

        </Card>
    )
}
