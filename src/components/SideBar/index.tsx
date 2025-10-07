//meal-plannerアプリのサイドバーの機能を実装する
import { authRepository } from "../../modules/auth/auth.repository"
import { useCurrentUserStore } from "../../modules/auth/current-user.state"
import { useNavigate } from "react-router-dom"
import { UserItem } from "./UserItem"
import { RecipeList } from "../RecipeList"
import { Item } from "./Item"
import { Search, PlusCircle } from "lucide-react"
import tasteIcon from "../../assets/taste_icon.png"
import { Sheet } from "../ui/sheet"
import { Button } from "../ui/button"
import { PanelLeft } from "lucide-react"
import { SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet"
import { SheetContent } from "../ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useEffect } from "react"
import watchIcon from "../../assets/watch_icon.png";
import { BottomBar } from "../BottomBar";
import randomPicksIcon from "../../assets/random_picks.png";


interface SideBarProps {
    openModal:() => void
    open:boolean
    setOpen:(open:boolean) => void
}


export const SideBar = ({openModal,open,setOpen}:SideBarProps) => {

    const currentUserStore = useCurrentUserStore();
    
    const navigate = useNavigate();

    

    //try-catch文を使用してエラーを捕捉する
    //AuthSessionMissingエラー以外のエラーやグローバルステートのnull化やページ遷移に失敗した場合はエラーを捕捉して処理を停止させないようにする
    const handleSignOut = async() => {
        try {
            await authRepository.signout()
            currentUserStore.set(null)
            navigate("/signin")
        } catch (error) {
            //エラーをコンソールに出力
            console.error('ログアウト処理でエラーが発生:', error);
        }
    }

    //サイドバーの開閉のショートカットキー
    //依存配列：open, setOpen
    //open, setOpenが変更されたらuseEffectが実行される
    //openの値が変化してuseEffectが再実行されることでイベントリスナーが再設定されてopenの正しい値を参照するようになる
    useEffect(() => {
        const handleOpenSideBar = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.key === "s") {
            e.preventDefault()
            setOpen(!open)
          }
        }
        window.addEventListener("keydown", handleOpenSideBar)
        return () => window.removeEventListener("keydown", handleOpenSideBar)
      }, [open, setOpen])

    
    // currentUserがnullの場合は何も表示しない
    //これがないとログアウトを押したときにJSXでcurrentUserStore.currentUserがnullになっているのにemail,userNameにアクセスしてエラーとなる
    if (currentUserStore.currentUser == null) {
        return;
    }
    
    return (
        //<aside> 要素は HTML5 で導入された「意味を持つタグ（セマンティック要素）」のひとつ
        //bg-secondary → 補助的な背景色（グレー系になることが多い）⇒　index.cssで定義されている
        //border-r → 右の境界線を表示する
        //modal={false} → 裏側のページも操作可能
        <div className="fixed top-0 left-0 right-0 z-50 lg:top-auto lg:left-auto lg:right-auto flex lg:flex-col items-center my-1 pt-2 pb-1 lg:ml-0 lg:mt-0 lg:mb-0 lg:gap-2 border-b lg:border-1 bg-white lg:bg-transparent lg:h-full">
            <Sheet open={open} onOpenChange={setOpen} modal={false}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="ml-2 hover:bg-white lg:m-2 !px-4 !py-6 lg:!px-3 lg:!py-5 !shadow-none !outline-none">
                        <PanelLeft className="!h-9 !w-9 md:!h-7 md:!w-7 text-gray-500 " strokeWidth={1.5}/>
                    </Button>
                </SheetTrigger>
                {/* [&_svg]:h-5 [&_svg]:w-5 → アイコンのサイズを5pxにする svg:画像フォーマットの一種で、アイコンやイラストを 数式（ベクトル）で描いている画像 */}
                {/* Shadcn UI が内部で使っている Lucide アイコンも svg */}
                <SheetContent side="left" className="w-80 md:w-70"  onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                    <VisuallyHidden>
                        <SheetTitle>サイドバー</SheetTitle>
                        <SheetDescription>サイドバー</SheetDescription>
                    </VisuallyHidden>
                    <aside className="h-full bg-secondary border-r flex flex-col">
                        {/* flex-shrink-0: 要素のサイズを縮小しない */}
                        {/* flex-shrink-0がなければレシピが増えた際にサイドバーのサイズが縮小されてそのあとRecipeListがスクロール可能になる */}
                        <div className="flex-shrink-0">
                            <UserItem 
                                userEmail={currentUserStore.currentUser.email!} 
                                userName={currentUserStore.currentUser.userName!} 
                                signout={handleSignOut}
                            />
                            
                            <div className="hover:bg-primary/5 mb-4 w-2/3 border-1 ml-2 rounded-3xl bg-white">
                                <Item label="Myレシピ検索" icon={Search} onClick={openModal} />
                            </div>
                        </div>
                        {/* overflow-y-auto: 縦方向のスクロールを有効化 */}
                        <div className="flex-1 overflow-y-auto h-full">
                            <RecipeList setOpen={setOpen}/>
                        </div>
                    </aside>
                </SheetContent>
            </Sheet>
            
            {/* ピックスボタン */}
            <Button variant="outline" className="hover:bg-white !px-2 !py-6 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none" onClick={() => navigate("/picks")}>
                <img src={randomPicksIcon} alt="picks icon" className="size-11" />
            </Button>


            <div className="hidden lg:flex flex-col items-center gap-2">
                <Button variant="outline" className="hover:bg-white !px-3 !py-5 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none" onClick={() => navigate("/")}>
                    <PlusCircle className="size-8 text-gray-500 stroke-width-1" strokeWidth={1.5} />
                </Button>
                <Button variant="outline" className="hover:bg-white !px-2 !py-5 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none" onClick={() => navigate("/star-sort")}>
                    <img src={tasteIcon} alt="taste icon" className="size-8" />
                </Button>
                <Button variant="outline" className="hover:bg-white !px-2 !py-5 lg:mt-2 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none" onClick={() => navigate("/time-sort")}>
                    <img src={watchIcon} alt="watch icon" className="size-8" />
                </Button>
            </div>
            <BottomBar />
        </div>
    )
}