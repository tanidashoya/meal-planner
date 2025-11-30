import { useEffect, useRef, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// スクロール位置を保存・復元するコンポーネント
// スクロールイベントで常にスクロール位置を保存し、ページ遷移時に復元する
export const ScrollRestoration = () => {
  //useLocation：現在のURLのパスを取得する
  const { pathname } = useLocation();
  //復元中かどうかを管理するためのref
  const isRestoringRef = useRef(false);

  // スクロール位置をリアルタイムで保存
  //pathname(ページのURL)が変わるたびに実行
  useEffect(() => {
    const mainElement = document.getElementById("scroll-container");
    if (!mainElement) return;

    // スクロール位置をリアルタイムで保存
    const handleScroll = () => {
      // 復元中はスクロール位置を保存しない（復元と保存が競合するのを防ぐ）
      if (isRestoringRef.current) return;
      // スクロール位置を保存するためのキー
      // ページごとに異なるキーを使うことで、ページ遷移時に正しいスクロール位置を復元できる
      const scrollKey = `scroll-${pathname}`;
      //mainElement.scrollTop：現在のスクロール位置（ピクセル）
      // スクロール位置をsessionStorageに保存
      sessionStorage.setItem(scrollKey, String(mainElement.scrollTop));
    };

    // スクロール位置をリアルタイムで保存
    mainElement.addEventListener("scroll", handleScroll);
    //クリーンアップ関数（アンマウントされたらスクロール位置をリアルタイムで保存を解除）
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // ページ遷移時（）にスクロール位置を復元（useLayoutEffectで画面描画前に実行）
  // ✔ useEffect → 画面描画「後」に実行される
  // ✔ useLayoutEffect → 画面描画「直前」に実行される（同期的に実行される）
  //useEffectでは画面描画後に実行されてしまうためscrollTop:0の状態が一瞬表示されて、記録位置に移動してしまうため画面がちらつく
  //useLayoutEffectでは画面描画直前に実行されるためscrollTop:0の状態が表示されない
  useLayoutEffect(() => {
    // ページ遷移時にスクロール位置を復元
    const mainElement = document.getElementById("scroll-container");
    if (!mainElement) return;

    // スクロール位置を保存したキー
    const scrollKey = `scroll-${pathname}`;
    // スクロール位置をsessionStorageから取得
    const savedScroll = sessionStorage.getItem(scrollKey);

    if (savedScroll && Number(savedScroll) > 0) {
      // 復元中フラグを立てる
      isRestoringRef.current = true;
      // 即座にスクロール位置を復元
      //現在のスクロール位置（mainElement.scrollTop）を保存した位置（Number(savedScroll)）に復元
      mainElement.scrollTop = Number(savedScroll);
      // 少し待ってから復元中フラグを解除
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    } else {
      // スクロール位置を0（ページの一番上）にリセット
      mainElement.scrollTop = 0;
    }
  }, [pathname]);

  //呼び出しもとにはnullを返す
  //これはロジックだけのコンポーネントなので、nullを返すことでUIを描画しない
  return null;
};

/*
useLocationを呼ぶと、こんなオブジェクトが返ってくる：
{
  pathname: "/recipes/3",
  search: "?q=pasta",
  hash: "",
  state: null,
  key: "xyz123"
}

*/
