import { Recipe } from "../../modules/recipes/recipe.entity";
import { RatingItem } from "./RatingItem";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useCurrentUserStore } from "../../modules/auth/current-user.state";
import { useRecipeStore } from "../../modules/recipes/recipe.state";
import { toast } from "react-toastify";
// recipeByStarRating: {1:[{rating:1,・・・},{rating:0.5,・・・}],2:[{rating:2,・・・},{rating:1.5,・・・}]}
interface RatingGroupProps {
  //Record<KeyType, ValueType>⇒KeyTypeとValueTypeを指定するs
  recipesByRating: Record<number, Recipe[]>;
  unsetRecipesObject: Record<string, Recipe[]>;
  img: string;
  type: "star" | "time"; // 星評価か調理時間かを区別
}

export const RatingGroup = ({
  recipesByRating,
  img,
  type,
}: RatingGroupProps) => {
  // {/* Object.entries は オブジェクトを [key, value] の配列に変換する関数。 */}
  // {/* つまり、[[rating, [recipe, recipe, ...]], [rating, [recipe, recipe, ...]], ...] の配列を作成する。 */}
  // Object.entries:キー部分をつねにstring型で返すので、Number()で数値型に変換する
  const sortedRecipesByRating = Object.entries(recipesByRating).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  );
  const recipesStore = useRecipeStore();
  const { currentUser } = useCurrentUserStore();

  const deleteRecipe = async (id: number) => {
    if (!currentUser) return;
    try {
      await recipesStore.delete(currentUser.id, id);
      toast.success("レシピを削除しました");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      );
    }
  };
  return (
    <div>
      <div className="mt-3">
        {/* その配列をmapで回し、それぞれのratingとrecipeをRatingItemコンポーネントに渡す。 */}
        {/* mapの引数では配列を分割代入している。[rating, recipe] の配列のそれぞれの要素を rating と recipe に代入している。 */}
        {sortedRecipesByRating.map(([rating, recipes]) => {
          return (
            <div
              key={rating}
              className="w-full lg:w-4/5 mb-8 mx-auto border-[1px] border-gray-300 rounded-md py-5 lg:p-10 shadow-md lg:mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-10 lg:mb-12 border-b border-gray-300 pb-2 w-3/5 mx-auto">
                {Array.from({ length: Number(rating) }, (_, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="taste icon"
                    className="lg:w-9 lg:h-9 w-7 h-7"
                  />
                ))}
              </div>
              {recipesStore.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <RatingItem
                  recipes={recipes.slice(0, 3)}
                  deleteRecipe={deleteRecipe}
                />
              )}
              {/* 別ページに遷移するだけならLink toが一般的 */}
              {recipes.length > 3 && (
                <div className="flex items-center justify-center gap-2 mt-10 lg:mt-12 mb-4">
                  <Link
                    to={
                      type === "star"
                        ? `/star-list/${rating}`
                        : `/time-list/${rating}`
                    }
                  >
                    <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                      <p className=" font-['Inter'] text-base lg:text-base">
                        {`もっと見る（全${recipes.length}件）`}
                      </p>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* <div className="w-full lg:w-4/5 mx-auto border border-gray-300 rounded-md p-5 lg:p-8 shadow-sm lg:mb-8">
        <div className="flex items-center justify-center gap-2 mb-8 lg:mb-12">
          <h2 className="font-['Inter'] text-lg lg:text-2xl text-gray-500 border-b-2 border-gray-400">
            未設定
          </h2>
        </div>
        Object.valuesの結果は必ず配列となり[[recipe, recipe, ...]]となるので、flat()で平坦化する
        <RatingItem
          recipes={Object.values(unsetRecipesObject).flat().slice(0, 3)}
        />
        {Object.values(unsetRecipesObject).flat().length > 3 && (
          <div className="flex items-center justify-center gap-2 mt-10 lg:mt-12 mb-4">
            <Link to={type === "star" ? "/star-list/null" : "/time-list/null"}>
              <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                <p className=" font-['Inter'] text-sm lg:text-base">
                  もっと見る（全
                  {Object.values(unsetRecipesObject).flat().length}件）
                </p>
              </Button>
            </Link>
          </div>
        )}
      </div> */}
    </div>
  );
};
