import { useRecipeStore } from "../modules/recipes/recipe.state";
// import { useCurrentUserStore } from "../modules/auth/current-user.state";
// import { toast } from "react-toastify";
import { Card, CardContent } from "../components/ui/card";
// import { SelectCategory } from "../components/SelectCategory";
import { useAllRecipesStore } from "../modules/AllRecipes/all-recipes.state";
import { Recipe } from "../modules/recipes/recipe.entity";
import { ImageOgp } from "../components/ImageOgp";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

// ← ここに置けば OK！
import "swiper/css";

export const AllRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  // const { currentUser } = useCurrentUserStore();
  const { searchText, setSearchText } = useAllRecipesStore();
  const navigate = useNavigate();

  const categoryRecipes = useMemo(
    () =>
      recipes.reduce((acc, recipe) => {
        const category = recipe.category ?? "未分類";
        const next = acc[category] ?? [];
        acc[category] = [...next, recipe];
        return acc;
      }, {} as Record<string, Recipe[]>),
    [recipes]
  );

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  // const filteredRecipes = recipes.filter((recipe) => {
  //   // 検索テキストとカテゴリのフィルタリング
  //   //searchText.trim() === "" はsearchTextが空文字列かどうかを判定:空文字列の場合はtrueを返す⇒検索テキストが空の場合は全てのレシピを返す
  //   //recipe.title?.toLowerCase().includes(searchText.toLowerCase()) はrecipe.titleがsearchTextを含むかどうかを判定:含む場合はtrueを返す
  //   const matchesTitle =
  //     searchText.trim() === "" ||
  //     recipe.title?.toLowerCase().includes(searchText.toLowerCase());
  //   //selectedCategory === "全てのレシピ" はselectedCategoryが"全てのレシピ"かどうかを判定:trueの場合は全てのレシピを返す
  //   //recipe.category === selectedCategory はrecipe.categoryがselectedCategoryと一致するかどうかを判定:一致する場合はtrueを返す
  //   const matchesCategory =
  //     selectedCategory === "全てのレシピ" ||
  //     recipe.category === selectedCategory;
  //   //matchesSearch && matchesCategory は検索テキストとカテゴリのフィルタリングの結果を返す:どちらもtrueの場合はtrueを返す
  //   return matchesTitle && matchesCategory;
  // });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // const deleteRecipe = async (id: number) => {
  //   if (!currentUser) return;
  //   try {
  //     await recipesStore.delete(currentUser.id, id);
  //     toast.success("レシピを削除しました");
  //   } catch (error) {
  //     toast.error(
  //       error instanceof Error ? error.message : "不明なエラーが発生しました"
  //     );
  //   }
  // };

  //レシピの読み込み中かどうかを管理するグローバルステートがtrueの場合はローディング画面を表示する
  if (recipesStore.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none m-auto lg:w-3/5 w-full h-full pb-8 mt-12 gap-3">
      <CardContent className="p-2 pb-28">
        <h2 className="font-['Inter'] text-xl font-bold text-gray-600 mb-8 text-center">
          Myレシピ一覧（全{recipes.length}件）
        </h2>

        <div className="flex items-center justify-center gap-2 mb-8">
          <input
            type="text"
            placeholder="レシピタイトルで検索"
            value={searchText}
            onChange={handleChange}
            className="border border-gray-400 rounded-md py-2 px-4 gap-6 lg:p-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <Swiper
          slidesPerView={1.1}
          centeredSlides={true}
          spaceBetween={2}
          watchSlidesProgress={true}
          loop={true}
          autoHeight={true}
          className="!mx-auto [&_.swiper-slide:not(.swiper-slide-active)]:opacity-80"
        >
          {Object.entries(categoryRecipes).map(([category, recipes]) => (
            <SwiperSlide key={category} className="!flex !justify-center">
              <div className="w-[96%] max-w-full">
                <h2 className="text-2xl text-gray-600 font-bold mb-6 text-center">
                  {category} ( {recipes.length}件 )
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex flex-col items-center justify-center gap-2 border-[1px] shadow-sm border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => moveToDetail(recipe.id)}
                    >
                      <ImageOgp
                        url={recipe.source || ""}
                        className="w-32 h-22 flex-shrink-0"
                      />
                      <h3 className="text-sm text-gray-600 font-bold truncate w-full">
                        {recipe.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  );
};
