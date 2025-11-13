import { useRecipeStore } from "../modules/recipes/recipe.state";
import { Recipe } from "../modules/recipes/recipe.entity";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOgp } from "../components/ImageOgp";

export const WeeklyRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const [pickedRecipe, setPickedRecipe] = useState<Recipe | null>(null);

  const navigate = useNavigate();

  const moveToDetail = (id: number) => {
    if (pickedRecipe) {
      navigate(`/recipes/${id}`);
    }
  };

  //カテゴリの重み付け
  const categoryWeights: Record<string, number> = {
    肉料理: 4,
    魚料理: 3,
    "丼・ルー料理": 2,
    麺料理: 1,
    その他: 1,
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
      Object.entries(
        recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
          const category = recipe.category ?? "未分類";
          const next = acc[category] ?? [];
          acc[category] = [...next, recipe];
          return acc;
        }, {})
      ),
    [recipes]
  );

  //重み付けされたレシピを選ぶ関数
  //第一引数:カテゴリ別のレシピをためていくオブジェクト⇒groupedRecipes
  //第二引数:カテゴリの重み付け⇒categoryWeights
  const pickWeightedRecipe = (
    groups: [string, Recipe[]][],
    weights: Record<string, number>
  ): Recipe | null => {
    //: Recipe | null は戻り値の型を指定している
    // 重みが正で、かつレシピが残っているカテゴリだけを対象にする
    //小物の重みは設定しないのでcandidatesには含まれない
    const candidates = groups
      .map(([category, recipes]) => ({
        category,
        recipes,
        weight: weights[category] ?? 0,
      }))
      .filter(({ weight, recipes }) => weight > 0 && recipes.length > 0); //filterは重みがゼロ以下のカテゴリや、レシピ配列が空のカテゴリを除外するため

    if (candidates.length === 0) return null; //candidatesが空の場合(レシピがない場合)はnullを返す

    //アロー関数の省略記法で、波括弧 {} を書かずに式だけ置くと、その式の値が自動的に返り値になります
    //各カテゴリの重みの合計を算出（初期値は0）
    const totalWeight = candidates.reduce((sum, { weight }) => sum + weight, 0);

    //Math.random()は0以上1未満の乱数を生成
    //thresholdは0以上totalWeight未満の乱数
    let threshold = Math.random() * totalWeight;

    //重みづけに応して、どのカテゴリからレシピを一件選ぶかを決める
    for (const { recipes, weight } of candidates) {
      //Math.floorは小数点以下を切り捨てるメソッド
      //指定されたカテゴリのrecipesの中からランダムに一件選ぶ
      if (threshold < weight) {
        const randomIndex = Math.floor(Math.random() * recipes.length);
        return recipes[randomIndex];
      }
      threshold -= weight;
    }

    return null; // 理論上ここには来ないが保険
  };

  //関数内で定義した変数は、その関数のスコープにだけ有効
  //だからuseStateで保持する必要がある
  const handlePickRecipe = () => {
    //重みづけ通りにランダムにレシピを選ぶ
    const recipe = pickWeightedRecipe(groupedRecipes, categoryWeights);
    if (!recipe) {
      toast.info("抽選可能なレシピがありません");
      return;
    }
    setPickedRecipe(recipe);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-12 mb-12">
      <div className="flex items-center justify-center gap-8 mb-4">
        <p className="text-2xl font-bold text-center tracking-wider">
          一週間レシピ
        </p>
        <button
          onClick={handlePickRecipe}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          レシピ出力
        </button>
      </div>
      {pickedRecipe && (
        <div
          className="flex items-center justify-center gap-2 w-full px-4"
          onClick={() => moveToDetail(pickedRecipe.id)}
        >
          <div className="flex items-center justify-space-between gap-4 border-[1px] border-gray-300 rounded-md p-1 w-full">
            <ImageOgp
              url={pickedRecipe.source || ""}
              className="w-36 h-24 flex-shrink-0 ml-2"
            />
            <div className="flex flex-col items-start justify-center gap-2">
              <span className="text-base font-bold border-b-[2px] border-gray-300">
                {pickedRecipe.category}
              </span>
              <span className="text-sm font-bold">{pickedRecipe.title}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
