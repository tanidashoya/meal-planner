import {supabase} from "../../lib/supabase"

export const picksRepository = {

    //最新の日付IDを取得
    //オブジェクトのリネームをしている
    //ascending:falseは降順
    //select("id")をしているから返ってくるのは{id:1}のようなオブジェクト
    //.limit(1):SQLの実行して1つのレコードを取得
    //.single():SQLの実行結果の中から1つのレコードを返す
    async fetchNewDateID() {
        const {data:lateseIdDate,error:idError} = await supabase
            .from("daily_official_picks")
            .select("id")
            .order("id",{ascending:false})
            .limit(1)
            .single()
            if(idError) {
                throw new Error("Error fetching latest date ID:", idError)
            }
            return lateseIdDate
    },


    //最新の日付IDに紐づく公式レシピを取得
    async fetchOfficialRecipes(dailyId:number) {
        const {data:officialRecipes,error:recipesError} = await supabase
            .from("daily_official_pick_items")
            .select("*")
            .eq("daily_id",dailyId)
            if(recipesError) {
                throw new Error("Error fetching official recipes:", recipesError)
            }
            return officialRecipes
    }
} 