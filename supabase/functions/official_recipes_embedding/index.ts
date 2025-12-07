import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});
Deno.serve(async () => {
  try {
    // 全レコード取得
    const { data: recipes, error } = await supabase
      .from("official_recipes")
      .select("*");
    if (error != null) throw error;
    for (const recipe of recipes) {
      if (recipe == null) continue;
      if (recipe.embedding != null) continue;
      const text = `${recipe.category ?? ""} ${recipe.title ?? ""} ${
        recipe.description ?? ""
      }`;
      // Embedding生成
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
      });
      const embedding = embeddingResponse.data[0].embedding;
      // Supabase更新
      const { error: updateError } = await supabase
        .from("official_recipes")
        .update({
          embedding,
        })
        .eq("id", recipe.id);
      if (updateError) {
        console.error(`❌ Error updating recipe ${recipe.id}:`, updateError);
      } else {
        console.log(`✅ Updated recipe ${recipe.id}`);
      }
    }
    return new Response("🎉 全レシピのembedding登録完了！", {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(`Error: ${(err as Error).message}`, {
      status: 500,
    });
  }
});
