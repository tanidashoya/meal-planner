//レジピの詳細画面を実装する

import { useParams } from "react-router-dom";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { TastePoint } from "../components/TastePoint";
import { WatchPoint } from "../components/WatchPoint";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { useEffect, useState } from "react";
import tasteIcon from "../assets/taste_icon.png";
import watchIcon from "../assets/watch_icon.png";
import { ImageOgp } from "../components/ImageOgp";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


export const RecipeDetail = ()=> {

    const navigate = useNavigate();
    const {id} = useParams();
    const recipeStore = useRecipeStore();
    const currentUserStore = useCurrentUserStore();
    const recipes = recipeStore.getAll();
    //filterに該当するデータがない場合にはtargetRecipeはundefinedになる
    const targetRecipe = recipes.filter(recipe => recipe.id == Number(id))[0];
    //Reactの制御コンポーネントでは、valueプロパティがnullやundefinedの場合はエラーになるため、空文字列として扱う
    const [newTitle,setNewTitle] = useState(targetRecipe?.title || "");
    const imgTaste = tasteIcon;
    const tasteWord = ["悪くない","ふつう","いい感じ","うまい！","最高！！"]
    const imgWatch= watchIcon;
    const watchWord = ["らくちん","かんたん","ふつう","しっかり","大変！！"]

    //カテゴリを選択する
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(targetRecipe?.category || "");

    const handleChangeTitle = (e:React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(e.target.value);
    }

    //SelectコンポーネントではonValueChangeで直接更新処理を行うのが正しい
    const handleChangeCategory = async (value:string) => {
        setSelectedCategory(value);
        // ここで直接更新処理を行う
        if (!currentUserStore.currentUser) return;
        if (!targetRecipe) return;
        try{
            const updatedRecipe = await recipeRepository.update(
                currentUserStore.currentUser.id,
                { id: targetRecipe.id, category: value }
            );
            recipeStore.set([updatedRecipe]);
        }catch(error){
            toast.error(error instanceof Error ? error.message : "不明なエラーが発生しました");
        }
    }


    //リロードじゃなくて追加画面に戻る方がいいかな
    const handleReload = () => {
        navigate("/recipes"); // ページをリロード
        window.location.reload();
    };


    const handleUpdateTitle = async () => {

        if (!currentUserStore.currentUser) return;
        if (!targetRecipe) return;
        try{
        const updatedRecipe = await recipeRepository.update(
            currentUserStore.currentUser.id,
            {id:targetRecipe.id,title:newTitle}
        );
            recipeStore.set([updatedRecipe]);
        }catch(error){
            toast.error(error instanceof Error ? error.message : "不明なエラーが発生しました");
        }
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
            console.error("エラー内容:", error);
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
    //if (!targetRecipe && id && currentUserStore.currentUser) {：これはレシピのidとログインユーザーのIDが取得できているのに
    //targetRecipeが取得できていない場合にはレシピを取得するようにしている
    useEffect(() => {
        const loadRecipe = async () => {
            if (!targetRecipe && id && currentUserStore.currentUser) {
                try{
                const recipes = await recipeRepository.findAll(currentUserStore.currentUser.id);
                //LayOutを経由した場合は重複するように思えるがsetメソッドで重複を排除している
                recipeStore.set(recipes);
                }catch(error){
                    toast.error(error instanceof Error ? error.message : "不明なエラーが発生しました");
                }
            }
        };
        //targetRecipeが変更されたら(詳細ページが遷移したら)newTitleを更新する
        //これがないと遷移先の詳細ページのタイトルがnewtitle（一つ前の詳細ページのタイトル）になってしまう
        loadRecipe();
        setNewTitle(targetRecipe?.title || "");
        setSelectedCategory(targetRecipe?.category || "");
    }, [id, targetRecipe, currentUserStore.currentUser,recipeStore]);
    
    //Numberを付けるのはidがstring型のため
    return (
        <div className="flex flex-col items-center justify-center mx-5 h-full max-h-full overflow-hidden">
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
                    <ImageOgp url={targetRecipe.source || ""} className="w-full h-32 mb-5"/>
                    <div className="flex justify-center w-full gap-2">
                        <Select 
                            value={selectedCategory} 
                            onValueChange={handleChangeCategory}
                            open={isSelectOpen}
                            onOpenChange={setIsSelectOpen}
                        >
                            {/* onTouchStart */}
                            <SelectTrigger className="w-30 bg-secondary focus:!outline-none focus-visible:!outline-none focus:!ring-1 focus:!ring-blue-500 "
                                // タッチイベント
                                onTouchStart={() => {
                                    // スマホでキーボードが開いている場合は少し遅らせて閉じる
                                    //document.activeElementは現在フォーカスされている要素を取得
                                    //スマホでキーボードが開いているかを判定する条件式（なにかにフォーカス中であればキーボードが開いていると判断）
                                    if (document.activeElement && document.activeElement instanceof HTMLElement) {
                                        // タッチ開始から少し待ってからキーボードを閉じる
                                        //150ms待ってからキーボードを閉じる(blurメソッドでフォーカスを外す)
                                        setTimeout(() => {
                                            if (document.activeElement instanceof HTMLElement) {
                                                document.activeElement.blur();
                                            }
                                            // キーボードが閉じた後にSelectを開く
                                            setTimeout(() => {
                                                setIsSelectOpen(true);
                                            }, 200);
                                        }, 150);
                                    } else {
                                        // キーボードが開いていない場合は即座にSelectを開く
                                        setIsSelectOpen(true);
                                    }
                                }}
                            >
                                <SelectValue placeholder="カテゴリの選択" className="focus:outline-none focus:ring-1 focus:!ring-blue-500" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="肉料理" className="text-lg">肉料理</SelectItem>
                                <SelectItem value="魚料理" className="text-lg">魚料理</SelectItem>
                                <SelectItem value="丼・ルー料理" className="text-lg">丼・ルー料理</SelectItem>
                                <SelectItem value="麺料理" className="text-lg">麺料理</SelectItem>
                                <SelectItem value="小物" className="text-lg">小物</SelectItem>
                                <SelectItem value="その他" className="text-lg">その他</SelectItem>
                            </SelectContent>
                        </Select>
                        <input 
                            type="text" 
                            value={newTitle} 
                            className="border rounded-md pl-2 text-left text-lg lg:text-3xl w-4/5 font-['Inter'] truncate font-medium text-gray-700 lg:mb-8 focus:!outline-none focus-visible:!outline-none focus:!ring-1 focus:!ring-blue-500" 
                            onChange={handleChangeTitle} 
                            onKeyDown={handleKeyDown} 
                            onBlur={handleUpdateTitle} // ← フォーカスが外れたら発火
                        />
                    </div>
                    <div className="flex  border-b-2 mb-3 py-2 w-full lg:w-1/2 text-center lg:mb-12">
                        <span className="text-sm">参照：</span>
                        {isURL(targetRecipe.source) ? (
                            <a 
                                href={targetRecipe.source || ""} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                
                                className="text-blue-500 text-sm lg:text-base truncate w-4/5 mx-auto lg:w-full"
                            >
                                {targetRecipe.source}
                            </a>
                        ):(
                            <span className="text-gray-700 text-base lg:text-2xl break-all">
                                {targetRecipe.source}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 lg:gap-8 lg:w-full">
                        <div className="flex flex-col items-center justify-center shadow-sm border rounded-lg px-4 pt-1 pb-0 lg:px-12 lg:py-4">
                            <h3 className="text-base border-b-1 mb-1">あじの感想</h3>
                            <TastePoint recipeId={targetRecipe.id} img={imgTaste} Word={tasteWord} />
                        </div>
                        <div className="flex flex-col items-center justify-center shadow-sm border rounded-lg px-4 pt-1 pb-0 lg:px-12 lg:py-4">
                            <h3 className="text-base border-b-1 mb-1">調理時間</h3>
                            <WatchPoint recipeId={targetRecipe.id} img={imgWatch} Word={watchWord} />
                        </div>
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
