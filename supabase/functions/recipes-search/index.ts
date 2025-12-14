// supabase/functions/recipes-search/index.ts
import { createClient } from "@supabase/supabase-js";

// --- 共通CORS設定 ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

function normalize(text: string): string {
  return (
    text
      .toLowerCase()
      // 全角英数字 → 半角英数字
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      )
      // 全角カタカナ → ひらがな（ァ-ヶ: U+30A1-U+30F6）
      .replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60))
      // 長音記号「ー」→ ひらがなの「ー」として保持（または削除せず残す）
      .replace(/ー/g, "ー")
      // ひらがな、長音記号、英数字以外を削除
      .replace(/[^ぁ-んa-z0-9ー]/g, "")
      .trim()
  );
}

const MAX_RESULTS = 15;

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
    // 1. 正規化済みのtitle_coreで検索（ひらがな・英数字検索）
    // ※ 正規化後が空文字の場合は全件ヒットを防ぐためスキップ
    //正規化後の文字列が空になったとき三項演算子がないと全件ヒットしてしまうので
    //正規化後の文字列が空なら空配列を返すようにしている
    //元の文章（query）ではバリデーションではじかれるのでOK
    const { data: coreResults, error: coreError } =
      normalizedQuery.length > 0
        ? await supabase
            .from("all_recipes")
            .select("id, title_original, url")
            .ilike("title_core", `%${normalizedQuery}%`)
            .limit(MAX_RESULTS)
        : { data: [], error: null };

    // core検索だけで十分ヒットしたら終了
    if ((coreResults?.length ?? 0) >= MAX_RESULTS) {
      return new Response(JSON.stringify(coreResults), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. オリジナルのtitle_originalで検索（漢字・カタカナ検索）
    const { data: originalResults, error: originalError } = await supabase
      .from("all_recipes")
      .select("id, title_original, url")
      .ilike("title_original", `%${query}%`)
      .limit(MAX_RESULTS);

    const error = coreError || originalError;
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. 結果をマージして重複を除去（idで判定）
    const seenIds = new Set<string>();
    const mergedResults = [];
    for (const item of [...(coreResults || []), ...(originalResults || [])]) {
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
