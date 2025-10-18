import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import { useAiChoiceStore } from "../components/AIChoice/ai-choice.state";
import { useAiWordStore } from "../components/AIChoice/ai-word.state";
import { ImageOgp } from "../components/ImageOgp";
import {motion} from "framer-motion";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { RecipeParams } from "../modules/recipes/recipe.entity"
import { Check } from "lucide-react";
import { Plus } from "lucide-react";
import ArrowRight from "../assets/arrow_right.png";

export const MatchRecipe = () => {

    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [mode, setMode] = useState<"free" | "strict">("free");
    const aiChoiceStore = useAiChoiceStore();
    const aiWordStore = useAiWordStore();
    const {currentUser} = useCurrentUserStore();
    const recipeStore = useRecipeStore();
    //追加したレシピかの判定に使う
    const [isAddingRecipe, setIsAddingRecipe] = useState<{ [id: number]: boolean }>({});
    //初期画面を判別
    const [hasSearched, setHasSearched] = useState(false);
    //レシピロード画面の制御に使う
    const [isLoading, setIsLoading] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        aiWordStore.set(e.target.value);
    }
    

    const handleSimilarRecipes = async (text: string) => {
        setIsLoading(true);
        setHasSearched(false);
        aiChoiceStore.set([]);
        const {data,error} = await supabase.functions.invoke("search-similar-recipes", {body: {text}});
        if(error) {
            console.error("Embedding creation error:", error);
            toast.error("AIレシピ提案に失敗しました");
        }else{
            toast.success("AIレシピ提案に成功しました");
        }
        aiChoiceStore.set(data);
        console.log(data);
        setData(data);
        setHasSearched(true);
        setIsLoading(false);
        return data;
    }

    const handleSimilarRecipesFree = async (text: string) => {
        setIsLoading(true);
        setHasSearched(false);
        aiChoiceStore.set([]);
        const {data,error} = await supabase.functions.invoke("search-similar-recipes-free", {body: {text}});
        if(error) {
            console.error("Embedding creation error:", error);
            toast.error(error.message);
        }else{
            toast.success("こちらのレシピが見つかりました");
        }
        aiChoiceStore.set(data);
        setData(data);
        setHasSearched(true);
        setIsLoading(false);
        return;
    }

    const handleClick = () => {
        if(mode === "free") {
            handleSimilarRecipesFree(searchText);
        }else if(mode === "strict"){    
            handleSimilarRecipes(searchText);
        }
    }

    const addRecipeToFavorite = async(params:RecipeParams) => {
        //idがnullの場合は早期return
        if (!params.id) return
        if (!currentUser) return;
        //isAddingRecipeのidをキーにしてtrueにする
        //追加しましたの判断で使う
        setIsAddingRecipe({ ...isAddingRecipe, [params.id]: true })
        try{
            const recipes = await recipeRepository.create(currentUser.id,params)
            recipeStore.set([recipes])
            toast.success("レシピの追加に成功しました")
        }catch(error){
            // Errorオブジェクトからメッセージを抽出してトースト表示
            // error instanceof Error は、error が Error オブジェクトかどうかをチェックする
            const message = error instanceof Error ? error.message : "不明なエラーが発生しました";
            toast.error(message);
        }
    }


    return (
        <div className="flex flex-col items-center justify-center px-4 mb-24 mt-10 ">
            <h2 className="text-2xl font-bold mb-6">AIによるレシピ探索</h2>
            <div className="border py-6 px-3 rounded-md shadow-md">
                <input type="text" 
                    className="mb-6 w-full md:w-2/5 p-2 rounded-md border-2 border-gray-300  
                            focus:!outline-none 
                            focus-visible:!outline-none 
                            focus:!ring-1 
                            focus-visible:!ring-1 
                            focus:!ring-blue-500 
                            focus-visible:!ring-blue-500" 
                    placeholder="食べたいご飯を教えてください" 
                    value={aiWordStore.aiWord} 
                    onChange={handleChange} 
                />
                {/* relative → 子要素である「背景スライダー」を絶対位置で配置できるようにする。
                    inline-flex → 内側に横並びのボタン2つを配置。
                    rounded-full → 全体を丸く。
                    border border-gray-300 bg-white → 枠線と白背景。
                    overflow-hidden → スライダーの角がはみ出さないようにする。⇒子要素がはみ出たら非表示になる 
                    max-w-xs:要素の最大幅を制限する xs(20rem = 320px)*/}
                <div className="relative inline-flex w-full max-w-xs rounded-full border border-gray-300 bg-white overflow-hidden">
                    {/* 背景スライダー */}
                    {/* 「装飾専用（表示目的のみ）」の div */}
                    {/* 選択中のボタンがグレーになる */}
                    {/* transition-property: transform;： 「transform（＝位置・回転・拡大などの変化）をなめらかにアニメーションする」という設定。*/}
                    {/* durationはアニメーションの時間を指定する。300ms = 0.3秒 */}
                    {/* 状態がstrictの場合は右に移動（"translate-x-full"）し、freeの場合は左に移動する */}
                    {/* translate-x-full:要素自身の幅の 100% 移動 */}
                    <div
                        className={`absolute top-0 left-0 h-full w-1/2 bg-gray-500 rounded-full transition-transform duration-300 ${
                        mode === "strict" ? "translate-x-full" : "translate-x-0"
                        }`}
                    ></div>

                    {/* ボタン2つ */}
                    <button
                        onClick={() => setMode("free")}
                        className={`relative w-1/2 z-10 py-2 text-sm font-medium
                        focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 focus:!ring-0 focus:!ring-offset-0
                        ${mode === "free" ? "text-white" : "text-gray-600"}`}
                        >
                        自由モード
                    </button>

                    <button
                        onClick={() => setMode("strict")}
                        className={`relative w-1/2 z-10 py-2 text-sm font-medium
                        focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 focus:!ring-0 focus:!ring-offset-0
                        ${mode === "strict" ? "text-white" : "text-gray-600"}`}
                    >
                        精密モード
                    </button>
                </div>

                <div className="flex flex-row w-full justify-between mt-2">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-sm text-blue-500 font-bold">抽象的な検索に強い</span>
                        <span className="text-sm text-gray-500">例：あっさりご飯</span>
                        <span className="text-sm text-gray-500">〇〇に合う副菜</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-sm text-gray-500 text-2xl">⇔</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-sm text-red-500 font-bold">厳密な検索に強い</span>
                        <span className="text-sm text-gray-500">例：「料理名」</span>
                        <span className="text-sm text-gray-500">「材料」を使うレシピ</span>
                    </div>
                </div>
                <div className="flex flex-row gap-4 mt-6 w-full">
                    <button onClick={() => handleClick()} className="w-3/5 mx-auto bg-green-500 text-white px-4 py-2 rounded-md  shadow-md">
                        探索を開始する
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
                {Array.isArray(aiChoiceStore.aiChoice) && aiChoiceStore.aiChoice.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 10 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-sm text-gray-500 text-center font-bold text-xl mt-8 mb-6">こんなレシピはどう？(全{aiChoiceStore.aiChoice.length}件)</p>
                    {aiChoiceStore.aiChoice.map((recipe: any, index: number) => (
                        <div key={recipe.id}>
                            <motion.a
                                
                                href={recipe.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, filter: "blur(8px)" }} // 最初は完全に透明＋ぼかし
                                animate={{ opacity: [0, 0.5, 1], filter: ["blur(8px)", "blur(2px)", "blur(0px)"] }} // 徐々にクリアに
                                transition={{
                                delay: index * 0.30, // 1つずつ少し遅れて出る
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1], // ゆっくり自然なカーブ
                                }}
                                className="block"
                            >
                                <div className="flex flex-row mb-1">
                                    <span className="text-sm text-gray-700 truncate">{index + 1}．{recipe.title}</span>
                                </div>
                                
                                <div className="flex flex-row gap-2 border p-2 rounded-md justify-center items-center">
                                    <ImageOgp url={recipe.url} className="w-37" />
                                    <div className="flex flex-1 flex-col gap-1 w-1/2">
                                        <span className="text-sm bleak-all text-gray-500">{recipe.title}</span>
                                        <span className="text-sm truncate text-blue-500 font-medium">
                                            {recipe.url}
                                        </span>
                                    </div>
                                </div>

                            </motion.a>
                            <motion.div     
                                initial={{ opacity: 0, filter: "blur(8px)" }} // 最初は完全に透明＋ぼかし
                                animate={{ opacity: [0, 0.5, 1], filter: ["blur(8px)", "blur(2px)", "blur(0px)"] }} // 徐々にクリアに
                                transition={{
                                delay: index * 0.30, // 1つずつ少し遅れて出る
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1], // ゆっくり自然なカーブ
                                }}
                                className="flex justify-end mt-2 mb-4"
                            >
                                {isAddingRecipe[recipe.id] ? (
                                    <div className="flex items-center gap-1 bg-secondary-500 rounded-md px-4 py-2">
                                        <Check className="h-4 w-4 text-white-500" />
                                        <span className=" text-sm">追加しました</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <img src={ArrowRight} alt="arrow-right" className="w-6 h-6 mr-2" />
                                        <button onClick={() => addRecipeToFavorite({
                                            title:recipe.title || "", 
                                            source:recipe.url || "",
                                            category:recipe.category || "",
                                            id:recipe.id || undefined
                                            })}
                                            className="flex items-center gap-1 bg-green-400 text-white px-1 py-2 mr-4 rounded-md"
                                            >
                                            <div className="flex items-center gap-1">
                                                <Plus className="h-4 w-4 text-white-500" />
                                                    <span className="text-white text-sm">Myレシピに追加</span>
                                            </div>
                                        </button>
                                    </div>
                                    )}
                            </motion.div>
                        </div>
                    ))}
                </motion.div>
                ) : (
                    hasSearched ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-sm text-gray-500 text-center font-bold text-xl mt-8 mb-6">レシピが見つかりませんでした</p>
                    </motion.div>
                    ) : (
                        isLoading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="animate-pulse text-sm text-gray-500 text-center font-bold text-xl mt-8 mb-2">AIが探索中...</p>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </motion.div>
                    ))
                )}

            </div>
        </div>
    )
}