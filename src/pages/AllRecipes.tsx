import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { toast } from "react-toastify";
import { RatingItem } from "../components/TasteSort/RatingItem";
import { Card, CardContent } from "../components/ui/card";
import { SelectCategory } from "../components/SelectCategory";
import { useAllRecipesStore } from "../modules/AllRecipes/all-recipes.state";

export const AllRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  const { currentUser } = useCurrentUserStore();
  const {
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    isSelectOpen,
    setIsSelectOpen,
  } = useAllRecipesStore();
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
    <Card className="border-0 shadow-none m-auto lg:w-3/5 w-[95%] h-full pb-8 mt-12 gap-3">
      <CardContent className="p-2 pb-28">
        <h2 className="font-['Inter'] text-xl font-bold text-gray-600 mb-8 text-center">
          Myレシピ一覧（全{recipes.length}件）
        </h2>
        <div className="flex justify-center w-full gap-2 mb-4 items-center">
          <SelectCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={handleChangeCategory}
            isSelectOpen={isSelectOpen}
            setIsSelectOpen={setIsSelectOpen}
            className="w-[176px]"
            showAllOption={true}
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <input
            type="text"
            placeholder="レシピタイトルで検索"
            value={searchText}
            onChange={handleChange}
            className="border border-gray-400 rounded-md py-2 px-4 gap-6 lg:p-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
