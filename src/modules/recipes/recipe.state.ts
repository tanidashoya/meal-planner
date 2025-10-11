import { atom, useAtom } from "jotai"
import {Recipe} from "./recipe.entity"
import {recipeRepository} from "./recipe.repository"
import { toast } from "react-toastify"

const recipeAtom = atom<Recipe[]>([])

export const useRecipeStore = () => {
    const [recipes, setRecipes] = useAtom(recipeAtom)
    

    //グローバルステートのレシピを更新する
    const set = (newRecipes:Recipe[]) => {
        setRecipes((oldRecipe)=>{
            const combinedRecipes = [...oldRecipe,...newRecipes]
            //空のオブジェクトを作成
            const uniqueRecipes:{[key:number]:Recipe} = {}
            for (const recipe of combinedRecipes){
                //recipeのidをキー、値をrecipeして格納
                //recipe.id をキーとして使用
                // そのキーに対応する値として recipe オブジェクト全体を格納
                //オブジェクトでは同じキーを持つ値が追加されたときには既存のキーのものは更新される(重複排除)
                uniqueRecipes[recipe.id] = recipe
            }
            //Object.values:引数に渡されたオブジェクトの値を配列にするメソッド
            return Object.values(uniqueRecipes)
        })
    }

    //グローバルステートから該当するレシピを削除する
    const deleteRecipe = async(userID:string,id:number) => {
        setRecipes((oldRecipe) => {
            return oldRecipe.filter(recipe => recipe.id != id)
        })
        try{
            await recipeRepository.delete(userID,id)
        }catch(error){
            toast.error(error instanceof Error ? error.message : "不明なエラーが発生しました")
        }
    }
    
    //グローバルステートから該当するレシピを取得する
    //idはURLから渡されたidを渡す予定
    //コンポーネント描画用のデータとして使われる。
    const getOne = (id:number) => {
        return recipes.filter(recipe => recipe.id == id)
    }

    //レシピの評価を更新する（単一のレシピを更新）
    const updateRecipeRating = (updatedRecipe: Recipe) => {
        setRecipes((oldRecipes) => {
            return oldRecipes.map(recipe => 
                recipe.id === updatedRecipe.id ? updatedRecipe : recipe
            )
        })
    }

    const clear = () => setRecipes([])

    return{
        getAll:() => recipes,
        set,
        delete:deleteRecipe,
        getOne,
        updateRating: updateRecipeRating,
        clear
    }
}