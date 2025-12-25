// supabase/functions/recipes-search/index.ts
import { createClient } from "@supabase/supabase-js";
import { normalize } from "./normalize.ts";
import { searchTitle } from "./searchTitle.ts";
import { searchIngredients } from "./searchIngredients.ts";

// --- 共通CORS設定 ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

const MAX_RESULTS = 100;

Deno.serve(async (req) => {
  // OPTIONSリクエスト（プリフライト）は最初に処理
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Supabase接続 ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("環境変数が設定されていません");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- 認証チェック（JWT署名検証） ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "無効なトークンです" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    //フロントエンド側から送信するキー名と合わせる必要がある
    //queryキーの値textは検索ワード
    //フロントエンド
    // const { data, error } = await supabase.functions.invoke("recipes-search", {
    //   body: { query: text },
    // });
    //
    //分割代入でqueryとaliasQueryを取得（aliasQueryはフロントでエイリアス正規化済み）
    const { query, aliasQuery } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "queryが必要です" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 材料検索用のクエリ（エイリアス正規化済みがあればそれを使う）
    const ingredientQuery = aliasQuery || query;
    const normalizedQuery = normalize(query);
    const normalizedIngredientQuery = normalize(ingredientQuery);

    // タイトル検索は元のqueryを使用
    const { data: titleResults, error: titleError } = await searchTitle(
      supabase,
      normalizedQuery,
      query,
      MAX_RESULTS
    );

    // 材料検索はエイリアス正規化後のqueryを使用（複数語の場合はAND検索）
    const { data: ingredientResults, error: ingredientError } =
      await searchIngredients(
        supabase,
        normalizedIngredientQuery,
        ingredientQuery,
        MAX_RESULTS,
        "and" // 常にAND検索を使用
      );

    const error = titleError || ingredientError;
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 材料検索を優先：材料検索の結果をそのまま返す（0件でもタイトル検索にフォールバックしない）
    // タイトル検索は材料検索が実行できない場合（エイリアスがない等）のみ使用
    const data = (ingredientResults || []).slice(0, MAX_RESULTS);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // 全てのエラーをキャッチしてCORSヘッダー付きで返す
    const message = err instanceof Error ? err.message : "不明なエラー";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
