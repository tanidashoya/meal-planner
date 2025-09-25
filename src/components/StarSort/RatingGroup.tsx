import { Recipe } from "../../modules/recipes/recipe.entity";
import { RatingItem } from "./RatingItem";
import { Star } from "lucide-react";


// recipeByStarRating: {1:[{rating:1,・・・},{rating:0.5,・・・}],2:[{rating:2,・・・},{rating:1.5,・・・}]}
interface RatingGroupProps {
    //Record<KeyType, ValueType>⇒KeyTypeとValueTypeを指定するs
    recipesByStarRating: Record<number,Recipe[]>;
}

export const RatingGroup = ({recipesByStarRating}:RatingGroupProps) => {

    // {/* Object.entries は オブジェクトを [key, value] の配列に変換する関数。 */}
    // {/* つまり、[[rating, [recipe, recipe, ...]], [rating, [recipe, recipe, ...]], ...] の配列を作成する。 */}
    // Object.entries:キー部分をつねにstring型で返すので、Number()で数値型に変換する
    const sortedRecipesByStarRating = Object.entries(recipesByStarRating).sort((a,b) => Number(b[0]) - Number(a[0]));


    return (
        <div>

            {/* その配列をmapで回し、それぞれのratingとrecipeをRatingItemコンポーネントに渡す。 */}
            {/* mapの引数では配列を分割代入している。[rating, recipe] の配列のそれぞれの要素を rating と recipe に代入している。 */}
            {sortedRecipesByStarRating.map(([rating,recipes])=> {
                return (
                    <div key={rating} className="w-4/5 mb-4 mx-auto border-1 border-gray-300 rounded-md px-8 py-8 shadow-sm mb-8">
                        <div className="flex items-center justify-center gap-2 mb-12">
                            {Array.from({ length: Number(rating) }, (_, i) => (
                                <Star
                                key={i}
                                className="w-8 h-8 fill-yellow-200 text-gray-400"
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
    )
}