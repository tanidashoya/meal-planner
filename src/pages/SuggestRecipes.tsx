import { useRecipeStore } from "../modules/recipes/recipe.state";
import { Recipe } from "../modules/recipes/recipe.entity";
import { useNavigate } from "react-router-dom";
import { ImageOgp } from "../components/ImageOgp";
import { useSuggestRecipesStore } from "../modules/suggestRecipes/suggest-recipes.state";
import { DeleteButton } from "../components/DeleteButton";

export const SuggestRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const navigate = useNavigate();

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };
  const { suggestRecipes, setSuggestRecipes } = useSuggestRecipesStore();

  //渡されたリストから2つ選ぶ
  const pickRandomRecipes = (Recipes: Recipe[]) => {
    const RecipesArray = [...Recipes];
    //配列の最後の要素から順にランダムに選ぶ
    //Math.floorは小数点切り捨て
    //jは0からiまでのランダムな整数を返す
    for (let i = RecipesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      [RecipesArray[i], RecipesArray[j]] = [RecipesArray[j], RecipesArray[i]];
    }
    //配列の最初の6つを返す
    setSuggestRecipes(RecipesArray.slice(0, 4));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-15 mb-12">
      <div className="flex flex-col items-center justify-center gap-8 mb-8">
        <p className="text-xl font-bold text-center tracking-wider">
          Myレシピから提案
        </p>
        <button
          onClick={() => {
            pickRandomRecipes(recipes);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          ランダムレシピ出力
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {suggestRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="relative flex flex-col items-center justify-center gap-2 border-[1px] shadow-sm border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50"
            onClick={() => moveToDetail(recipe.id)}
          >
            <ImageOgp
              url={recipe.source || ""}
              className="w-32 h-22 flex-shrink-0"
            />
            <h3 className="text-sm text-gray-600 font-bold truncate w-full">
              {recipe.title}
            </h3>
            <DeleteButton
              id={recipe.id}
              className="absolute top-2 right-2 bg-gray-400 text-white p-1 rounded-md opacity-70"
              size="w-4 h-4 text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
