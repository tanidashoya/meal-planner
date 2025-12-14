import { Database } from "../../../database.types";

//choicePicksはofficial_recipesテーブルのRow型
export type aiChoice = Database["public"]["Tables"]["official_recipes"]["Row"];

// 検索結果用の型（all_recipesテーブルから取得）
export type SearchRecipeResult = {
  id: number | string;
  title?: string | null;
  title_original?: string | null;
  title_core?: string | null;
  url?: string | null;
  category?: string | null;
};
