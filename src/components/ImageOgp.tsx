import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


//CORS:サーバー側がブラウザに対して、このオリジンからのリクエストは許可するよ」と伝える仕組み。
//「オリジン（Origin）」は、Web の世界で 「どのサイトから来た通信かを区別するための住所」 のような概念
//ここでいうオリジンとは【フロントエンドを配信しているページのURLのこと】
//ちなみにバックエンドのオリジンとはSupabaseのプロジェクトURLのこと
/*
🔑 オリジンの定義

オリジンは次の 3 つの組み合わせで決まります：
・スキーム（プロトコル）
　例: http://, https://
・ホスト名（ドメイン）
　例: localhost, example.com
・ポート番号
　例: :5173, :3000
(省略される場合もある)
*/

interface ImageOgpProps {
  url: string;
  className?: string;
}

export const ImageOgp = ({ url, className }: ImageOgpProps) => {

  const [isLoading, setIsLoading] = useState(false);
  //サーバーから返ってきたOGP情報をstateに格納・保存
  //状態の型を決めている
  const [ogp, setOgp] = useState<{ title?: string; description?: string; image?: string } | null>(null);

  //URLかどうかを判定するバリデーション
  const isURL = (url: string | null) => {
    try {
      new URL(url || "");
      return true;
    } catch {
      return false;
    }
  };


  //サーバーからOGP情報を取得する関数
  const getOgpPreview = async (url: string | null) => {
    //URLかどうかを判定するバリデーション
    if (!isURL(url)) return null;

    // 1️⃣ ブラウザキャッシュを確認（キャッシュがあればそれを返す）
    //JSON.parse(cached):JSON形式の文字列をオブジェクトに変換する
    const cacheKey = `ogp_${url}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2️⃣ サーバーからOGP情報を取得(sessionStorageにキャッシュがなければ実行)
    //invokeで呼び出し:Supabase JS SDK が提供する Edge Function 呼び出し用メソッド
    //invokeはsupabase用のfetchでフロントエンドからバックエンド（supabase）とのデータの送受信ができる
    //認証周りの情報送信やJSON変換の情報などを自動で行ってくれる（つまり返り値はJavaScriptのオブジェクトになる）
    //functions.invoke()の第一引数はslug固定。Supabase側のEdge Function の Name（表示名）を変えてもAPI呼び出しには使えない
    const { data, error } = await supabase.functions.invoke("smooth-function", {body: { url }});
  
    //エラーが発生した場合
    if (error) {
      console.error("OGP取得エラー:", error);
      return null;
    }

    // 3️⃣ キャッシュを保存
    //dataオブジェクトをJSON文字列に変換してsessionStorageにcashKeyに保存
    sessionStorage.setItem(cacheKey, JSON.stringify(data));

    //Edge FunctionのreturnしたJSONがそのまま入る
    return data; 
  };
  

  //非同期で後から返ってくる値は直接returnに使えない（const data = await getOgpPreview(url)のdataはそのままJSXに埋め込めない）
  /*
    即時実行される async 関数
    useEffect に直接 async () => { ... } を渡せない
    → 返り値が「Promise」になってしまうと、Reactの設計と相性が悪い
    そこで 中に async () => { ... }() という「即時実行関数 (IIFE)」を仕込んでいる
    これにより await が使えるようになる
    ⇒「useEffect の中で await を使うためだけに、もう1個アロー関数（async IIFE）を作っている」
  */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      console.log("受け取ったURL:", url); // ←ここで確認
      //フロントからURL情報を渡しサーバーからOGP情報を取得する関数を呼び出し、その結果をstateに格納・保存
      const data = await getOgpPreview(url);
      console.log("OGP結果:", data);
      setOgp(data);
      setIsLoading(false);
    })();
    //urlが変化する=RecipeDetail.tsxのTargetRecipe(URLからレシピIDを取得して表示しているレシピ)が変化する
  }, [url]);
  
  
  //object-contain:img要素が枠内に収まるように全体を縮小しつつ、縦横比を維持して表示する
  return (
    <div className={`flex justify-center items-center ${className}`}>
        {isLoading ? (
            <div className={`flex justify-center items-center ${className}`}>
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600`}></div>
            </div>
        ) : (
            ogp?.image ?(
                <div className={`flex justify-center items-center ${className}`}>
                    <img src={ogp.image} alt={ogp.title} className={`w-full h-full object-contain`} />
                </div>
            ) : (
                <div className={`flex justify-center items-center text-gray-500 ${className}`}>
                    <p>画像は存在しません</p>
                </div>
            )
        )}
    </div>
  );
};


/*
🔍 supabase.functions.invoke メソッドとは？

Supabase JS SDK が提供する Edge Function 呼び出し用メソッド です。
内部的には fetch("https://<project>.supabase.co/functions/v1/<function>") をやってくれていますが、次のような違いがあります：

自動で必要なヘッダを追加
Authorization: Bearer <JWT>（ログイン中ユーザー）
apikey: <anon-key>
x-client-info: <SDKバージョン>
→ 認証周りを自分で書かなくていい。

JSONのやりとりを自動変換
body にオブジェクトを渡せば、自動で JSON.stringify。

サーバーが application/json を返せば、自動で JSON.parse。
返り値は { data, error } 形式にラップされる。
*/