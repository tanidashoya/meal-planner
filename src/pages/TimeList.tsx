import { useParams } from "react-router-dom";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { RatingItem } from "../components/TasteSort/RatingItem";
import watchIcon from "../assets/watch_icon.png";

export const TimeList = () => {

    //URLからtimeの値（文字列）を取得
    const {time} = useParams();
    const recipesStore = useRecipeStore();
    const recipes = recipesStore.getAll();

    //timeの値（文字列）を数値に変換して、timeがその数値と等しいレシピを取得
    const timeRecipes = recipes.filter(recipe => recipe.time === Number(time));
    const nullTimeRecipe = recipes.filter(recipe => recipe.time === null || recipe.time === undefined);

    //&&：かつという意味
    return (
        <div className="font-['Inter'] flex flex-col items-center h-full pt-25 lg:pt-35">
            <div className="flex items-center justify-center gap-0.8 mb-12 lg:mb-16 border-b-1 border-gray-300 pb-4">
                {Number(time) && time !== "null" && time !== "undefined" ? Array.from({ length: Number(time) }, (_, i) => (
                    <img
                    key={i}
                    src={watchIcon}
                    alt="watch icon"
                    className="lg:w-12 lg:h-12 w-8 h-8"
                    />
                )) : (
                    <span className="text-gray-500 text-xl lg:text-4xl">未設定</span>
                )}
                <div className="ml-2">
                    <span className="text-gray-500 text-xl lg:text-4xl">の調理時間</span>
                </div>
            </div>
            {Number(time) && time !== "null" && time !== "undefined" ? <RatingItem recipes={timeRecipes} /> : <RatingItem recipes={nullTimeRecipe} />}
        </div>
    )
}
