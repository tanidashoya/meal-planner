import {Database} from "../../../database.types"

//choicePicksはofficial_recipesテーブルのRow型
export type choicePicks = Database["public"]["Tables"]["official_recipes"]["Row"]

//dailyPicksはdaily_official_picksテーブルのRow型
export type dailyPicks = Database["public"]["Tables"]["daily_official_picks"]["Row"]

//dailyPicksItemsはdaily_official_pick_itemsテーブルのRow型
export type dailyPicksItems = Database["public"]["Tables"]["daily_official_pick_items"]["Row"]