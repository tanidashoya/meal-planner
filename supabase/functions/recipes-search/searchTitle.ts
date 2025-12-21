import { createClient } from "@supabase/supabase-js";
import { SearchRecipeResult } from "../../../src/modules/aiChoice/aichoice.entity.ts";

type SearchResults = {
  data: SearchRecipeResult[];
  error: Error | null;
};

//レシピタイトル(title_original)と正規化後のレシピタイトル（title_core）で検索する関数
//asyncの返り値はPromiseなのでPromise<SearchResults>のようにPromise型で返す(非同期関数は必ずPromise型で返すため)
export async function searchTitle(
  supabase: ReturnType<typeof createClient>,
  normalizedQuery: string,
  query: string,
  MAX_RESULTS: number
): Promise<SearchResults> {
  // 正規化後が2文字以下の場合は意味のない検索になるためスキップ
  // 例：「生姜焼き」→「き」（1文字）で検索すると「き」を含む全レシピがヒットしてしまう
  const MIN_NORMALIZED_LENGTH = 3; //正規化後のタイトルが3文字以上の場合に検索する
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
    query.length > 0 //ユーザーの入力がある場合はオリジナルのtitle_originalで検索
      ? await supabase
          .from("all_recipes")
          .select("id, title_original,title_core, url,category") //指定したカラムだけをもつオブジェクトを配列で返す
          .ilike("title_original", `%${query}%`)
          .limit(MAX_RESULTS)
      : { data: [], error: null };

  //core検索またはオリジナルのtitle_originalで検索でエラーが発生したらエラーを返す
  //coreErrorまたはoriginalErrorがnullではない場合(エラーオブジェクトが存在する場合)は空の配列とエラーオブジェクトを返す
  const error = coreError || originalError;
  if (error) {
    return { data: [], error: error };
  }

  return { data: [...coreResults, ...originalResults], error: null }; //core検索とオリジナルのtitle_originalで検索の結果をマージして返す
}
