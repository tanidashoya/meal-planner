import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { toast } from "react-toastify";
import { RatingItem } from "../components/TasteSort/RatingItem";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

export const AllRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const { currentUser } = useCurrentUserStore();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全てのレシピ");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const filteredRecipes = recipes.filter((recipe) => {
    // 検索テキストとカテゴリのフィルタリング
    //searchText.trim() === "" はsearchTextが空文字列かどうかを判定:空文字列の場合はtrueを返す⇒検索テキストが空の場合は全てのレシピを返す
    //recipe.title?.toLowerCase().includes(searchText.toLowerCase()) はrecipe.titleがsearchTextを含むかどうかを判定:含む場合はtrueを返す
    const matchesTitle =
      searchText.trim() === "" ||
      recipe.title?.toLowerCase().includes(searchText.toLowerCase());
    //selectedCategory === "全てのレシピ" はselectedCategoryが"全てのレシピ"かどうかを判定:trueの場合は全てのレシピを返す
    //recipe.category === selectedCategory はrecipe.categoryがselectedCategoryと一致するかどうかを判定:一致する場合はtrueを返す
    const matchesCategory =
      selectedCategory === "全てのレシピ" ||
      recipe.category === selectedCategory;
    //matchesSearch && matchesCategory は検索テキストとカテゴリのフィルタリングの結果を返す:どちらもtrueの場合はtrueを返す
    return matchesTitle && matchesCategory;
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const handleChangeCategory = (value: string) => {
    setSelectedCategory(value);
  };
  const deleteRecipe = async (id: number) => {
    if (!currentUser) return;
    try {
      await recipesStore.delete(currentUser.id, id);
      toast.success("レシピを削除しました");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      );
    }
  };

  return (
    <Card className="border-0 shadow-none m-auto lg:w-3/5 w-19/20 h-full pb-8 mt-12 gap-3">
      <CardContent className="p-2 pb-28">
        <h2 className="font-['Inter'] text-xl font-bold text-gray-600 mb-8 text-center">
          Myレシピ一覧（全{recipes.length}件）
        </h2>
        <div className="flex justify-center w-full gap-2 mb-4 items-center">
          <Select
            value={selectedCategory}
            onValueChange={handleChangeCategory}
            open={isSelectOpen}
            onOpenChange={setIsSelectOpen}
          >
            {/* onTouchStart */}
            <SelectTrigger
              className="w-40 bg-secondary focus:!outline-none focus-visible:!outline-none focus:!ring-1 focus:!ring-blue-500 "
              // タッチイベント
              onTouchStart={() => {
                // スマホでキーボードが開いている場合は少し遅らせて閉じる
                //document.activeElementは現在フォーカスされている要素を取得
                //スマホでキーボードが開いているかを判定する条件式（なにかにフォーカス中であればキーボードが開いていると判断）
                if (
                  document.activeElement &&
                  document.activeElement instanceof HTMLElement
                ) {
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
              <SelectValue
                placeholder="カテゴリの選択"
                className="focus:outline-none focus:ring-1 focus:!ring-blue-500"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全てのレシピ" className="text-lg">
                全てのレシピ
              </SelectItem>
              <SelectItem value="肉料理" className="text-lg">
                肉料理
              </SelectItem>
              <SelectItem value="魚料理" className="text-lg">
                魚料理
              </SelectItem>
              <SelectItem value="丼・ルー料理" className="text-lg">
                丼・ルー料理
              </SelectItem>
              <SelectItem value="麺料理" className="text-lg">
                麺料理
              </SelectItem>
              <SelectItem value="小物" className="text-lg">
                小物
              </SelectItem>
              <SelectItem value="その他" className="text-lg">
                その他
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <input
            type="text"
            placeholder="レシピタイトルで検索"
            value={searchText}
            onChange={handleChange}
            className="border-1 border-gray-400 rounded-md py-2 px-4 gap-6 lg:p-10"
          />
        </div>
        <RatingItem
          recipes={filteredRecipes}
          deleteRecipe={deleteRecipe}
          className="border-2 w-full border-gray-300 rounded-md py-7 px-7 gap-6 lg:p-10"
        />
      </CardContent>
    </Card>
  );
};
