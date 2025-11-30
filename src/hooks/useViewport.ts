import { useEffect } from "react";

/*
モバイルブラウザ（特にiOS Safari）では、CSSの 100vh が「アドレスバーを含めた画面全体の高さ」を指すため、
実際に見えている画面より大きくなってしまう。
これにより：
・コンテンツが画面からはみ出る
・フッターが隠れる
・スクロールが発生する
といった問題が起きる。
*/
//毎回リサイズされるたびに本当の高さ（実際に見えている高さ）を取得して、CSS変数 --vh を再設定する
//⇒本当の高さとはブラウザのアドレスバーやタブバーなどのUI部品を除いた「純粋にコンテンツが見えている部分の高さ」
export const useViewportHeightFix = () => {
  useEffect(() => {
    // setVh：CSS変数 --vh を再設定する関数
    //window.innerHeight は window オブジェクトの持っている値（プロパティ）
    //window.innerHeight は「今、画面に実際に見えている高さ（縦幅）」をピクセルで返すプロパティ。
    //・ブラウザのアドレスバーを除いた部分
    //・スマホだと、アドレスバーが出たり消えたりすると変わる
    //・スクロールで URL バーが消えたら、innerHeight は大きくなる
    //--vh:CSS変数（CSSの値を動的に変えられる変数）
    //App.tsxの<div id="app" className="h-[var(--vh)] overscroll-contain">で使われている
    //はい、その通りです！CSS変数は DOM（HTMLの要素） に設定するものです。
    // 理由:
    // window:ブラウザのウィンドウ自体（JavaScript用）
    // document.documentElement:	<html> 要素（CSS用）
    // CSS変数はスタイルの一部なので、HTML要素に設定する必要がある
    // つまり、CSS変数は <html> 要素に設定する必要がある（index.htmlの<html>要素に設定）
    //document.documentElement は <html> 要素を指すDOM要素です。
    //style.setProperty(name, value) は CSSStyleDeclaration オブジェクトのメソッドで、CSS変数を設定するために使用されます。
    //親要素に設定されたCSS変数は、その子要素でも使えるのでApp.tsxの<div id="app" className="h-[var(--vh)] overscroll-contain">で使える
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight}px`
      );
    };
    setVh(); // 初期設定
    // リサイズ時に再設定(画面の大きさが変わった時にsetVhを実行)
    //windowのresizeイベントが発生した時にsetVhを実行
    window.addEventListener("resize", setVh);
    // クリーンアップ関数(windowのresizeイベントが発生した時にsetVhを解除する)
    return () => window.removeEventListener("resize", setVh);
  }, []);
};
