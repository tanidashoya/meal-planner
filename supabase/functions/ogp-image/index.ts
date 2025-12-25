//URLを直接書くと、バージョン管理が難しい＆コードが読みにくい
// import { DOMParser } from "https://deno.land/x/deno_dom/...";
import { DOMParser } from "deno_dom";
import { createClient } from "@supabase/supabase-js";

// --- 認証検証用クライアント（ANON_KEY使用） ---
const supabaseAuth = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_ANON_KEY")
);

// ====== SSRF対策：内部向けのホスト名かどうかチェック （SSRF：Server-Side Request Forgery（サーバーサイド・リクエスト・フォージェリ）） ======
//日本語ではサーバー側リクエスト強制（サーバーに“本来アクセスすべきでない場所”へアクセスさせる攻撃）
//hostnameにはURL全体ではなくnew URL(url).hostname の「ホスト名」だけ入ってる
function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0") return true;
  if (h.endsWith(".local")) return true;
  return false;
}

// プライベートIPv4(10.x.x.x / 192.168.x.x / etc.) を判定
function isPrivateIPv4(hostname: string): boolean {
  const m = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  // localhost (::1)⇒サーバー自体を表すアドレス。localhost（IPv6版）へのアクセス禁止
  if (normalized === "::1") return true;
  // IPv4 mapped (::ffff:127.0.0.1)⇒IPv6 の中で IPv4 アドレスを表す特殊形式。IPv4ブロックをすり抜けながらIPv4にアクセスしようとする記述。
  //IPv4-mapped IPv6 アドレスの禁止
  if (normalized.startsWith("::ffff:")) return true;
  // link-local (fe80::/10) ⇒ 同じネットワークセグメント内の通信だけに使われる特別なアドレス
  //クラウド内部インフラの探索・攻撃に使われるためブロック。
  if (normalized.startsWith("fe80")) return true;
  // unique-local (fc00::/7 → fc00 〜 fdff)
  //Pv6 の fc00::/7 という範囲を検出して拒否
  //IPv6 には「プライベートアドレス」に近い概念としてUnique Local Address（ULA）というものがある
  //IPv4 でいうところの10.x.x.x、172.16.x.x、192.168.x.x
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  return false;
}

//serve():Supabase Edge Functions（中身は Deno）でHTTPサーバーを立てる関数
//⇒HTTPサーバーを起動して、リクエストを受けたらこの関数で処理してね
//req:フロントエンドから届いたリクエスト（メソッド・ヘッダ・ボディなど）が入る
// --- 共通CORS設定 ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey",
};

