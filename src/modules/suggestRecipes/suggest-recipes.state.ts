import { atom, useAtom } from "jotai";
import { Recipe } from "../recipes/recipe.entity";

export const suggestRecipesAtom = atom<[string, Recipe[]][]>([]);

export const useSuggestRecipesStore = () => {
  const [suggestRecipes, setSuggestRecipes] = useAtom(suggestRecipesAtom);
  return {
    suggestRecipes,
    setSuggestRecipes,
  };
};
