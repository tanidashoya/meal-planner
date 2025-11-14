import { useRecipeStore } from "../modules/recipes/recipe.state";
import { Recipe } from "../modules/recipes/recipe.entity";
import { useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOgp } from "../components/ImageOgp";
import { useSuggestRecipesStore } from "../modules/suggestRecipes/suggest-recipes.state";

export const SuggestRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const { suggestRecipes, setSuggestRecipes } = useSuggestRecipesStore();

  const navigate = useNavigate();

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  //Recorrd:Record<Keys, Type> は TypeScript が提供しているユーティリティ型で、
  //指定したキー集合（Keys）をすべて同じ型（Type）の値にマッピングしたオブジェクト型を表す
  //Object.entries:オブジェクトを[キー, 値]のペアの配列に変換するメソッド⇒[["肉料理",[{id:1,title:肉料理1,・・・},{id:2,title:肉料理2,・・・}]],["魚料理",[{id:3,title:魚料理1,・・・},{id:4,title:魚料理2,・・・}]],・・・]
  //acc：カテゴリ別のレシピをためていくオブジェクト（累積オブジェクト）⇒ {{肉料理:[{id:1,title:肉料理1,・・・},{id:2,title:肉料理2,・・・}]},{魚料理:[{id:3,title:魚料理1,・・・},{id:4,title:魚料理2,・・・}]},・・・}
  //reduce:配列を1つの値にまとめるためのメソッド(繰り返し処理)
  //reduce第二引数が初期値
  //next:これまで同じカテゴリで集めてきたレシピの配列
  //...next:これまで同じカテゴリで集めてきたレシピの配列を展開
  //return acc：累積オブジェクトを返さないと次のループに引き継がれないため必須
  const groupedRecipes = useMemo(
    () =>
      recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
        const category = recipe.category ?? "未分類";
        const next = acc[category] ?? [];
        acc[category] = [...next, recipe];
        return acc;
      }, {}),
    [recipes]
  );

  //渡されたリストから2つ選ぶ
  const pickTwoRadom = (Recipes: Recipe[]): Recipe[] => {
    const RecipesArray = [...Recipes];
    //配列の最後の要素から順にランダムに選ぶ
    //Math.floorは小数点切り捨て
    //Math.Rondomは0以上1未満のランダムな小数を返す
    //jは0からiまでのランダムな整数を返す
    for (let i = RecipesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      [RecipesArray[i], RecipesArray[j]] = [RecipesArray[j], RecipesArray[i]];
    }
    //配列の最初の2つを返す
    return RecipesArray.slice(0, 2);
  };

  const handlePicksCategoryRecipes = () => {
    setSuggestRecipes([]);
    const groupedRecipesObject = Object.entries(groupedRecipes);
    for (const [category, Recipes] of groupedRecipesObject) {
      //カテゴリ別に2つのレシピをランダムに選ぶ
      const pickedRecipes = pickTwoRadom(Recipes);
      //pickedRecipesListにカテゴリと選ばれたレシピを追加していく（関数型アップデート）
      setSuggestRecipes((prev) => [...prev, [category, pickedRecipes]]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-12 mb-12">
      <div className="flex items-center justify-center gap-8 mb-4">
        <p className="text-xl font-bold text-center tracking-wider">
          Myレシピから提案
        </p>
        <button
          onClick={handlePicksCategoryRecipes}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          レシピ出力
        </button>
      </div>
      {suggestRecipes.map(([category, pickedRecipes]) => (
        <div
          key={category}
          className="flex flex-col items-center justify-center gap-2 w-full px-4 mt-8"
        >
          <p className="text-2xl text-gray-500 font-bold text-left mb-1">
            {category}
          </p>
          {pickedRecipes.map((pickedRecipe) => (
            <div
              key={pickedRecipe.id}
              onClick={() => moveToDetail(pickedRecipe.id ?? 0)}
              className="flex items-center justify-space-between gap-4 w-full px-4 border-[2px] shadow-md border-gray-300 rounded-md py-2"
            >
              <ImageOgp
                url={pickedRecipe.source || ""}
                className="w-36 h-24 flex-shrink-0 border-[1px] border-gray-300 rounded-md"
              />
              <div className="flex flex-col items-start justify-center gap-2">
                <span className="text-base border-b-[2px] border-gray-300">
                  {pickedRecipe.category}
                </span>
                <span className="text-sm font-bold">{pickedRecipe.title}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
