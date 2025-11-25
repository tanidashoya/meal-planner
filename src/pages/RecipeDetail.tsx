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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SelectCategory } from "../components/SelectCategory";
import { Button } from "../components/ui/button";

export const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const recipeStore = useRecipeStore();
  const currentUserStore = useCurrentUserStore();
  const recipes = recipeStore.getAll();
  //ローディング中かどうかを管理する状態（このコンポーネントで取得しなければならないときはtrueにする）
  const [isLoading, setIsLoading] = useState(false);
  //それぞれのアイコンローディング中かどうかを管理する状態
  //filterに該当するデータがない場合にはtargetRecipeはundefinedになる
  const targetRecipe = recipes.filter((recipe) => recipe.id == Number(id))[0];
  //Reactの制御コンポーネントでは、valueプロパティがnullやundefinedの場合はエラーになるため、空文字列として扱う
  const [newTitle, setNewTitle] = useState(targetRecipe?.title ?? "");
  const imgTaste = tasteIcon;
  const tasteWord = ["悪くない", "ふつう", "いい感じ", "うまい！", "最高！！"];
  const imgWatch = watchIcon;
  const watchWord = ["らくちん", "かんたん", "ふつう", "しっかり", "大変！！"];
  //カテゴリを選択する
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    targetRecipe?.category ?? ""
  );

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  //SelectコンポーネントではonValueChangeで直接更新処理を行うのが正しい
  const handleChangeCategory = async (value: string) => {
    if (!currentUserStore.currentUser || !targetRecipe) return;
    //状態に保管してpropsに渡すために必要
    setSelectedCategory(value);
    try {
      const updatedRecipe = await recipeRepository.update(
        currentUserStore.currentUser.id,
        { id: targetRecipe.id, category: value }
      );
      recipeStore.set([updatedRecipe]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "カテゴリの更新に失敗しました"
      );
    }
  };

  //追加画面に戻る
  const handleReload = () => {
    navigate("/");
    window.location.reload();
  };

  const handleUpdateTitle = async () => {
    if (!currentUserStore.currentUser || !targetRecipe) return;
    try {
      const updatedRecipe = await recipeRepository.update(
        currentUserStore.currentUser.id,
        { id: targetRecipe.id, title: newTitle }
      );
      recipeStore.set([updatedRecipe]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "タイトルの更新に失敗しました"
      );
    }
  };

  //e.currentTarget.blur()はフォーカスを外すメソッド（Enterを押したらフォーカスを外す）
  //スマホの標準キーボードではEnterキーを押してもフォーカスが外れないため、フォーカスを外すためにはblurメソッドを使用する
  //「blur」というのは Web（ブラウザ）のUI用語で、要素（特に input や textarea）から フォーカスが外れること を指す
  //これは主にPCで入力したときにEnterキーを押したら更新されて、フォーカスを外すために使用する
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!currentUserStore.currentUser || !targetRecipe) return;
    if (e.key === "Enter") {
      handleUpdateTitle();
      e.currentTarget.blur();
    }
  };

  //引数に渡された文字列がURLかどうかを判定
  const isURL = (url: string | null) => {
    if (!url) return false;
    //引数のurlがhttpから始まっていない場合はfalseを返す
    if (!url.startsWith("http")) return false;
    //|| は「左が falsy（null, undefined, 空文字, 0, false）なら右を返す」という意味
    try {
      //URLオブジェクトを作成し、エラーが発生しなければURLとして有効
      //new URL():引数に正しいURLが渡された場合はオブジェクトが作られる
      //エラーが発生した場合はcatchブロックが実行される(これを利用してURLかの判定に使う)
      new URL(url);
      return true;
    } catch (error) {
      console.error("エラー内容:", error);
      return false;
    }
  };

  //shareUrlはURLかどうかを判定して、URLの場合はそのURLを、それ以外は空文字列を返す
  const shareUrl =
    targetRecipe?.source && isURL(targetRecipe.source)
      ? targetRecipe.source
      : "";
  //lineShareUrlはshareUrlがURLの場合はそのURLを、それ以外は空文字列を返す
  // https://line.me/R/msg/text/?... は LINE公式の共有URL（Webリンク方式）
  //encodeURIComponent:URL として使っても壊れないように、安全な文字列に変換するための関数(URLエンコードしてエラーを起こさないようにする)
  const lineShareUrl = isURL(shareUrl)
    ? `https://line.me/R/msg/text/?${encodeURIComponent(shareUrl)}`
    : "";

  // LINE共有のハンドラー（ボタンを押したら共有する）
  const handleShareToLine = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isURL(shareUrl)) return;

    //navigater.share（Web Share APIのメソッド）に指定したオブジェクトをOSの共有UIに渡して、ユーザーが選んだ共有先アプリにその情報を共有する
    //Web Share API:スマホ（iPhone/Android）のブラウザで シェア用のネイティブUI（共有メニュー）を開く API。
    //Web Share APIは非同期関数async-awaitと組み合わせて使用する
    // if (navigator.share) :「このブラウザで Web Share API が使えるかどうか？」を確認している。
    try {
      if (navigator.share) {
        await navigator.share({
          title: targetRecipe?.title || "",
          text: targetRecipe?.title || "",
          url: shareUrl,
        });
      } else {
        // フォールバック: LINE URLを直接開く（Web Share APIが使えない場合はLINE URLを直接開く）
        // LINEの共有UIが立ち上がる
        window.open(lineShareUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      // ユーザーが共有をキャンセルした場合など
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("共有エラー:", error);
        toast.error("LINE共有エラーが発生しました");
        // エラー時もフォールバックとしてLINE URLを開く
        window.open(lineShareUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  //レシピが見つからない場合、データベースから直接取得
  //ここでは状態変化させない
  useEffect(() => {
    (async () => {
      if (!targetRecipe && id && currentUserStore.currentUser) {
        try {
          setIsLoading(true);
          const recipes = await recipeRepository.findAll(
            currentUserStore.currentUser.id
          );
          //LayOutを経由した場合は重複するように思えるがsetメソッドで重複を排除している
          recipeStore.set(recipes);
        } catch (error) {
          console.error("エラー内容:", error);
          toast.error("レシピの取得エラーが発生しました");
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [id, targetRecipe, currentUserStore.currentUser, recipeStore]);

  // targetRecipeが変更されたらnewTitleを更新する
  // これがないと別のレシピの詳細ページに遷移したときにタイトルが前のレシピのタイトルになってしまう
  //RecipeDetailは/recipes/:id内でパラメータだけ変わるため、このコードがないと前のレシピのタイトルとカテゴリが保持されてしまう
  useEffect(() => {
    if (targetRecipe) {
      setNewTitle(targetRecipe.title || "");
      setSelectedCategory(targetRecipe.category || "");
    }
  }, [targetRecipe]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  //Numberを付けるのはidがstring型のため
  return (
    <div className="flex flex-col items-center justify-center px-4 mt-8 h-full max-h-full overflow-hidden">
      {targetRecipe === undefined ? (
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">レシピが見つかりません</p>
          <span className="text-xl text-gray-600">
            ページを
            <span
              onClick={handleReload}
              className="text-blue-500 py-2 mx-2 text-lg"
            >
              更新
            </span>
            してもう一度お試しください
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          <a
            href={targetRecipe.source || ""}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center justify-center gap-2 w-full border-[1px] shadow-sm border-gray-300 rounded-lg px-2">
              <ImageOgp
                url={targetRecipe.source || ""}
                className="w-45 h-28 flex-shrink-0 py-1"
              />
              {/* asChild: Buttonコンポーネントの子要素としてaタグを使用する */}
              {/* asChild は、Buttonコンポーネントが自身のDOM要素（<button>）をレンダリングせず、子要素（この場合は <a>）をそのまま使用するためのプロパティ */}
              {/* flex-1: 親要素の残りのスペースを埋める */}
              {/* min-w-0: 最小幅を0に設定 */}
              <div className="flex flex-col items-start justify-center gap-2 min-w-0 flex-1">
                {isURL(targetRecipe.source) ? (
                  <span className="text-blue-500 text-sm lg:text-base break-all line-clamp-3 w-full">
                    {targetRecipe.source}
                  </span>
                ) : (
                  <span className="text-gray-700 text-base lg:text-2xl">
                    {targetRecipe.source}
                  </span>
                )}
              </div>
            </div>
          </a>
          <div className="flex justify-start items-center w-full gap-4 mt-2">
            <SelectCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={handleChangeCategory}
              isSelectOpen={isSelectOpen}
              setIsSelectOpen={setIsSelectOpen}
              className={"flex-1"}
            />
            {shareUrl && (
              <Button
                variant="outline"
                className="!px-4 !py-5 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 bg-[#00C300] focus:!bg-[#00C300] focus-visible:!bg-[#00C300] !text-white focus:!text-white focus-visible:!text-white font-bold"
                onClick={handleShareToLine}
              >
                LINEで共有
              </Button>
            )}
          </div>
          <div className="border-b-2 mb-3 py-2 w-full lg:w-1/2 text-center lg:mb-12">
            <input
              type="text"
              value={newTitle}
              className="w-full border-[1px] border-gray-300 rounded-md pl-2 py-1 text-left text-lg lg:text-3xl font-['Inter'] font-medium text-gray-700 lg:mb-8 focus:!outline-none focus-visible:!outline-none focus:!ring-1 focus:!ring-blue-500"
              onChange={handleChangeTitle}
              onKeyDown={handleKeyDown}
              onBlur={handleUpdateTitle} // ← フォーカスが外れたら発火
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 lg:gap-8 lg:w-full">
            <div className="flex flex-col items-center justify-center shadow-sm border rounded-lg px-4 pt-1 pb-0 lg:px-12 lg:py-4">
              <h3 className="text-base border-b mb-1">あじの感想</h3>
              <TastePoint
                recipeId={targetRecipe.id}
                img={imgTaste}
                Word={tasteWord}
              />
            </div>
            <div className="flex flex-col items-center justify-center shadow-sm border rounded-lg px-4 pt-1 pb-0 lg:px-12 lg:py-4">
              <h3 className="text-base border-b mb-1">調理時間</h3>
              <WatchPoint
                recipeId={targetRecipe.id}
                img={imgWatch}
                Word={watchWord}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
