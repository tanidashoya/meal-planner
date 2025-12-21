// 検索結果用の型（all_recipesテーブルから取得）
export type SearchRecipeResult = {
  id: number;
  title_original: string | null;
  title_core: string | null;
  url: string | null;
  category: string | null;
};
