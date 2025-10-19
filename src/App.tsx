import { BrowserRouter,Routes,Route } from "react-router-dom"
import { Layout } from "./Layout"
import { Home } from "./pages/Home"
import { Signup } from "./pages/Signup"
import {Signin} from "./pages/Signin"
import { authRepository } from "./modules/auth/auth.repository"
import { useEffect, useState } from "react"
import { useCurrentUserStore } from "./modules/auth/current-user.state"
import { RecipeDetail } from "./pages/RecipeDetail"
import mealPlannerLogo from "./assets/mealPlanner.png"
import { TasteSort } from "./pages/TasteSort"
import { TasteList } from "./pages/TasteList"
import { TimeSort } from "./pages/TimeSort"
import { TimeList } from "./pages/TimeList"
import { useLocation } from "react-router-dom";
import { Picks } from "./pages/Picks"
import { ToastContainer } from "react-toastify"
import { MatchRecipe } from "./pages/MatchRecipe"


function useViewportHeightFix() {
  useEffect(() => {
    const setVh = () => {
      // innerHeightをもとにCSS変数 --vh を常に正しく再設定
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh(); // 初期設定
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);
}

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // ページ遷移のたびに先頭に戻す
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function App() {

  useViewportHeightFix();
  const [isLoading,setIsLoading] = useState(true)
  const currentUserStore = useCurrentUserStore();

  const fetchCurrentUser = async() => {
    const currentUser = await authRepository.getCurrentUser()
    currentUserStore.set(currentUser)
  }

  useEffect(() => {
    //sessionStorageはブラウザに保存されているデータ
    //sessionStorageはブラウザを再読み込みしてもデータが保持される
    //localStorageはブラウザを再読み込みするとデータが消える
    //sessionStorageはブラウザを閉じるとデータが消える
    //sessionStorage.getItem('visited')：「visited というキーがあるか」を確認。なければ初回訪問と判定。
    const isFirstVisit = !sessionStorage.getItem('visited')
    //Date.now()：現在の時刻をミリ秒で取得
    const startTime = Date.now()
    
    const loadData = async () => {
      // 実際のデータ取得
      await fetchCurrentUser()
      
      if (isFirstVisit) {
        // 初回訪問の場合は最小2.4秒間ローディングを表示
        //elapsed：経過した
        //elapsedTime：現在の時刻からstartTimeを引いた値（処理開始からここまでかかった時間）
        const elapsedTime = Date.now() - startTime
        //remainingTime：2.4秒からelapsedTimeを引いた値（残りの時間）
        //つまり最小で2.4秒間ローディングを表示
        //「remainingTime には、あとどれだけ待つ必要があるか（ただし0未満にはならない）」が入る
        const remainingTime = Math.max(0, 2400 - elapsedTime)
        
        // 初回訪問フラグをセット
        //seesionStorageにvisitedキーと値trueのペアが保存されている
        sessionStorage.setItem('visited', 'true')
        
        setTimeout(() => {
          setIsLoading(false)
        }, remainingTime)
      } else {
        // 2回目以降は即座に表示
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  //isLoadingがtrueの場合はここでJSXを返すので下のBrowserRouterは表示されない
  //状態やprops、親コンポーネントの再レンダリングが起きれば再実行される ⇒ ここではisLoadingの値が変わると再実行される
  if (isLoading){
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        {/* 要素に 点滅（パルス）アニメーション を付けます。背景色や文字色が「ふわっ → 薄く → ふわっ」と繰り返し変化するような効果。 */}
        <div className="animate-pulse md:mb-4">
          <img src={mealPlannerLogo} alt="Meal Planner" className="h-60 w-auto" />
        </div> 
        {/* animate-spin：円が回転するアニメーション */}
        {/* rounded-full：要素の角を 完全な円形にする。h-8 w-8 と組み合わせると「直径 2rem (＝32px) の円」になる。 */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  

  return (
    <div className="h-[calc(var(--vh)*100)] overflow-hidden">
      <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={1700}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index element={<Home/>}/>
            <Route path="/recipes/:id" element={<RecipeDetail/>}/>
            <Route path="/star-sort" element={<TasteSort/>}/>
            <Route path="/star-list/:star" element={<TasteList/>}/>
            <Route path="/time-sort" element={<TimeSort/>}/>
            <Route path="/time-list/:time" element={<TimeList/>}/>
            <Route path="/picks" element={<Picks/>}/>
            <Route path="/match-recipe" element={<MatchRecipe/>}/>
          </Route>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/signin" element={<Signin/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
