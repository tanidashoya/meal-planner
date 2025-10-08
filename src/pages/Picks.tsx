import { useEffect, useState } from "react"
import { picksRepository } from "../modules/picks/picks.repository"
import {dailyPicksItems} from "../modules/picks/picks.entity"
import { ImageOgp } from "../components/ImageOgp"
import { useCurrentUserStore } from "../modules/auth/current-user.state"
import { useRecipeStore } from "../modules/recipes/recipe.state"
import { RecipeParams } from "../modules/recipes/recipe.entity"
import { recipeRepository } from "../modules/recipes/recipe.repository"
import { Plus, Check } from "lucide-react"

export const Picks = () => {

    const [officialRecipes, setOfficialRecipes] = useState<dailyPicksItems[]>([])
    const {currentUser} = useCurrentUserStore()
    const recipeStore = useRecipeStore()
    // id をキーにして状態を管理(stateのオブジェクトを作成)
    //型は{ [id: string]: boolean }というオブジェクトを作成
    //id: stringはオブジェクトのキー、booleanはオブジェクトの値
    //初期値は空のオブジェクト
    //{ [id: number]: boolean } は、TypeScriptでいう「インデックスシグネチャ」です。// 平たく言うと：
    // “idという数値のキーに対して、値は必ずboolean型になりますよ”
    const [isAddingRecipe, setIsAddingRecipe] = useState<{ [id: number]: boolean }>({});



    /*
    この行👇
        setIsAddingRecipe(prev => ({ ...prev, [id]: true }));

        は、内部的にこんなオブジェクトを作っています👇
        {
        "uuid-1": true,
        "uuid-2": false,
        "uuid-3": true,
        }

    */
    const createRecipe = async(params:RecipeParams) => {
        //idがnullの場合は早期return
        if (params.id == null) {
            return
        }
        //isAddingRecipeのidをキーにしてtrueにする
        //追加しましたの判断で使う
        setIsAddingRecipe({ ...isAddingRecipe, [params.id]: true })
        const recipes = await recipeRepository.create(currentUser!.id,params)
        if (recipes == null) {
            return
        }
        recipeStore.set([recipes])
    }



    //useEffect 内で宣言した変数（ここでは officialRecipes）は、「その関数（useEffect内）」のスコープにだけ有効
    //だからuseStateで保持する必要がある
    useEffect(() => {
        const fetchPicksData = async () => {
            const dailyId = await picksRepository.fetchNewDateID()
            const officialRecipes = await picksRepository.fetchOfficialRecipes(dailyId.id)
            if (officialRecipes == null) {
                return
            }
            setOfficialRecipes(officialRecipes)
            // console.log("officialRecipes:", officialRecipes)
        }
        fetchPicksData()
    },[])
    
    //window.open：JavaScript で新しいウィンドウ（またはタブ）を開くための関数
    //
    return (
        <div className="flex flex-col items-center justify-center gap-2 mt-12 mb-16">
            <div className="mb-8">
                <p className="text-2xl font-bold mb-2">今日のレシピ5選</p>
                <p className="text-sm text-gray-500">※毎日午前８時に更新されます</p>
            </div>
            {officialRecipes.map((officialRecipe) => (
                <div key={officialRecipe.id} className="mb-2 p-0 w-4/5">
                    <div>
                        <button 
                            onClick={() => window.open(`${officialRecipe.url}`, "_blank", "noopener,noreferrer")}
                            className="block w-full p-4 focus:!outline-none border !border-gray-300 !shadow-sm overflow-hidden rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex flex-col items-center justify-center gap-2 mb-4 w-full p-0">
                                <span className="block font-medium truncate w-full">{officialRecipe.title}</span>
                                <span className="block text-blue-500 font-medium text-sm truncate w-full">{officialRecipe.url}</span>
                            </div>
                            <ImageOgp url={officialRecipe.url || ""} className="w-full h-28 my-0" />
                        </button>
                    </div>
                    {/* Myレシピに追加ボタン(押したらisAddingRecipeの状態でofficialRecipe.idをキーにしてtrueにする) */}
                    {/* その状態（オブジェクト）内に追加したIDのキーがtru担っていたら追加しました */}
                    <div className="flex justify-end mt-2 mb-4">
                        {isAddingRecipe[officialRecipe.id] ? (
                            <div className="flex items-center gap-1 bg-secondary-500 rounded-md px-4 py-2">
                                <Check className="h-4 w-4 text-white-500" />
                                <span className=" text-sm">追加しました</span>
                            </div>
                        ) : (
                        <button onClick={() => createRecipe({
                            title:officialRecipe.title || "", 
                            source:officialRecipe.url || "",
                            category:officialRecipe.category || "",
                            id:officialRecipe.id || undefined
                            })}
                            className="flex items-center gap-1 bg-green-400 text-white px-4 py-2 rounded-md"
                            >
                            <div className="flex items-center gap-1">
                                <Plus className="h-4 w-4 text-white-500" />
                                    <span className="text-white text-sm">Myレシピに追加</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};