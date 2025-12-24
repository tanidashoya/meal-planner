//ユーザー入力（自由文）→材料っぽい単語を分割→
// ingredients テーブルで候補の材料IDを拾う →
// recipe_ingredients（中間テーブル）でレシピIDに引き直す →
// all_recipes からレシピ情報を返す
// supabase/functions/recipes-search/searchIngredients.ts
import { createClient } from "@supabase/supabase-js";
import { normalize } from "./normalize.ts";

type Recipe = {
  id: string;
  title_original: string;
  title_core: string;
  url: string | null;
  category: string | null;
};

type Result<T> = { data: T[]; error: Error | null };

//ユーザー入力（自由文）→材料っぽい単語を分割
const splitTokens = (raw: string) =>
  raw
    .split(/[\s\u3000,、・+＋/／]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

//配列から重複を削除
const uniq = <T>(arr: T[]) => [...new Set(arr)];

//2つのセットの共通要素を返す
const intersectSets = (a: Set<string>, b: Set<string>) => {
  const out = new Set<string>();
  for (const x of a) if (b.has(x)) out.add(x);
  return out;
};

async function findIngredientIdsForToken(
  supabase: ReturnType<typeof createClient>,
  rawToken: string,
  normToken: string,
  limit: number
): Promise<Result<string>> {
  const raw = rawToken.trim();
  const norm = normToken.trim();

  const clauses: string[] = [];

  // AND検索では本当は eq が理想だが、ユーザー入力の揺れを拾うためにまずは ilike で候補集合を作る
  // 正規化後が1文字以下の場合は意味のない検索になるためスキップ
  const MIN_NORMALIZED_LENGTH = 2;
  if (norm && norm.length >= MIN_NORMALIZED_LENGTH) {
    clauses.push(`name_core.ilike.%${norm}%`);
    clauses.push(`name_kana.ilike.%${norm}%`);
  }
  if (raw) {
    clauses.push(`name_original.ilike.%${raw}%`);
  }

  if (clauses.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("ingredients")
    .select("id")
    .or(clauses.join(","))
    .limit(limit);

  if (error) return { data: [], error: new Error(error.message) };

  const ids = (data ?? []).map((r: { id: string }) => r.id);
  return { data: uniq(ids), error: null };
}

async function recipeIdsByIngredientIds(
  supabase: ReturnType<typeof createClient>,
  ingredientIds: string[],
  limit: number
): Promise<Result<Set<string>>> {
  if (ingredientIds.length === 0) return { data: [new Set()], error: null };

  const { data, error } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id")
    .in("ingredient_id", ingredientIds)
    .limit(limit);

  if (error) return { data: [], error: new Error(error.message) };

  const s = new Set<string>();
  for (const r of data ?? []) s.add((r as { recipe_id: string }).recipe_id);
  return { data: [s], error: null };
}

export async function searchIngredients(
  supabase: ReturnType<typeof createClient>,
  normalizedQuery: string, // 互換のため残す（実際は query を分割して個別 normalize する）
  query: string,
  MAX_RESULTS: number,
  mode: "auto" | "or" | "and" = "auto"
): Promise<Result<Recipe>> {
  try {
    const rawTokens = splitTokens(query);
    if (rawTokens.length === 0) return { data: [], error: null };

    const normTokens = rawTokens.map((t) => normalize(t)).map((t) => t.trim());

    const resolvedMode =
      mode !== "auto" ? mode : rawTokens.length >= 2 ? "and" : "or";

    const ING_LIMIT = Math.max(30, MAX_RESULTS * 10); // 材料候補（1トークンあたり）
    const RI_LIMIT = Math.max(500, MAX_RESULTS * 200); // 中間テーブル行数（1トークンあたり）
    const RECIPE_LIMIT = MAX_RESULTS;

    if (resolvedMode === "or") {
      const raw = rawTokens[0];
      const norm = normTokens[0] || normalizedQuery || normalize(query);

      const ing = await findIngredientIdsForToken(
        supabase,
        raw,
        norm,
        ING_LIMIT
      );
      if (ing.error) return { data: [], error: ing.error };
      if (ing.data.length === 0) return { data: [], error: null };

      const ri = await recipeIdsByIngredientIds(supabase, ing.data, RI_LIMIT);
      if (ri.error) return { data: [], error: ri.error };

      const recipeIds = [...ri.data[0]];
      if (recipeIds.length === 0) return { data: [], error: null };

      const { data: recipes, error } = await supabase
        .from("all_recipes")
        .select("id, title_original,title_core, url,category")
        .in("id", recipeIds)
        .limit(RECIPE_LIMIT);

      if (error) return { data: [], error: new Error(error.message) };
      return { data: (recipes ?? []) as Recipe[], error: null };
    }

    // AND検索（複数トークン）
    let current: Set<string> | null = null;

    for (let i = 0; i < rawTokens.length; i++) {
      const raw = rawTokens[i];
      const norm = normTokens[i];

      const ing = await findIngredientIdsForToken(
        supabase,
        raw,
        norm,
        ING_LIMIT
      );
      if (ing.error) return { data: [], error: ing.error };
      if (ing.data.length === 0) return { data: [], error: null };

      const ri = await recipeIdsByIngredientIds(supabase, ing.data, RI_LIMIT);
      if (ri.error) return { data: [], error: ri.error };

      const setForToken = ri.data[0];
      if (current === null) current = setForToken;
      else current = intersectSets(current, setForToken);

      if (current.size === 0) return { data: [], error: null };
    }

    const matchedRecipeIds = [...(current ?? new Set<string>())];
    if (matchedRecipeIds.length === 0) return { data: [], error: null };

    const { data: recipes, error } = await supabase
      .from("all_recipes")
      .select("id, title_original,title_core, url,category")
      .in("id", matchedRecipeIds)
      .limit(RECIPE_LIMIT);

    if (error) return { data: [], error: new Error(error.message) };
    return { data: (recipes ?? []) as Recipe[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e : new Error("unknown error"),
    };
  }
}
