import { atom, useAtom } from "jotai";
import { Recipe } from "../recipes/recipe.entity";

//復習：atom は「グローバル状態の箱」（型定義はここでする）
// useAtom は「その箱の gettet/setter フック」（グローバルの箱に役割を与えるフック）
export const suggestRecipesAtom = atom<[string, Recipe[]][]>([]);

export const useSuggestRecipesStore = () => {
  const [suggestRecipes, setSuggestRecipes] = useAtom(suggestRecipesAtom);
  return {
    suggestRecipes,
    setSuggestRecipes,
  };
};
