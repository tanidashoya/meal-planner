import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import { useAiChoiceStore } from "../modules/aiChoice/ai-choice.state";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { RecipeParams } from "../modules/recipes/recipe.entity"
import { AiResult } from "../components/AIChoice/AiResult";
import { AiInput } from "../components/AIChoice/AiInput";

export const MatchRecipe = () => {

    // const [searchText, setSearchText] = useState("");
    const [mode, setMode] = useState<"free" | "strict">("free");
    const {currentUser} = useCurrentUserStore();
    const recipeStore = useRecipeStore();
    //追加したレシピかの判定に使う
    const [isAddingRecipe, setIsAddingRecipe] = useState<{ [id: number]: boolean }>({});
    const aiChoiceStore = useAiChoiceStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // setSearchText(e.target.value);
        aiChoiceStore.setAiWord(e.target.value);
    }
    
    const handleSimilarRecipes = async (text: string) => {
        aiChoiceStore.setAiSearchLoading(true);
        aiChoiceStore.setHasSearched(false);
        aiChoiceStore.set([]);
        const {data,error} = await supabase.functions.invoke("search-similar-recipes", {body: {text}});
        if(error) {
            console.error("AIレシピ探索に失敗", error.message);
            toast.error("AIレシピ探索に失敗");
        }else{
            toast.success("AIによるレシピ探索が完了");
        }
        aiChoiceStore.set(data);
        console.log(data);
        // setData(data);
        aiChoiceStore.setHasSearched(true);
        aiChoiceStore.setAiSearchLoading(false);
        return data;
    }

    const handleSimilarRecipesFree = async (text: string) => {
        aiChoiceStore.setAiSearchLoading(true);
        aiChoiceStore.setHasSearched(false);
        aiChoiceStore.set([]);
        const {data,error} = await supabase.functions.invoke("search-similar-recipes-free", {body: {text}});
        if(error) {
            console.error("AIレシピ探索に失敗", error.message);
            toast.error("AIレシピ探索に失敗");
        }else{
            toast.success("AIによるレシピ探索が完了");
        }
        aiChoiceStore.set(data);
        aiChoiceStore.setHasSearched(true);
        aiChoiceStore.setAiSearchLoading(false);
        return;
    }

    const handleClick = () => {
        if (!aiChoiceStore.aiWord) {
            toast.warn("検索ワードを入力してください");
            return;
        }
        if(mode === "free") {
            handleSimilarRecipesFree(aiChoiceStore.aiWord);
        }else if(mode === "strict"){    
            handleSimilarRecipes(aiChoiceStore.aiWord);
        }
    }

    const addRecipeToMyRecipe = async(params:RecipeParams) => {
        //idがnullやundefinedの場合は早期return
        if (!params.id) {
            toast.error("レシピIDが見つかりません");
            return;
        }
        if (!currentUser) {
            toast.error("ユーザーが正しく認証されていません");
            return;
        }
        //isAddingRecipeのidをキーにしてtrueにする
        //追加しましたの判断で使う
        setIsAddingRecipe({ ...isAddingRecipe, [params.id]: true })
        try{
            const recipes = await recipeRepository.create(currentUser.id,params)
            recipeStore.set([recipes])
            toast.success("レシピの追加に成功しました")
        }catch(error){
            // エラー時のローディング状態（setIsAddingRecipe）をリセット（必須）
            setIsAddingRecipe(prev => {
                const newState = { ...prev };
                delete newState[params.id]; // このレシピIDのキーを削除
                return newState;
            });
            
            // Errorオブジェクトからメッセージを抽出してトースト表示
            // error instanceof Error は、error が Error オブジェクトかどうかをチェックする
            const message = error instanceof Error ? error.message : "不明なエラーが発生しました";
            toast.error(message);
        }
    }


    return (
        <div className="flex flex-col items-center justify-center px-4 mb-24 mt-14 ">
            <AiInput 
                mode={mode} 
                setMode={setMode} 
                handleChange={handleChange} 
                aiWord={aiChoiceStore.aiWord} 
                handleClick={handleClick}
            />
            <AiResult 
                aiChoice={aiChoiceStore.aiChoice} 
                isAddingRecipe={isAddingRecipe} 
                addRecipeToMyRecipe={addRecipeToMyRecipe} 
                hasSearched={aiChoiceStore.HasSearched} 
                isLoading={aiChoiceStore.aiSearchLoading} 
            />
        </div>
    )
}