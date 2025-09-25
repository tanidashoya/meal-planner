//サイドバーに表示するレシピのリストに関して機能の実装
// （子コンポーネントとしてCategoryItem.tsxとRecipeItem.tsxを作成）

import { useCurrentUserStore } from '../../modules/auth/current-user.state';
import { useRecipeStore } from '../../modules/recipes/recipe.state';
import { Recipe } from '../../modules/recipes/recipe.entity';
import { useMemo } from 'react';
import { CategoryItem } from './CategoryItem';


interface RecipeListProps {
    setOpen: (open: boolean) => void;
}

export const RecipeList = ({setOpen}:RecipeListProps) => {

    const {currentUser} = useCurrentUserStore();
    const recipesStore = useRecipeStore();
    const categories = ["肉料理","魚料理","丼・ルー料理","麵料理","小物","その他"];
    const recipes = recipesStore.getAll();
    
    //params:{title?:string,category?:string,source?:string}
    // const createRecipe = async(param:RecipeParams) => {
    //     const data = await recipeRepository.create(currentUser!.id,param);
    //     if (data == null) {
    //         return;
    //     }
    //     recipesStore.set([data]);
    // }

    //idにはrecipesをmapで回したときのrecipe.idを渡す
    const deleteRecipe = async(id:number) => {
        await recipesStore.delete(currentUser!.id,id);
    }


    // カテゴリ別にレシピをグループ化（メモ化でパフォーマンス向上）
    //reduce は 配列を1つの値にまとめるためのメソッド(繰り返し処理)
    //acc はカテゴリ別のレシピをためていくオブジェクト
    //category は ["肉料理","魚料理",...] の要素
    //⇒categoryはcategoreis配列の中身の要素が順に入る
    //useMemo()：再レンダリング時に第二引数の依存配列が変わらない限り実行されない（メモ化）⇒重たい処理を減らす
    //useEffectとuseMemo()の最大の違いの一つはuseMemoは値を返すことができる
    const recipesByCategory = useMemo(() => {
        //全レシピ取得
        //オブジェクトaccのcategoryキーを追加
        //⇒recipesの条件に合うデータを追加
        //一つ目のreturn:useMemoの第一引数に渡したcallback（callback: 「他の関数に渡して、その関数の中で呼んでもらう」関数）の戻り値
        //reduceの第二引数では初期値を決める
        return categories.reduce((acc, category) => {
            acc[category] = recipes.filter(recipe => 
            recipe.category === category);
            //reduce のcallbackで、次のループに渡す acc
            return acc;
        }, {} as Record<string, Recipe[]>);
        //依存配列（[recipesStore.getAll()]）に変更（レシピに追加や削除などの変化があれば実行）
    }, [recipes]);


    //keyの役割：リストをレンダリングするときに、どの要素がどれなのかをReactが識別するための目印
    //returnの後に()をつけるのは JavaScriptの自動セミコロン挿入（ASI）問題を回避するため（下部に説明）
    return(
        <div>
            {categories.map(category => {
                return(
                    <CategoryItem
                        key={category}
                        setOpen={setOpen}
                        category={category}
                        recipes={recipesByCategory[category]}
                        // onCreateRecipe={createRecipe}
                        onDeleteRecipe={deleteRecipe}
                    />
                )
            })}
        </div>
    )
}


/*

１：reduce の callback
reduceの第一引数はcallback関数
reduceの第二引数は初期値

第一引数
(acc, category) => {
  acc[category] = recipes.filter(recipe => recipe.category === category)
  return acc
}

第二引数
{} as Record<string, Recipe[]>

※※※※
acc とは？

reduce のコールバックの第1引数に渡される値です。
「accumulator（蓄積するもの）」の略 が慣習的に acc と呼ばれることが多いです。
👉 つまり 名前は慣習であり、必ず acc でなければならないわけではない です。

reduce の第2引数 {} が「初期値」になります。
1回目のループで acc にこの {} が入ります。
その後は毎回 return されたものが次の acc になります。
👉 だから 最初は「空のオブジェクト」、最後には「カテゴリごとに recipes が入ったオブジェクト」になる。

🔹 処理の流れをステップで追う
初期値 {} が acc に入る
1つ目の category が処理される
acc[category] = ... でプロパティ追加
その acc を return
返ってきた acc が次のループの「受け皿」になる
最後まで繰り返して、最終的な acc が reduce の戻り値になる

✅ まとめ
acc という名前は 慣習（accumulator の略）
reduce の第2引数が初期値（ここでは {}）
最初の acc はその初期値から始まり、ループごとに更新されていく


第二引数：{} as Record<string, Recipe[]> の意味

{}
→ 中身が空のオブジェクトを初期値として渡している

Record<string, Recipe[]>
→ 型の定義
キーが string
値が Recipe[]（レシピの配列）

as
→ TypeScript の「型アサーション（型の断定）」
「この空オブジェクトを Record<string, Recipe[]> 型として扱うよ」と宣言している

*/

/*

1. key の役割

Reactにおける key は 「リストをレンダリングするときに、どの要素がどれなのかをReactが識別するための目印」 です。
もし key がないと、Reactはリストの再レンダリング時に「全部描き直す」ことになり、効率が悪くなったり、内部状態が崩れる可能性があります。
key を設定すると、Reactは「この要素は前回のあの要素と同じ」と認識して、差分だけを更新できます。
👉 このコードの場合は、categories 配列の要素（"肉料理" とか "魚料理"）を key にしているので、カテゴリごとに安定したIDをReactが認識できます。

JSXの流れ
categories.map(...) が実行されると、categories の 先頭から1つずつ category に入ります。
1回目 → "肉料理" が category に入り、<CategoryItem key="肉料理" ... /> が生成される
2回目 → "魚料理" が入り、次の <CategoryItem ... /> が生成される
…と順番に繰り返して、最終的に複数の <CategoryItem> コンポーネントが並んだ配列になります。
そして React がその配列を <div> 内に展開してレンダリングする、という流れです。

まとめ
key の役割 → Reactがリスト要素を一意に識別して、効率よく再レンダリングするための目印
レンダリングの流れ → categories の先頭から順に category に値が入り、そのたびに <CategoryItem> が生成されて配列として返される

※※　mapの中で1つずつCategoryItemを生成するが、それをまとめて一気にレンダリングする　※※
*/



/*
return後の()の理由
1. JavaScriptの自動セミコロン挿入（ASI）問題
JavaScriptには「自動セミコロン挿入」という機能があり、returnの後に改行があると自動的にセミコロンが挿入されてしまいます。
問題のあるコード例:

return
    <CategoryItem
        key={category}
        category={category}
        recipes={recipesByCategory[category]}
        onDeleteRecipe={deleteRecipe}
    />

これは実際には以下のように解釈されます：
結果：undefinedが返される

2. ()で囲むことで解決

return(
    <CategoryItem
        key={category}
        category={category}
        recipes={recipesByCategory[category]}
        onDeleteRecipe={deleteRecipe}
    />
)

(がreturnと同じ行にあるため、JavaScriptは「まだ式が続いている」と認識し、自動セミコロン挿入が発生しません。

*/