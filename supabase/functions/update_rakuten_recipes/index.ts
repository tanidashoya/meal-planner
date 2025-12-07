import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// --- Supabase & OpenAI 設定 ---
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// --- CORS設定 ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

// --- メイン処理 ---
Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  // --- 認証チェック ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "認証が必要です" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { query } = await req.json();
    if (!query) throw new Error("検索クエリが指定されていません。");
    console.log("🧠 ユーザー入力:", query);

    // --- ① レシピ関連チェック ---
    const safetyRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `次の文章が料理や食材に関する検索なら "VALID"、それ以外なら "INVALID" とだけ出力。
文章: "${query}"`,
        },
      ],
    });
    if (safetyRes.choices[0]?.message?.content?.trim() !== "VALID") {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    // --- ② クエリのリライト ---
    const rewritePrompt = `
次の文章を、料理検索意図が正確に伝わる自然な一文に書き換えてください。
食材は代表表記に統一し、他の表記を括弧で併記（例：茄子（ナス・なす））。
入力: "${query}"
`;
    const rewriteRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: rewritePrompt }],
      temperature: 0.3,
    });
    const refinedQuery = rewriteRes.choices[0]?.message?.content?.trim();
    console.log("🧭 リライト後:", refinedQuery);

    // --- ③ 材料系かどうかを判定 ---
    const intentRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `次の文章が「材料を使ったレシピ」か判定してください。
"AとBを使った料理" → "INGREDIENT"
"唐揚げのレシピ"など料理名単体 → "GENERAL"
出力は "INGREDIENT" か "GENERAL" のみ。
入力: "${refinedQuery}"`,
        },
      ],
    });
    const intent = intentRes.choices[0]?.message?.content?.trim();
    console.log("🔍 検索タイプ:", intent);

    // --- ④ クエリをベクトル化 ---
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: refinedQuery ?? "",
    });
    const userVector = embedRes.data[0].embedding;

    // --- ⑤ Supabaseベクトル検索 ---
    const { data: matches, error } = await supabase.rpc(
      "match_rakuten_recipes",
      {
        query_embedding: userVector,
        match_threshold: 0.6,
        match_count: 50,
      }
    );
    if (error) throw error;
    if (!matches?.length) {
      return new Response(
        JSON.stringify({ message: "レシピが見つかりません。" }),
        {
          headers: corsHeaders,
        }
      );
    }

    // --- ⑥ 重複除去 ---
    const seen = new Set();
    let filtered = matches.filter((r: { title: string }) => {
      if (seen.has(r.title)) return false;
      seen.add(r.title);
      return true;
    });

    // --- ⑦ 材料質問なら ingredients フィルタ適用（厳密AND） ---
    if (intent === "INGREDIENT") {
      const extractPrompt = `
次の文から実際に使う「食材のみ」を抽出してください。
料理名（カレー、唐揚げなど）は除外。
出力形式:
[
  {"base": "茄子", "variants": ["ナス", "なす"]},
  {"base": "ネギ", "variants": ["ねぎ"]}
]
入力: "${refinedQuery}"
`;
      const extractRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.2,
      });

      let ingredientVariants = [];
      try {
        ingredientVariants = JSON.parse(
          extractRes.choices[0]?.message?.content ?? ""
        );
      } catch {
        console.warn("⚠️ 材料抽出失敗 → スキップ");
      }

      if (ingredientVariants.length > 0) {
        const normalize = (str: string) =>
          str
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
              String.fromCharCode(s.charCodeAt(0) - 0xfee0)
            )
            .replace(/[\u30A1-\u30FA]/g, (s) =>
              String.fromCharCode(s.charCodeAt(0) - 0x60)
            )
            .replace(/\s+/g, "")
            .replace(/[・､、,]/g, "、");

        // --- 食材表記統一（ひらがな化） ---
        const toHiragana = (str: string) =>
          str
            .replace(/茄子|ナス/g, "なす")
            .replace(/葱|ネギ/g, "ねぎ")
            .replace(/卵|玉子|タマゴ/g, "たまご")
            .replace(/豚肉/g, "ぶたにく")
            .replace(/牛肉/g, "ぎゅうにく")
            .replace(/鶏肉|チキン/g, "とりにく");

        const before = filtered.length;

        filtered = filtered.filter((r: { ingredients: string | string[] }) => {
          let ingText = "";
          if (Array.isArray(r.ingredients)) ingText = r.ingredients.join("、");
          else if (typeof r.ingredients === "string") ingText = r.ingredients;

          const ingList = toHiragana(normalize(ingText))
            .split(/[、,・\s]/)
            .filter(Boolean);

          // --- AND検索（すべての材料を含むか？）---
          return ingredientVariants.every(
            ({ base, variants }: { base: string; variants: string[] }) => {
              const allForms = [base, ...variants].map(toHiragana);
              return allForms.some((form) =>
                ingList.includes(toHiragana(form))
              );
            }
          );
        });

        console.log(
          `🍆 材料フィルタ(厳密AND): ${before} → ${filtered.length}件`
        );

        // --- fallback（全滅防止） ---
        if (filtered.length === 0 && matches.length > 0) {
          console.log("⚠️ 材料フィルタで0件 → embedding結果を返す");
          filtered = matches;
        }
      }
    }

    // --- ⑧ 整形して返す ---
    const formatted = filtered
      .slice(0, 10)
      .map(
        (
          r: {
            title: string;
            description: string;
            url: string;
            image: string;
            ingredients: string | string[];
            similarity: number;
          },
          i: number
        ) => ({
          rank: i + 1,
          title: r.title,
          description: r.description,
          url: r.url,
          image: r.image,
          ingredients: r.ingredients,
          similarity: (r.similarity * 100).toFixed(1) + "%",
        })
      );

    console.log(`✅ 出力件数: ${formatted.length}`);
    return new Response(
      JSON.stringify({
        original_query: query,
        refined_query: refinedQuery,
        type: intent,
        count: formatted.length,
        recipes: formatted,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
