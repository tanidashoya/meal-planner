import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
// --- Supabase接続 ---
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
// --- 認証検証用クライアント（ANON_KEY使用） ---
const supabaseAuth = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_ANON_KEY")
);
// --- OpenAI接続 ---
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});
// --- 共通CORS設定 ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};
// --- メイン処理 ---
Deno.serve(async (req) => {
  // --- CORSプリフライト対応 ---
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // --- 認証チェック（JWT署名検証） ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "無効なトークンです" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // --- ① ユーザー入力受け取り ---
    const { query } = await req.json();
    if (!query) throw new Error("クエリが指定されていません。");
    console.log("🧠 入力クエリ:", query);
    // --- ② 安全判定 ---
    const safetyPrompt = `
次の文章が料理レシピ検索や食事関連の意図を持っているか判定してください。
- 料理、食材、食事、味、調理、献立、副菜、もう一品などに関連していれば VALID。
- それ以外や不適切な内容は INVALID。
返答は VALID または INVALID のみ。

入力文: "${query}"
`;
    const safetyRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: safetyPrompt,
        },
      ],
    });
    const safety = safetyRes.choices[0]?.message?.content?.trim();
    console.log("🛡️ 安全判定結果:", safety);
    if (safety !== "VALID") {
      return new Response(JSON.stringify([]), {
        headers: {
          ...corsHeaders,
          "X-Reason": "invalid-input",
          "Content-Type": "application/json",
        },
      });
    }
    // --- ③ クエリリライト ---
    const rewritePrompt = `
次の文を料理レシピ検索用に最適化してください。

【入力文】
${query}

# ルール
1. 「◯◯に合う副菜」などでは、◯◯は主菜です。検索対象に含めず、「◯◯に合わせやすい副菜や小鉢を探しています」に変換。
2. 主菜の作り方を尋ねている場合（「◯◯の作り方」など）はそのまま保持。
3. 出力は自然な1文で。余計な記号や引用符は不要。
`;
    const rewriteRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `あなたは料理検索クエリを最適化する専門家です。
ユーザーの意図を読み取り、検索対象を正確に絞り込みます。

# 基本方針
- 「◯◯の作り方」「◯◯レシピ」「◯◯を作りたい」など、主菜自体を探している場合はそのまま保持。
- 「◯◯に合う副菜」「◯◯にもう一品」「◯◯に合わせる料理」など、主菜が条件のときは主菜を検索対象に含めず、
  「◯◯などの主菜に合わせやすい副菜や小鉢を探しています」といった説明文に変換する。
- 主菜を条件として使うときは、「唐揚げ」「カレー」などの語を1回だけ説明目的で残してよい。
- 異なる表記（漢字・カタカナ・ひらがな）を自然な形で含める。
- 出力は自然な1文で。
`,
        },
        {
          role: "user",
          content: rewritePrompt,
        },
      ],
      temperature: 0.2,
    });
    const rewrittenQuery = rewriteRes.choices[0]?.message?.content?.trim();
    console.log("✏️ リライト結果:", rewrittenQuery);
    // --- ④ Embedding生成 ---
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: rewrittenQuery ?? "",
    });
    const embedding = embeddingRes.data[0].embedding;
    console.log("✅ Embedding生成完了:", embedding.length, "次元");
    // --- ⑤ Supabase RPCで類似検索 ---
    const threshold = 0.65;
    const matchCount = 50;
    const { data: matches, error } = await supabase.rpc(
      "match_rakuten_recipes",
      {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: matchCount,
      }
    );
    if (error) throw error;
    if (!matches?.length) {
      console.log("🚫 一致するレシピなし");
      return new Response(JSON.stringify([]), {
        headers: corsHeaders,
      });
    }
    // --- ⑥ 重複除去（タイトル or URLで一意化）＋ランダム揺らぎ追加 🎲 ---
    const unique = [];
    const seen = new Set();
    for (const m of matches) {
      const key = m.url || m.title;
      if (!seen.has(key)) {
        seen.add(key);
        // 🎲 類似度に ±1% のランダム値を加える
        const noise = Math.random() * 0.02 - 0.01;
        m.similarity = m.similarity + noise;
        unique.push(m);
      }
    }
    // --- ⑦ 類似度順ソート＆上位5件 ---
    unique.sort((a, b) => b.similarity - a.similarity);
    const topResults = unique.slice(0, 5);
    console.log(`🎯 重複除去＋揺らぎ後 ${topResults.length}件`);
    // --- ⑧ 整形して返却 ---
    const formatted = topResults.map((r, i) => ({
      rank: i + 1,
      title: r.title,
      description: r.description,
      url: r.url,
      image: r.image,
      similarity: (r.similarity * 100).toFixed(1) + "%",
    }));
    return new Response(JSON.stringify(formatted), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Edge Function エラー:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
