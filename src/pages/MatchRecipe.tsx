import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

export const MatchRecipe = () => {

    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [mode, setMode] = useState<"free" | "strict">("free");


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }
    

    const handleSimilarRecipes = async (text: string) => {
        const {data,error} = await supabase.functions.invoke("search-similar-recipes", {body: {text}});
        if(error) {
            console.error("Embedding creation error:", error);
            toast.error("AIレシピ提案に失敗しました");
        }else{
            toast.success("AIレシピ提案に成功しました");
        }
        console.log(data);
        setData(data);
        return data;
    }

    const handleSimilarRecipesFree = async (text: string) => {
        const {data,error} = await supabase.functions.invoke("search-similar-recipes-free", {body: {text}});
        if(error) {
            console.error("Embedding creation error:", error);
            toast.error("AIレシピ提案に失敗しました");
        }else{
            toast.success("AIレシピ提案に成功しました");
        }
        console.log(data);
        setData(data);
        return data;
    }

    const handleClick = () => {
        if(mode === "free") {
            handleSimilarRecipesFree(searchText);
        }else if(mode === "strict"){
            handleSimilarRecipes(searchText);
        }
    }





    return (
        <div className="flex flex-col items-center justify-center px-8 mb-24 mt-12 ">
            <h2 className="text-2xl font-bold">AIによるレシピ探索</h2>
            <input type="text" className="mt-12 mb-6 w-full md:w-2/5 p-2 rounded-md border-2 border-gray-300" placeholder="食べたいご飯を教えてください" value={searchText} onChange={handleChange} />
            <div className="relative inline-flex w-full max-w-xs rounded-full border border-gray-300 bg-white overflow-hidden">
                {/* 背景スライダー */}
                <div
                    className={`absolute top-0 left-0 h-full w-1/2 bg-gray-500 rounded-full transition-transform duration-300 ${
                    mode === "strict" ? "translate-x-full" : "translate-x-0"
                    }`}
                ></div>

                {/* ボタン2つ */}
                <button
                    onClick={() => setMode("free")}
                    className={`relative w-1/2 z-10 py-2 text-sm font-medium transition-colors duration-300 
                    focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 focus:!ring-0 focus:!ring-offset-0
                    ${mode === "free" ? "text-white" : "text-gray-600"}`}
                    >
                    自由モード
                </button>

                <button
                    onClick={() => setMode("strict")}
                    className={`relative w-1/2 z-10 py-2 text-sm font-medium transition-colors duration-300 
                    focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 focus:!ring-0 focus:!ring-offset-0
                    ${mode === "strict" ? "text-white" : "text-gray-600"}`}
                >
                    精密モード
                </button>
            </div>

            <div className="flex flex-row gap-4 my-12">
                <button onClick={() => handleClick()} className="bg-green-500 text-white px-4 py-2 rounded-md">
                    探索を開始する
                </button>
            </div>
            <div>
                {data.map((recipe: any) => (
                    <div key={recipe.id}>
                        <h3>{recipe.title}</h3>
                        <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                            {recipe.url}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}