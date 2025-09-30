//・Layoutコンポーネント
// ⇒リアルタイム通信 　　　　　⇒ これは一番最後
// ⇒検索機能とレシピ追加機能   ※レシピ追加機能はホームのもの
// ⇒searchModal開閉切り替え
// ⇒ノートの詳細への遷移

import { Outlet } from "react-router-dom"
import { useCurrentUserStore } from "./modules/auth/current-user.state"
import { useRecipeStore } from "./modules/recipes/recipe.state"
import { recipeRepository } from "./modules/recipes/recipe.repository"
import { useState,useEffect } from "react"
import { SearchModal } from "./components/SearchModal"
import { Recipe } from "./modules/recipes/recipe.entity"
import { useNavigate } from "react-router-dom"
import { SideBar } from "./components/SideBar"
import { unsubscribe } from "./lib/supabase"
import { subscribe } from "./lib/supabase"




export const Layout = () => {

    const currentUserStore = useCurrentUserStore();
    const recipeStore = useRecipeStore();
    const [isShowModal,setIsShowModal] = useState(false);
    const [searchResult,setSearchResult] = useState<Recipe[]>([]);
    const navigate = useNavigate();
    //サイドバーの開閉を管理するuseState
    const [open, setOpen] = useState(false)

    //すべてのレシピを取得（する必要がない気がする・・・）
    //最初はカテゴリーだけの表示でいいのでは？
    //検索ページで使用する
    const fetchRecipes = async() => {
        if (currentUserStore.currentUser == null) {
            return;
        }
        const recipes = await recipeRepository.findAll(currentUserStore.currentUser!.id)
        if (recipes == null) {
            return;
        }
        recipeStore.set(recipes)
    }



//channelを作っておけばsubscribeの.onメソッドの第二引数で定義されているtableや指定の場所に変化があれば第三引数で渡されたcallback関数が実行されるということ
    //スマホでログアウトしてPCでログアウトしようとしたときのエラー対応のためクリーンアップ関数にif文を追加
    // ⇒ スマホでログアウトした際にcurrentUserがnullになり、下記のuseEffectが実行されてchannelがundefinedになる
    // PCでログアウト処理をしようとしたときにchannelがundefinedになっており、クリーンアップ関数にunsubscribeを渡すとエラーになる
    // ⇒ そのためif文を追加してchannelが存在する場合のみクリーンアップ関数を実行するようにする
    useEffect(() => {
        
        fetchRecipes()
        const channel = subscribeRecipe()
        //クリーンアップ関数
        return () => {
            if (channel) {
                unsubscribe(channel)
            }
        }
    },[currentUserStore.currentUser])
 
    
    const moveToDetail = (recipeID:number) => {
        navigate(`/recipes/${recipeID}`)
        setOpen(false)
    }

    //検索窓の開閉のショートカットキー
    useEffect(() => {
        const handleSearchModal = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.key === "o") {
            e.preventDefault()
            setIsShowModal(prev => !prev)
          }
        }
        window.addEventListener("keydown", handleSearchModal)
        return () => window.removeEventListener("keydown", handleSearchModal)
    }, [])

    


    const SearchRecipe = async(keyword:string) => {
        //キーワードが空の場合は検索結果を空にする
        //つまり検索入力欄が空文字の場合、supabaseにアクセスしないため検索結果を取得しない
        if (!keyword || keyword.trim() === "") {
            setSearchResult([])
            return
        }
        //キーワードが空でない場合は検索結果を取得する
        const recipes = await recipeRepository.findByKeyword(currentUserStore.currentUser!.id,keyword)
        if (recipes == null) {
            return
        }
        setSearchResult(recipes)
    }   

    const openModal = () => {
        setIsShowModal(true)
    }

    //payloadは「どのように変更されるかを定義している」のではなく、「実際に変更が起きた後の結果情報」
    //データベースが変更されたときに変更情報を接続されているアプリにpayloadとして送っている
    //raitingを既存のデータに追加するときにはpayload.eventTypeはUPDATEとなる ⇒ グローバスステートに追加される
    const subscribeRecipe = () => {
        if (currentUserStore.currentUser == null) {
            return;
        }
        return subscribe(currentUserStore.currentUser!.id, (payload) => {
            console.log('リアルタイム通信受信:', payload.eventType, payload)
            if (payload.eventType === 'INSERT') {
                console.log('INSERTイベントを受信しました')
                recipeStore.set([payload.new])
            } else if (payload.eventType === 'UPDATE') {
                console.log('UPDATEイベントを受信しました')
                recipeStore.updateRating(payload.new)
            } else if (payload.eventType === 'DELETE') {
                console.log('DELETEイベントを受信しました')
                recipeStore.delete(currentUserStore.currentUser!.id,payload.old.id!)
            }
        })
    }

    // h-hull:ビューポートの高さを100%にする
    // md:flex-row:ブレイクポイントがmd以上のときにflex-rowにする
    // md:flex-row:ブレイクポイントがmd以上のときにflex-rowにする
    return (
        <div className="h-full flex flex-col  lg:flex-row">
            <div>
                <SideBar openModal={openModal} open={open} setOpen={setOpen}/>
            </div>
            {/* h-full:親要素の高さに合わせて縦いっぱいに広がる */}
            {/* つまりh-fullは親要素の高さ（ここではh-[100dvh]）に合わせるということ */}
            <main className="flex-1  overflow-y-auto h-full">
                <Outlet/>
                <SearchModal
                    isOpen = {isShowModal}
                    recipes = {searchResult}
                    onClose = {() => setIsShowModal(false)}
                    onItemSelect = {moveToDetail}
                    onKeywordChanged = {SearchRecipe}
                />
            </main>
        </div>
    )
}


/*
flex-1
親要素が flex レイアウトのときに有効。
flex-grow: 1; flex-shrink: 1; flex-basis: 0% を意味します。
→ 「空いているスペースをできるだけ埋める」挙動。

h-full
height: 100%
親要素の高さに合わせて縦いっぱいに広がる。

h-screen
height: 100vh
ビューポートの高さに合わせて縦いっぱいに広がる。


overflow-y-auto
縦方向のスクロール制御。
内容が親の高さを超えたらスクロールバーが出る。
内容が収まっていればスクロールバーは出ない。
*/

/* 
supabaseのRealTimeで購読したときのコールバックにはこんなpayloadが渡ってくる
{
  schema: "public",             // スキーマ名
  table: "recipes",             // テーブル名
  commit_timestamp: "2025-09-21T10:00:00Z", // DBでのコミット時刻
  eventType: "UPDATE",          // "INSERT" | "UPDATE" | "DELETE"
  new: { ... },                 // 更新後 / 追加後 のレコード
  old: { ... },                 // 更新前 / 削除前 のレコード
  errors: null
}
*/