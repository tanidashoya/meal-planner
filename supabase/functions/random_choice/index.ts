import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
Deno.serve(async () => {
  const todayJst = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
  });
  // 今日のレコードがあるかチェック
  const { data: exists } = await supabase
    .from("daily_official_picks")
    .select("*")
    .eq("pick_date", todayJst)
    .maybeSingle();
  if (exists) {
    return new Response("Already exists", {
      status: 200,
    });
  }
  // ランダム 5 件取得
  const { data: picks, error: pickError } = await supabase.rpc(
    "pick_random_recipes",
    {
      limit_count: 15,
    }
  );
  if (pickError || !picks) {
    return new Response(`Error: ${pickError?.message}`, {
      status: 500,
    });
  }
  // 親テーブルにINSERT
  const { data: daily, error: dailyError } = await supabase
    .from("daily_official_picks")
    .insert({
      pick_date: todayJst,
    })
    .select()
    .single();
  if (dailyError) {
    return new Response(`Error: ${dailyError.message}`, {
      status: 500,
    });
  }
  // 子テーブルにINSERT
  const items = picks.map(
    (p: { id: number; category: string; title: string; url: string }) => ({
      daily_id: daily.id,
      recipe_id: p.id,
      category: p.category,
      title: p.title,
      url: p.url,
    })
  );
  const { data: insertedItems, error: itemsError } = await supabase
    .from("daily_official_pick_items")
    .insert(items)
    .select();
  if (itemsError) {
    return new Response(`Error: ${itemsError.message}`, {
      status: 500,
    });
  }
  return new Response(JSON.stringify(insertedItems), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
});
