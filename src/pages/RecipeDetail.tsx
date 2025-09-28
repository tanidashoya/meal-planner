//レジピの詳細画面を実装する

import { useParams } from "react-router-dom";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { StarRatingHalfFill } from "../components/StarRatingHalfFill";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { useEffect, useState } from "react";



export const RecipeDetail = ()=> {

    const {id} = useParams();
    const recipeStore = useRecipeStore();
    const currentUserStore = useCurrentUserStore();
    const recipes = recipeStore.getAll();
    //グローバルステートから取得したレシピデータをfilterでidが一致するものを抽出
    //filterに該当するデータがない場合にはtargetRecipeはundefinedになる
    const targetRecipe = recipes.filter(recipe => recipe.id == Number(id))[0];
    const [newTitle,setNewTitle] = useState(targetRecipe?.title || "");

    const handleChangeTitle = (e:React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(e.target.value);
    }



    const handleReload = () => {
        window.location.reload(); // ページをリロード
    };


    const handleUpdateTitle = async () => {
        const updatedRecipe = await recipeRepository.update(currentUserStore.currentUser!.id,{id:targetRecipe!.id,title:newTitle});
        recipeStore.set([updatedRecipe]);
    }

    //e.currentTarget.blur()はフォーカスを外すメソッド
    //「blur」というのは Web（ブラウザ）のUI用語で、要素（特に input や textarea）から フォーカスが外れること を指
    const handleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleUpdateTitle();
            e.currentTarget.blur()
        }
    }

    //引数に渡された文字列がURLかどうかを判定
    const isURL = (url: string | null) => {
        //urlがnullやundefinedの場合は空文字列として扱う
        //||""はurlがnullやundefinedの場合は空文字列として扱う
        //|| は「左が falsy（null, undefined, 空文字, 0, false）なら右を返す」という意味です。
        try {
            //URLオブジェクトを作成し、エラーが発生しなければURLとして有効
            //new URL():引数に正しいURLが渡された場合はオブジェクトが作られる
            //エラーが発生した場合はcatchブロックが実行される(これを利用してURLかの判定に使う)
            new URL(url || "");
            return true;
        } catch (error) {
            return false;
        }
    };

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
            if (targetRecipe === undefined && id && currentUserStore.currentUser) {
                const recipes = await recipeRepository.findAll(currentUserStore.currentUser.id);
                //LayOutを経由した場合は重複するように思えるがsetメソッドで重複を排除している
                recipeStore.set(recipes);
            }
        };
        //targetRecipeが変更されたら(詳細ページが遷移したら)newTitleを更新する
        //これがないと遷移先の詳細ページのタイトルがnewtitle（一つ前の詳細ページのタイトル）になってしまう
        setNewTitle(targetRecipe?.title || "");
        loadRecipe();
    }, [id, targetRecipe, currentUserStore.currentUser]);
    
    //Numberを付けるのはidがstring型のため
    return (
        <div className="flex flex-col items-center justify-center py-8 mx-3 h-full">
            {targetRecipe === undefined ? (
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">レシピが見つかりません</p>
                    <span className="text-xl text-gray-600">
                        ページを
                        <span onClick={handleReload} className="text-blue-500 py-2 mx-2 text-lg">
                            更新
                        </span>
                        してもう一度お試しください
                    </span>
                </div>
            ) : (              
                <div className="flex flex-col items-center justify-center w-full">
                    <input 
                    type="text" 
                    value={newTitle} 
                    className="text-center text-2xl lg:text-3xl font-bold mb-6 w-full" 
                    onChange={handleChangeTitle} 
                    onKeyDown={handleKeyDown} 
                    onBlur={handleUpdateTitle} // ← フォーカスが外れたら発火
                    />
                    <StarRatingHalfFill recipeId={targetRecipe.id} />
                    <div className="flex flex-col">
                        <span className="text-lg">参照先：</span>
                        {isURL(targetRecipe.source) ? (
                            <a 
                                href={targetRecipe.source || ""} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 py-2 lg:text-lg break-all"
                            >
                                {targetRecipe.source}
                            </a>
                        ):(
                            <span className="text-gray-700 py-3 text-lg lg:text-2xl break-all">
                                {targetRecipe.source}
                            </span>
                        )}
                        
                    </div>
                </div>
                
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
