import { BrowserRouter } from "react-router-dom";
import { authRepository } from "./modules/auth/auth.repository";
import { useEffect, useState } from "react";
import { useCurrentUserStore } from "./modules/auth/current-user.state";
import mealPlannerLogo from "./assets/mealPlanner.webp";
import { ToastContainer } from "react-toastify";
import { AppRoutes } from "./router";
import { useViewportHeightFix } from "./hooks/useViewport";
import { ScrollRestoration } from "./components/ScrollRestoration";
import { toast } from "react-toastify";

function App() {
  //リサイズされるたびに本当の高さ（実際に見えている高さ）を取得して、CSS変数 --vh を再設定する
  useViewportHeightFix();
  //UIを表示せずにローディング画面を表示するための状態の場合は初期値がtrue
  const [isLoading, setIsLoading] = useState(true);
  const currentUserStore = useCurrentUserStore();
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = await authRepository.getCurrentUser();
      currentUserStore.set(currentUser);
    };
    //sessionStorageはブラウザに保存されているデータ
    //sessionStorageはブラウザを再読み込みしてもデータが保持される
    //localStorageはブラウザを再読み込みするとデータが消える
    //sessionStorageはブラウザを閉じるとデータが消える
    //sessionStorage.getItem('visited')：「visited というキーがあるか」を確認。なければ初回訪問と判定。
    const isFirstVisit = !sessionStorage.getItem("visited");
    //Date.now()：現在の時刻をミリ秒で取得
    const startTime = Date.now();

    const loadData = async () => {
      // ユーザー情報の取得
      try {
        await fetchCurrentUser();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "不明なエラーが発生しました"
        );
      }
      if (isFirstVisit) {
        // 初回訪問の場合は最小2.4秒間ローディングを表示
        //elapsed：経過した
        //elapsedTime：現在の時刻からstartTimeを引いた値（処理開始からここまでかかった時間）
        const elapsedTime = Date.now() - startTime;
        //remainingTime：2.4秒からelapsedTimeを引いた値（残りの時間）
        //つまり2.4秒経過するまではローディングを表示
        //「remainingTime には、あとどれだけ待つ必要があるか（ただし0未満にはならない）」が入る
        //Math.maxは複数の数字を渡して大きい方を返す関数
        //2000：2秒（最小2秒間ローディングを表示）
        //2400 - elapsedTime：2.4秒から経過した時間を引いた値（残りの時間）
        const remainingTime = Math.max(2000, 2400 - elapsedTime);

        // 初回訪問フラグをセット
        //seesionStorageにvisitedキーと値trueのペアが保存されている
        sessionStorage.setItem("visited", "true");

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      } else {
        // 2回目以降は即座に表示
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //isLoadingがtrueの場合はここでJSXを返すので下のBrowserRouterは表示されない
  //状態やprops、親コンポーネントの再レンダリングが起きれば再実行される ⇒ ここではisLoadingの値が変わると再実行される
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        {/* 要素に 点滅（パルス）アニメーション を付けます。背景色や文字色が「ふわっ → 薄く → ふわっ」と繰り返し変化するような効果。 */}
        <div className="animate-pulse mb-12 md:mb-4 flex flex-col items-center justify-center">
          <img
            src={mealPlannerLogo}
            alt="MealPlanner"
            className="h-40 w-auto mb-4"
          />
          <span className="text-2xl font-bold text-center tracking-widest">
            おうちごはん
          </span>
        </div>
        {/* animate-spin：円が回転するアニメーション */}
        {/* rounded-full：要素の角を 完全な円形にする。h-8 w-8 と組み合わせると「直径 2rem (＝32px) の円」になる。 */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  //ToastContainer：通知を表示するコンポーネント
  //id="app"：overflow-y-autoがありLaypoutコンポーネントのmain要素と連動してスクロールが動いていた
  //App.tsxでスクロールできるようにしているとLayoutコンポーネント全体がスクロールされるので
  // 上下のバーも一緒にスクロールされてしまう。
  return (
    <div id="app" className="h-[var(--vh)] overscroll-contain">
      <BrowserRouter>
        <ToastContainer
          position="top-right" // 表示位置（右上）
          autoClose={1700} // 1700ms（1.7秒）後に自動で消える
          hideProgressBar={true} // 進捗バー（残り時間）を非表示
          newestOnTop={true} // 新しい通知は上に追加（下ではなく）
          closeOnClick // クリックで閉じられる
          pauseOnHover // マウスを乗せている間は消えない
          draggable // ドラッグして閉じられる
          theme="colored" // 色付きテーマ
          limit={3} // 同時に表示する通知の最大数
          pauseOnFocusLoss={false} // フォーカスが外れた時に消えない
        />
        <AppRoutes />
        {/* ページ遷移時にスクロール位置を復元(各ページでばらばらに保存している) */}
        <ScrollRestoration />
      </BrowserRouter>
    </div>
  );
}

export default App;
