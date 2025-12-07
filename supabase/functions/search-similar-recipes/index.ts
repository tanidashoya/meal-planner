import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
// --- Supabase接続 ---
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
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
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // --- 認証チェック ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // --- ① ユーザー入力受け取り ---
    const { text } = await req.json();
    if (!text) throw new Error("テキストが指定されていません。");
    console.log("🧠 入力テキスト:", text);
    // --- ② OpenAI 安全判定 ---
    const safetyCheckPrompt = `
次の文章が料理レシピ検索や食事関連の意図を持っているか判定してください。
- 料理、食材、食事、味、調理、献立、副菜、もう一品などに関連していれば VALID。
- それ以外や不適切な内容は INVALID。
返答は VALID または INVALID のみ。

入力文: "${text}"
`;
    const safetyRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: safetyCheckPrompt,
        },
      ],
    });
    const safety = safetyRes.choices[0]?.message?.content?.trim();
    console.log("🛡️ 安全判定結果:", safety);
    if (safety !== "VALID") {
      console.log("🚫 不適切または無関係な入力 → 検索スキップ");
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
次の文を料理レシピのベクトル検索に適した形に書き換えてください。

【入力文】
${text}

# ルール
1. 「◯◯に合う副菜・もう一品」などの表現では、◯◯は主菜です。検索対象に含めず、「◯◯などの主菜に合わせやすい副菜や小鉢を探しています」と説明文に変換。
2. 主菜の作り方を尋ねている場合（「◯◯の作り方」など）はそのまま保持。
3. 異なる表記（漢字・カタカナ・ひらがな）は自然に含める。
4. 出力は1文で自然に。
`;
    const rewriteRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
あなたは料理検索クエリを最適化する専門家です。
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
    // --- ⑤ documentsにINSERT ---
    const { data: insertedDoc, error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          content: rewrittenQuery,
          embedding,
        },
      ])
      .select("embedding")
      .single();
    if (insertError) throw insertError;
    // --- ⑥ 類似検索（1回のみ実施） ---
    const threshold = 0.45;
    const matchCount = 100;
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_official_recipes",
      {
        query_embedding: insertedDoc.embedding,
        match_threshold: threshold,
        match_count: matchCount,
      }
    );
    if (matchError) throw matchError;
    if (!matches) {
      console.error("🚫 Supabase RPCから null / undefined が返されました");
      return new Response(JSON.stringify([]), {
        headers: corsHeaders,
      });
    }
    if (matches.length === 0) {
      console.log("🚫 類似レシピなし（閾値:", threshold, "）");
      return new Response(JSON.stringify([]), {
        headers: corsHeaders,
      });
    }
    // --- ⑦ 類似度順ソート ---
    matches.sort(
      (a: { similarity: number }, b: { similarity: number }) =>
        b.similarity - a.similarity
    );
    const filtered = matches.filter(
      (m: { similarity: number }) => m.similarity >= threshold
    );
    // --- ⑧ 上位10件抽出 ---
    const topResults = filtered.slice(0, 10);
    console.log(`🎯 類似レシピ ${topResults.length}件を返却`);
    // --- ⑨ 結果返却 ---
    return new Response(JSON.stringify(topResults ?? []), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Edge Function エラー:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message ?? "不明なエラーが発生しました。",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
