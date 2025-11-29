import { useRecipeStore } from "../modules/recipes/recipe.state";
import { useNavigate } from "react-router-dom";
// import { MoreVertical, Trash2 } from "lucide-react";
// import { useCurrentUserStore } from "../modules/auth/current-user.state";
// import { toast } from "react-toastify";
import { ImageOgp } from "../components/ImageOgp";
import { DeleteButton } from "../components/DeleteButton";
import { useMemo } from "react";
import { Recipe } from "../modules/recipes/recipe.entity";
import { Card, CardContent } from "../components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";

export const UnratedRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  // カテゴリの表示順序を定義
  const CATEGORY_ORDER = [
    "肉料理",
    "魚料理",
    "丼・ルー料理",
    "麺料理",
    "小物",
    "その他",
  ] as const;

  const navigate = useNavigate();
  const unratedRecipes = recipes.filter(
    (recipe) => recipe.rating === null || recipe.time === null
  );

  const unratedCategoryRecipes = useMemo(() => {
    return unratedRecipes.reduce((acc, recipe) => {
      const category = recipe.category ?? "未分類";
      const next = acc[category] ?? [];
      acc[category] = [...next, recipe];
      return acc;
    }, {} as Record<string, Recipe[]>);
  }, [unratedRecipes]);

  const arrayUnratedRecipes = useMemo(() => {
    return CATEGORY_ORDER.map((category) => {
      return [category, unratedCategoryRecipes[category]] as [string, Recipe[]];
    }) as [string, Recipe[]][];
  }, [unratedCategoryRecipes, CATEGORY_ORDER]) as [string, Recipe[]][];
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

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  return (
    // <div className="w-full lg:w-4/5 mx-auto rounded-md px-5 py-5 lg:p-8 mt-12 lg:mb-8">
    //   <div className="flex items-center justify-center gap-2 mb-12 lg:mb-12">
    //     <h2 className="font-['Inter'] text-xl font-bold text-gray-600">
    //       未評価項目があるレシピ
    //     </h2>
    //     <span className="text-xl text-gray-600 font-bold">
    //       ({unratedRecipes.length}件)
    //     </span>
    //   </div>
    //   <div className="grid grid-cols-2 gap-2">
    //     {unratedRecipes.map((recipe) => (
    //       <div
    //         key={recipe.id}
    //         className="relative flex flex-col items-center justify-center gap-2 border-[1px] mb-1 shadow-sm border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50"
    //         onClick={() => moveToDetail(recipe.id)}
    //       >
    //         <ImageOgp
    //           url={recipe.source || ""}
    //           className="w-36 h-24 flex-shrink-0"
    //         />
    //         <h3 className="text-sm text-gray-600 font-bold truncate w-full">
    //           {recipe.title}
    //         </h3>
    //         <DeleteButton
    //           id={recipe.id}
    //           className="absolute top-1 right-2 bg-gray-400 text-white p-1 rounded-md opacity-70"
    //           size="w-4 h-4 text-white"
    //         />
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <Card className="border-0 shadow-none m-auto lg:w-3/5 w-full h-full pb-8 mt-15 gap-3">
      <CardContent className="p-2 pb-28">
        <h2 className="font-['Inter'] text-xl font-bold text-gray-600 mb-15 text-center">
          未評価レシピ一覧（全{unratedRecipes.length}件）
        </h2>

        <Swiper
          slidesPerView={1.1}
          centeredSlides={true}
          spaceBetween={2}
          watchSlidesProgress={true}
          // loop={true}
          autoHeight={true}
          className="!mx-auto [&_.swiper-slide:not(.swiper-slide-active)]:opacity-80"
        >
          {arrayUnratedRecipes.map(([category, recipes]) => (
            <SwiperSlide key={category} className="!flex !justify-center">
              <div className="w-[96%] max-w-full">
                <h2 className="text-2xl text-gray-600 font-bold mb-6 text-center">
                  {category} ( {recipes.length}件 )
                </h2>
                {recipes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="relative flex flex-col items-center justify-center gap-2 border-[1px] shadow-sm border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => moveToDetail(recipe.id)}
                      >
                        <ImageOgp
                          url={recipe.source || ""}
                          className="w-32 h-22 flex-shrink-0"
                        />
                        <h3 className="text-sm text-gray-600 font-bold truncate w-full">
                          {recipe.title}
                        </h3>
                        <DeleteButton
                          id={recipe.id}
                          className="absolute top-2 right-2 bg-gray-400 text-white p-1 rounded-md opacity-70"
                          size="w-4 h-4 text-white"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-lg font-bold py-30 w-full m-auto border-[1px] border-gray-300 rounded-md">
                    未評価レシピがありません
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  );
};
