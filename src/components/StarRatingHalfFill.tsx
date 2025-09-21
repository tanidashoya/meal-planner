import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { useCurrentUserStore } from "../modules/auth/current-user.state"
import { recipeRepository } from "../modules/recipes/recipe.repository"
import { useRecipeStore } from "../modules/recipes/recipe.state"

interface Rating {
    recipeId: number
}

export function StarRatingHalfFill({ recipeId }: Rating) {
    const starArr=[1,2,3,4,5]
    const {currentUser} = useCurrentUserStore();
    const recipeStore = useRecipeStore();
    //現在の評価値を保持
    const [rating, setRating] = useState<number>(0)
    //現在の評価値を保持
    // 初期ロードでDBの値を取得
    useEffect(() => {
        const fetchRating = async () => {
            const data = await recipeRepository.fetchRating(currentUser!.id,recipeId)
            setRating(data.rating)
        }
        fetchRating()
    }, [recipeId])

	//第一引数star:numberは何番目の星かが渡される
	//クリックした星のonClickで実行する
    const handleClick = (star: number, e: React.MouseEvent<HTMLDivElement>) => { 
        //新しい評価値をデータベースに保存する関数定義
        const updateRating = async (newRating: number) => {
            // データベースを更新し、更新されたレシピデータを取得
            const updatedRecipe = await recipeRepository.updateRating(currentUser!.id, recipeId, newRating)
            // グローバルステートも更新
            recipeStore.updateRating(updatedRecipe)
        }
        //getBoundingClientRect() は要素の位置やサイズを返すメソッド。
        //left: 画面左端から要素の左端までの距離（px）。
        //e.currentTarget:イベントリスナーが「直接」設定された要素。つまり、今回の場合は星のdiv要素。
        //width: 要素の横幅（px）。
        const { left, width } = e.currentTarget.getBoundingClientRect()
        //e.clientX: クリックしたときのX座標（画面全体基準）。
        //left を引くことで「要素内のどこをクリックしたか（左からの距離）」を計算。
        const clickX = e.clientX - left
        //newRating という変数を型付きで宣言しているだけ
        let newRating: number;
        if (clickX < width / 2) {
            newRating = star - 0.5; // 左半分クリック → .5
        } else {
            newRating = star;       // 右半分クリック → その数値
        }
        // ローカルstateを更新
        setRating(newRating);
        
        // 新しい値をデータベースに保存
        updateRating(newRating);
    }

  return (
    <div className="flex items-center gap-2.5 lg:gap-1.5 mt-4 mb-8">
	    {/*fullもhalfもboolean型の変数となる*/}
	    {/* >= : 比較演算子で 左辺が右辺以上なら true、そうでなければ false */}
	    {/* 色がつく星を決めている */}
	    {/* rating:点数 star:順番に1～5が入って判定される */}
	    {/* && 両方ともtrueであればtrue */}
	   
      {starArr.map((star) => {
        const full = rating >= star
        {/* rating が 「(その星の番号 − 0.5) 以上」かつ「その星の番号未満」 のときに true */}
        const half = rating >= star - 0.5 && rating < star
        
        return (
          <div
            key={star}
            className="relative cursor-pointer"
            onClick={(e) => handleClick(star, e)}
          >
            {/* ベース（グレーの空の星） */}
            <Star className="h-9 w-9 text-gray-300" />

            {/* 塗りつぶしレイヤー */}
            {/*三項演算子：条件 ? 真の場合 : 偽の場合*/}
            {/* overflow-hidden：cssのはみ出した部分を隠す */}
            {/* styleで100%や50%を指定することでdivの横幅を変えている */}
            {/* className (Tailwind) → デザインを統一、静的な値向き。
								style → その場で動的に変化させたいとき向き。 */}
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: full ? "100%" : half ? "50%" : "0%" }}
            >
            {/* fillタイプ（内側の色指定等がある）のアイコンの場合はfillで色指定可能 */}
            {/* strockタイプ（線タイプ）アイコンの場合はstrokeWidth={3}で太さ・色調整可能 
		            ⇒ classNameの外側に指定*/}
              <Star className="h-9 w-9 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        )
      })}
      <div className="text-xl text-gray-500 ml-2 font-bold ">{rating?.toFixed(1)}</div>
    </div>
  )
}
