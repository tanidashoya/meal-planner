import { createClient } from "@supabase/supabase-js";

export async function searchTitle(
  supabase: ReturnType<typeof createClient>,
  normalizedQuery: string,
  query: string,
  MAX_RESULTS: number
) {
  // 正規化後が2文字以下の場合は意味のない検索になるためスキップ
  // 例：「生姜焼き」→「き」（1文字）で検索すると「き」を含む全レシピがヒットしてしまう
  const MIN_NORMALIZED_LENGTH = 3;
  const { data: coreResults, error: coreError } =
    normalizedQuery.length >= MIN_NORMALIZED_LENGTH
      ? await supabase
          .from("all_recipes")
          .select("id, title_original,title_core, url,category")
          .ilike("title_core", `%${normalizedQuery}%`)
          .limit(MAX_RESULTS)
      : { data: [], error: null };

  // core検索だけで十分ヒットしたら終了
  if ((coreResults?.length ?? 0) >= MAX_RESULTS) {
    return { data: coreResults, error: null };
  }

  // 2. オリジナルのtitle_originalで検索（漢字・カタカナ検索）
  const { data: originalResults, error: originalError } =
    query.length > 0
      ? await supabase
          .from("all_recipes")
          .select("id, title_original,title_core, url,category")
          .ilike("title_original", `%${query}%`)
          .limit(MAX_RESULTS)
      : { data: [], error: null };

  //core検索またはオリジナルのtitle_originalで検索でエラーが発生したらエラーを返す
  const error = coreError || originalError;
  if (error) {
    return { data: [], error: error };
  }

  return { data: [...coreResults, ...originalResults], error: null };
}
