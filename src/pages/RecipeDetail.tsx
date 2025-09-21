//レジピの詳細画面を実装する

import { useParams } from "react-router-dom";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { StarRatingHalfFill } from "../components/StarRatingHalfFill";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { useEffect } from "react";



export const RecipeDetail = ()=> {

    const {id} = useParams();
    const recipeStore = useRecipeStore();
    const currentUserStore = useCurrentUserStore();
    const recipes = recipeStore.getAll();
    //データベースから取得したレシピデータをfilterでidが一致するものを抽出
    const targetRecipes = recipes.filter(recipe => recipe.id == Number(id));

    // レシピが見つからない場合、データベースから直接取得
    //データベースから直接取得することで、グローバルステートの更新が不要になる
    //直接レシピ詳細画面にアクセス（LayOutコンポーネントを経由せず）した場合でもレシピをグローバルステートに取得するため
    //直接アクセスするケース
    //ブラウザのリロード（F5キー）
    // ブックマークからのアクセス
    // URLを直接入力
    // 他のサイトからのリンク
    // ブラウザの戻る/進むボタン
    useEffect(() => {
        const loadRecipe = async () => {
            if (targetRecipes.length === 0 && id && currentUserStore.currentUser) {
                const recipes = await recipeRepository.findAll(currentUserStore.currentUser.id);
                //LayOutを経由した場合は重複するように思えるがsetメソッドで重複を排除している
                recipeStore.set(recipes);
            }
        };
        loadRecipe();
    }, [id, targetRecipes.length, currentUserStore.currentUser]);
    
    //Numberを付けるのはidがstring型のため
    return (
        <div className="flex flex-col items-center justify-center h-screen p-12">
            {targetRecipes.length === 0 ? (
                <div className="text-center">
                    <p className="text-xl text-gray-600">レシピが見つかりません</p>
                    <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
                    <p className="text-sm text-gray-400">総レシピ数: {recipes.length}</p>
                </div>
            ) : (
                targetRecipes.map((recipe, index) => (
                    <div key={index} className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold underline mb-6">{recipe.title}</span>
                        <StarRatingHalfFill recipeId={recipe.id} />
                        <div>
                            <span className="text-lg">参照先：</span>
                            <a 
                                href={recipe.source || ""} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 py-2 text-lg"
                            >
                                {recipe.source}
                            </a>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}


/*
 <div>
    {recipes
        .filter(recipe => recipe.id == Number(id))  // 条件に合うものだけ抽出
        .map((recipe, index) => (  // その後JSXに変換
            <div key={index}>
                <span>{recipe.title}</span>
                <a href={recipe.source || ""}>
                    {recipe.source}
                </a>
            </div>
        ))
    }
</div>

※なぜdivなどの要素を囲んでいるところに()が必要なのか
（）がないとJavaScriptは「どこまでがreturnする値なのか」を判断できない

まとめ
選択範囲の()は：
アロー関数で複数行のJSXを直接返すため
{} + return を省略した簡潔な書き方
JavaScriptに「この範囲全体が返される値」であることを明示するため

{} + return を省略しない書き方の場合
 .map((recipe, index) => {
    return (
        <div key={index}>
            <span>{recipe.title}</span>
            <a href={recipe.source || ""}>
                {recipe.source}
            </a>
        </div>
    )
})

アロー関数で単一の式の場合は{return}を省略できる
JSXは一つの親要素にすべて囲まれているとき単一の式として扱われる
⇒関数コンポーネントでも同じで、だからreturnの後に()が必要

*/
