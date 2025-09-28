import { Recipe } from "../../modules/recipes/recipe.entity";
import { RatingItem } from "./RatingItem";
import { Star } from "lucide-react";


// recipeByStarRating: {1:[{rating:1,・・・},{rating:0.5,・・・}],2:[{rating:2,・・・},{rating:1.5,・・・}]}
interface RatingGroupProps {
    //Record<KeyType, ValueType>⇒KeyTypeとValueTypeを指定するs
    recipesByStarRating: Record<number,Recipe[]>;
    unsetRecipesObject: Record<string,Recipe[]>;
}

export const RatingGroup = ({recipesByStarRating,unsetRecipesObject}:RatingGroupProps) => {

    // {/* Object.entries は オブジェクトを [key, value] の配列に変換する関数。 */}
    // {/* つまり、[[rating, [recipe, recipe, ...]], [rating, [recipe, recipe, ...]], ...] の配列を作成する。 */}
    // Object.entries:キー部分をつねにstring型で返すので、Number()で数値型に変換する
    const sortedRecipesByStarRating = Object.entries(recipesByStarRating).sort((a,b) => Number(b[0]) - Number(a[0]));


    return (
        <div>
            <div>
                {/* その配列をmapで回し、それぞれのratingとrecipeをRatingItemコンポーネントに渡す。 */}
                {/* mapの引数では配列を分割代入している。[rating, recipe] の配列のそれぞれの要素を rating と recipe に代入している。 */}
                {sortedRecipesByStarRating.map(([rating,recipes])=> {
                    return (
                        <div key={rating} 
                        className="w-full lg:w-4/5 mb-6 mx-auto border-1 border-gray-300 rounded-md p-5 lg:p-8 shadow-sm lg:mb-12"
                        >
                            <div className="flex items-center justify-center gap-2 mb-8 lg:mb-12">
                                {Array.from({ length: Number(rating) }, (_, i) => (
                                    <Star
                                    key={i}
                                    className="lg:w-8 lg:h-8 w-7 h-7 fill-yellow-200 text-gray-400"
                                    strokeWidth={1.0}
                                    />
                                ))}
                            </div>
                            <RatingItem 
                                recipes={recipes}
                            />
                        </div>
                    )
                })}
            </div>
            <div className="w-full lg:w-4/5 mb-6 mx-auto border-1 border-gray-300 rounded-md p-5 lg:p-8 shadow-sm lg:mb-8">
                <div className="flex items-center justify-center gap-2 mb-8 lg:mb-12">
                    <h2 className="font-['Inter'] text-lg lg:text-2xl text-gray-700 underline">未設定</h2>
                </div>
                {/* Object.valuesの結果は必ず配列となり[[recipe, recipe, ...]]となるので、flat()で平坦化する */}
                <RatingItem 
                    recipes={Object.values(unsetRecipesObject).flat()}
                />
            </div>
        </div>
    )
}