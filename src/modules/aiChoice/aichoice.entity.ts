import {Database} from "../../../database.types"

//choicePicksはofficial_recipesテーブルのRow型
export type aiChoice = Database["public"]["Tables"]["official_recipes"]["Row"]
