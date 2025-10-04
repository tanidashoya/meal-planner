import {supabase} from "../../lib/supabase"
import {choicePicks,dailyPicks} from "./picks.entity"

export const picksRepository = {

    //official_recipesテーブルからランダムに5件取得
    //オブジェクトのリネームをしている： const {data:picks,error} = await supabase
    async randomPick() {
        const { data: picks, error } = await supabase
        .rpc("pick_random_recipes", { limit_count: 5 });
      
        if (error || !picks) throw new Error(error?.message);
        return picks;
      },
      

    //今の日付を取得してdaily_official_picksテーブルに保存。そのデータをdailyに格納して返す
    async dateCreate(){
        //日本時間で今日の日付を取得
        const todayJst = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
        //daily_official_picksテーブルに保存
        const {data:daily,error} = await supabase
            .from("daily_official_picks")
            .insert({pick_date:todayJst})
            .select()
            .single()
        if(error !== null || daily == null) 
            throw new Error(error?.message)
        return daily
    },


    //resipe.entity.tsのように新しいファイルを作って型を定義してから作成をはじめよう
    async picksSave(daily:dailyPicks,picks:choicePicks[]){
        const {data:dailyPicks,error} = await supabase
            .from("daily_official_pick_items")
            .insert(picks.map(pick => ({
                daily_id: daily.id,
                recipe_id: pick.id,
                category: pick.category,
                title: pick.title,
                url: pick.url
            })))
            .select()
        if(error !== null || dailyPicks == null) 
            throw new Error(error?.message)
        return dailyPicks
    }

}