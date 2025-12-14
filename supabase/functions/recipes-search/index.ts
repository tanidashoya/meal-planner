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

const MAX_RESULTS = 15;

type SearchResults = {
  data: { id: string; content: string; url: string }[];
  error: Error | null;
};

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
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "queryが必要です" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 正規化前後の値を確認
    const normalizedQuery = normalize(query);
    const { data: titleResults, error: titleError } = (await searchTitle(
      supabase,
      normalizedQuery,
      query,
      MAX_RESULTS
    )) as SearchResults;

    const { data: ingredientResults, error: ingredientError } =
      (await searchIngredients(
        supabase,
        normalizedQuery,
        query,
        MAX_RESULTS
      )) as unknown as SearchResults;

    const error = titleError || ingredientError;
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 結果をマージして重複を除去（idで判定）
    const seenIds = new Set<string>();
    const mergedResults = [];
    for (const item of [
      ...(titleResults || []),
      ...(ingredientResults || []),
    ]) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        mergedResults.push(item);
      }
    }
    // 最大MAX_RESULTS件に制限
    const data = mergedResults.slice(0, MAX_RESULTS);

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
