import { useRecipeStore } from "../modules/recipes/recipe.state";
import { Card, CardContent } from "../components/ui/card";
import { useAllRecipesStore } from "../modules/AllRecipes/all-recipes.state";
import { Recipe } from "../modules/recipes/recipe.entity";
import { ImageOgp } from "../components/ImageOgp";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMemo } from "react";
// ← ここに置けば OK！
import "swiper/css";
import { DeleteButton } from "../components/DeleteButton";
import { useCurrentUserStore } from "../modules/auth/current-user.state";

const CATEGORY_ORDER = [
  "肉料理",
  "魚料理",
  "丼・ルー料理",
  "麺料理",
  "小物",
  "その他",
];

export const AllRecipes = () => {
  const recipesStore = useRecipeStore();
  const recipes = recipesStore.getAll();
  //currentUserは使われてはいないが種ページと同様で防御策の早期returnとして記述
  const { currentUser } = useCurrentUserStore();
  //早期returnの後にhooksがあるとlintエラーになる
  // if (!currentUser) return;

  const { searchText, setSearchText } = useAllRecipesStore();
  const SWIPER_KEY = "all-recipes-swiper-index";
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

  // ☆ ??[]がないとエラーになる
  //この流れになっているから
  /*
  Layout マウント
         ↓
  useEffect で fetchRecipes() 開始（非同期）
          ↓
  【同時に】AllRecipes レンダリング ← ここでデータはまだない！
          ↓
  recipes = []（空配列）
          ↓
  categoryRecipes = {}（空オブジェクト）
          ↓
  categoryRecipes["肉料理"] = undefined 💥 ここで一度undefinedになるから
          ↓
  （後から）fetchRecipes() 完了
          ↓
  recipes = [{...}, {...}, ...]（データあり）
          ↓
  再レンダリング → 正常表示
  */
  //しかしこれは正常。なぜなら・・・
  // 1. まずUIをレンダリングする（データがなくても）
  // 2. データが来たら再レンダリングする
  // ※ useEffectは「レンダリング後」に実行されるため、
  //    データ取得完了を待たずに先にUIがレンダリングされる
  //だから開発者はローディング状態の管理やundefined・nullになることを気にしないといけない
  //データ取得前の最初のレンダリング時にはcategoryRecipesは空オブジェクトになっているから、
  //そのままmapメソッドを実行するとcategoryRecipes[category]が空のオブジェクトのプロパティにアクセスしてしまうからundefinedになってしまうからエラーになる
  //そのため、categoryRecipes[category] ?? []とすることで空のオブジェクトのプロパティにアクセスしてしまうと空配列を返すようにする
  const filteredRecipes = useMemo(() => {
    // 定義された順序でカテゴリを処理し、存在するカテゴリのみを返す
    return CATEGORY_ORDER.map((category): [string, Recipe[]] => {
      return [
        category,
        (categoryRecipes[category] ?? []).filter((recipe) => {
          return recipe.title?.toLowerCase().includes(searchText.toLowerCase());
        }),
      ];
    });
  }, [categoryRecipes, searchText]);

  const moveToDetail = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }
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
        <h2 className="font-['Inter'] text-2xl font-bold text-gray-600 mb-8 text-center">
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
          // loop={true}
          autoHeight={true}
          //保存しているスライドのインデックス（Number(sessionStorage.getItem(SWIPER_KEY))）を取得して、そのインデックスのスライドに移動
          //もし保存しているスライドのインデックスがない場合は0番目のスライドに移動
          initialSlide={Number(sessionStorage.getItem(SWIPER_KEY)) || 0}
          //スワイパーのスライドが変わった時に実行
          //移動後のスライドのインデックス（swiper.activeIndex）をsessionStorageに保存
          onSlideChange={(swiper) => {
            sessionStorage.setItem(SWIPER_KEY, String(swiper.activeIndex));
          }}
          className="!mx-auto [&_.swiper-slide:not(.swiper-slide-active)]:opacity-80"
        >
          {filteredRecipes.map(([category, recipes]) => (
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
                    検索結果がありません
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
