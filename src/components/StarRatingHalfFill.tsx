import { useState, useEffect } from "react"
import tasteIcon from "../assets/taste_icon.png"
import { useCurrentUserStore } from "../modules/auth/current-user.state"
import { recipeRepository } from "../modules/recipes/recipe.repository"
import { useRecipeStore } from "../modules/recipes/recipe.state"

interface Rating {
    recipeId: number
}

export function StarRatingHalfFill({ recipeId }: Rating) {
    const tasteWord = ["悪くない","ふつう","いい感じ","うまい！","最高！！"]
    const starArr=[1,2,3,4,5]
    const {currentUser} = useCurrentUserStore();
    const recipeStore = useRecipeStore();
    //現在の評価値を保持
    const [rating, setRating] = useState<number>(0)
    //現在の評価値を保持
    // 初期ロードでDBの値を取得
    //recipeIDが変更になるたび（レシピ詳細画面に遷移するたび）に実行される
    useEffect(() => {
        const fetchRating = async () => {
            const data = await recipeRepository.fetchRating(currentUser!.id,recipeId)
            setRating(data.rating || 0)
        }
        fetchRating()
    }, [recipeId])

	//第一引数star:numberは何番目の星かが渡される
	//クリックした星のonClickで実行する
    const handleClick = (star: number) => { 
        //新しい評価値をデータベースとグローバルステートに保存する関数定義
        const updateRating = async (newRating: number) => {
            // supabaseを更新し、更新されたレシピデータを取得
            const updatedRecipe = await recipeRepository.updateRating(currentUser!.id, recipeId, newRating)
            // グローバルステートも更新
            recipeStore.updateRating(updatedRecipe)
        }
        
        // ローカルstateを更新
        setRating(star);
        
        // 新しい値をデータベースに保存
        updateRating(star);
    }

  return (
    <div className="flex items-center gap-2 lg:gap-2 mt-8 mb-8">
	    {/*fullもhalfもboolean型の変数となる*/}
	    {/* >= : 比較演算子で 左辺が右辺以上なら true、そうでなければ false */}
	    {/* 色がつく星を決めている */}
	    {/* rating:点数 star:順番に1～5が入って判定される */}
	    {/* && 両方ともtrueであればtrue */}
	   
      {starArr.map((star) => {
        const isActive = rating >= star
        
        return (
          <div
            key={star}
            className="relative cursor-pointer w-13 h-13 lg:w-16 lg:h-16"
            onClick={() => handleClick(star)}
          >
            {/* 星の表示 */}
            <img 
              src={tasteIcon} 
              alt="taste icon" 
              className={`w-full h-full ${isActive ? '' : 'opacity-20'}`} 
            />
            <div className="w-full text-center">
                <span className="text-xs lg:text-xs text-gray-500 font-bold ">{tasteWord[star-1]}</span>
            </div>
          </div>

        )
      })}
      {/* toFixed(1)で小数点第一位まで表示(四捨五入) ⇒ 返り値は文字列*/}
      {/* <div className="text-2xl lg:text-3xl text-gray-500 ml-1 font-bold ">{rating?.toFixed(1)}</div> */}
    </div>
  )
}
