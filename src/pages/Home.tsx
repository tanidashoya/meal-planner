import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { Navigate } from "react-router-dom";
import { RecipeParams } from "../modules/recipes/recipe.entity";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "react-toastify";
import mealPlanner from "../assets/mealPlanner.webp";
import { SelectCategory } from "../components/SelectCategory";

export function Home() {
  const currentUserStore = useCurrentUserStore();
  const recipeStore = useRecipeStore();
  const [recipeTitle, setRecipeTitle] = useState("");
  const [source, setSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //selectedCategoryはcategoryの中の最初の要素を初期値としている
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const createRecipe = async (params: RecipeParams) => {
    if (!currentUserStore.currentUser) {
      toast.error("ログインしてください");
      return;
    }
    try {
      setIsLoading(true);
      const recipe = await recipeRepository.create(
        currentUserStore.currentUser.id,
        params
      );
      if (recipe == null) return;
      //グローバルステートに追加
      recipeStore.set([recipe]);
      toast.success("レシピの追加に成功しました");
    } catch (error) {
      //instanceofは左のオペランドが右のクラスに属するインスタンスかを判定してboolean値を返す
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
    setRecipeTitle("");
    setSource("");
    setSelectedCategory("");
    // return recipe
  };

  //条件分岐の中で「この画面を表示する代わりにリダイレクトしたい」場合はNavigateを使う
  if (currentUserStore.currentUser == null) {
    return <Navigate to="/signin" />;
  }

  //m-auto: 左右のマージンを自動で設定し、水平方向の中央揃えを行います
  // w-1/2: 幅を親要素の50%に設定します
  return (
    <div className="h-full max-h-full flex items-center justify-center overflow-hidden">
      <Card className="border-0 shadow-none w-[95%] sm:w-[90%] lg:w-3/5 gap-2">
        <CardHeader>
          <CardTitle className="text-xl font-['Inter'] font-bold md:text-5xl font-medium tracking-wide text-center text-gray-800">
            <img
              src={mealPlanner}
              alt="mealPlanner"
              className="h-[120px] m-auto"
            />
          </CardTitle>
          <CardDescription className="text-base md:text-2xl font-medium lg:mt-16 text-gray-500 text-center mb-4">
            新しいレシピを追加しよう！
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3.5 border-2 border-gray-300 rounded-lg px-6 py-6 shadow-sm lg:gap-3.5">
          {/* categoryの入力欄を作成する */}
          <div className="flex items-center gap-1">
            <SelectCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              isSelectOpen={isSelectOpen}
              setIsSelectOpen={setIsSelectOpen}
              className="w-[170px]"
            />
            <span className="text-red-500 ml-2 text-base md:text-lg">
              ※必須
            </span>
          </div>
          {/* recipeTitleの入力欄・参照元の入力欄を作成する */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4/5">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="レシピのタイトルを入力"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                />
              </div>
              <div className="text-red-500 ml-2 text-base md:text-lg">
                ※必須
              </div>
            </div>

            <div className="flex items-center gap-1 w-4/5">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="参照元（例：URL、書籍など）"
                value={source}
                maxLength={30}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
          </div>

          {/* createRecipeメソッドにはparams:RecipeParams型のオブジェクトを渡す */}
          <Button
            onClick={() =>
              createRecipe({
                title: recipeTitle,
                category: selectedCategory,
                source: source,
              })
            }
            className="w-[180px] mt-4 bg-green-500 mx-auto "
            disabled={!recipeTitle.trim() || !selectedCategory}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Plus className="h-4 w-4 text-white" />
                <span className="text-white pr-2">Myレシピに追加</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/*

CategorySelectコンポーネントはカテゴリを選択するためのUIを提供する

<Select> : Select全体のラッパー。valueで現在の値を保持し、onValueChangeで変更時に親へ通知する
<SelectTrigger> : ドロップダウンを開くためのボタン。classNameで見た目や幅を指定できる
<SelectValue> : 現在選択されている値を表示する。選択前はplaceholderが表示される
<SelectContent> : ドロップダウンの中身。選択肢（SelectItem）が並ぶコンテナ
<SelectItem> : 実際の選択肢。valueがアプリ側で扱う値、テキストがユーザーに見えるラベル

*/