Deno.serve(async (req) => {
  // ① プリフライト(OPTIONS)リクエストを処理(CORS処理⇒大体どこでも必須)
  //ブラウザは 本リクエスト（POSTやPUT）を送る前に「OPTIONS」リクエストを自動送信する
  //⇒これをプリフライトリクエストという
  //⇒サーバーに「このオリジンから、このメソッドとヘッダーでリクエストしていいですか？」と事前確認している
  //OPTIONS（プリフライト）の Allow-Origin と、本レスポンスの Allow-Origin は常に一致させなければならない
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
  } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "無効なトークンです" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({
          error: "URL が空、または不正な形式です",
        }),
        {
          status: 400,
          headers: {
            //"Content-Type": "application/json"：JSON形式ですよと教えてあげる
            //本番環境では"*"を"フロントエンドのURLに変更"
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return new Response(
        JSON.stringify({
          error: "URL は http:// または https:// のみ許可されています",
        }),
        {
          status: 400,
          headers: {
            //"Content-Type": "application/json"：JSON形式ですよと教えてあげる
            //本番環境では"*"を"フロントエンドのURLに変更"
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // ========== SSRF対策：DNSを解決してIPを調べる ==========
    //文字列として渡ってきた URL を「分解して扱いやすい形（オブジェクト）」に変換する処理。
    const urlObj = new URL(url);
    //hostname:ドメイン名またはIPアドレスが入る部分
    const hostname = urlObj.hostname;

    if (isBlockedHostname(hostname)) {
      return new Response(
        JSON.stringify({ error: "このホスト名は許可されていません" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    //Deno の関数で「ホスト名 → IPアドレスに変換する（DNS解決）」ための機能。(Aレコード：IPv4アドレス)
    //URLのドメイン名がどのIPアドレスに対応しているか調べる処理
    //DNSサーバー（電話帳）には、単にIPアドレスだけでなく、様々な情報が書き込まれている。
    //第二引数のアルファベットは、**「電話帳の、どの項目を見たいですか？」**という指定
    const ip = (await Deno.resolveDns(hostname, "A"))?.[0];

    if (!ip) {
      return new Response(
        JSON.stringify({ error: "IP の解決に失敗しました" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (isPrivateIPv4(ip)) {
      return new Response(
        JSON.stringify({
          error: "プライベートIPへのアクセスは禁止されています",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    //第二引数AAAAはIPv6を取得
    //IPv6は複数の値を配列で返す
    //.catch() は「Promise がエラー（reject）したときだけ実行される
    //resolveDns が throw しても、catch で受け止めて、空配列を返す。IPv6レコードが存在しないことがあるから
    const ipv6List = await Deno.resolveDns(hostname, "AAAA").catch(() => []);

    for (const ipv6 of ipv6List) {
      if (isPrivateIPv6(ipv6)) {
        return new Response(
          JSON.stringify({
            error: "プライベートIPv6へのアクセスは禁止されています",
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // ======================================================
    // ② DoS対策：fetch に「タイムアウト」を設定（遅延サーバー対策）
    // ⇒ 応答が遅い外部サーバーが相手だと、Edge Function が詰まってサービス停止する
    // ⇒ AbortControllerにより一定時間で中断させる
    // ======================================================
    //AbortCOntroller:**処理を途中で強制停止（キャンセル）するためのスイッチ**を作るクラス
    //controller (リモコン本体): 中止ボタン（.abort()）が付いています。あなたが操作します。
    // signal (受信機): リモコンからの信号を受け取るアンテナです。これを通信処理（fetch）に渡しておきます。
    const controller = new AbortController();
    //timeout定義時点でタイマーのカウントダウンが始まっている（setTimeout() を呼んだ“その瞬間”からカウントダウンが開始）
    const timeout = setTimeout(() => controller.abort(), 3000); // 3秒で中断
    let res;
    //第一引数の url が「どこへ（宛先）」を指定するのに対し、第二引数は**「どうやって（手段・条件）」**を指定
    // signal: controller.signal という記述自体には「3秒」という意味はありませんが、
    //「このコントローラー（controller）と、この通信（fetch）を『見えない線』で繋ぐ」 という役割をしています。
    // 結果として、上で設定した setTimeout の「3秒」というタイマー設定が、そのまま通信の制限時間になります。
    //fetch:指定したURLにHTTPリクエストを送り、レスポンスを Promise として返す関数(正確に)
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout); // タイムアウトキャンセル
    }

    // ======================================================
    // 404エラーチェック（ページが見つからない場合）
    // ======================================================
    if (res.status === 404) {
      return new Response(
        JSON.stringify({
          error: "ページが見つかりません",
          status: 404,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=86400",
          },
        }
      );
    }

    // ======================================================
    // ③ DoS対策：HTMLサイズチェック（巨大HTMLでメモリ圧迫する攻撃を防ぐ）
    // ⇒ Content-Lengthが2MB以上の場合はエラーを返す
    // ⇒ HEADを返さないサーバーもあるため、fetch後にtext()する前にチェック
    // ======================================================
    //res.headers は 普通のオブジェクトではなくて Headers という“特別なクラス（専用の入れ物）”。
    // その中の値は **「プロパティ」ではなく“ヘッダー名をキーとしたデータ」**として保存されている。
    //値をとるときは専用メソッド.getのようなものでアクセスする必要がある
    //content-length:レスポンスの中身のデータサイズ
    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > 2_000_000) {
      // 2MB
      return new Response(
        JSON.stringify({
          error: "HTMLサイズが大きすぎます（2MB以上）",
        }),
        {
          status: 413,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    //fetch(URL):指定したURLに対してGETリクエストを送りResponceオブジェクトを取得する
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title =
      doc
        ?.querySelector("meta[property='og:title']")
        ?.getAttribute("content") ?? "";
    const description =
      doc
        ?.querySelector("meta[property='og:description']")
        ?.getAttribute("content") ?? "";
    const image =
      doc
        ?.querySelector("meta[property='og:image']")
        ?.getAttribute("content") ?? "";
    return new Response(
      JSON.stringify({
        title,
        description,
        image,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          //"Content-Type": "application/json"：JSON形式ですよと教えてあげる
          //本番環境では"*"を"フロントエンドのURLに変更"
          "Access-Control-Allow-Origin": "*",
          // ✅ 成功時のレスポンスにもキャッシュを入れる！
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      }
    );

    //エラーならばエラーコード・テキストを返す
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          //"Content-Type": "application/json"：JSON形式ですよと教えてあげる
          //本番環境では"*"を"フロントエンドのURLに変更"
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          // ✅ ブラウザに1日キャッシュさせる
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      }
    );
  }
});

// new URL(url) をすると内部的にこうなる：
// プロパティ	         値
// urlObj.protocol	"https:"
// urlObj.hostname	"example.com"
// urlObj.port     	"8080"
// urlObj.pathname	"/path"
// urlObj.search	  "?key=value"
// urlObj.hash	    "#top"
