//meal-plannerアプリのサイドバーの機能を実装する
import { authRepository } from "../../modules/auth/auth.repository"
import { useCurrentUserStore } from "../../modules/auth/current-user.state"
import { useNavigate } from "react-router-dom"
import { UserItem } from "./UserItem"
import { RecipeList } from "../RecipeList"
import { Item } from "./Item"
import { Search, PlusCircle } from "lucide-react"
import { Sheet } from "../ui/sheet"
import { Button } from "../ui/button"
import { PanelLeft } from "lucide-react"
import { SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet"
import { SheetContent } from "../ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useEffect } from "react"


interface SideBarProps {
    openModal:() => void
    open:boolean
    setOpen:(open:boolean) => void
}


export const SideBar = ({openModal,open,setOpen}:SideBarProps) => {

    const currentUserStore = useCurrentUserStore();
    const navigate = useNavigate();

    

    const handleSignOut = async() => {
        await authRepository.signout()
        currentUserStore.set(null)
        navigate("/signin")
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
        <div className="flex lg:flex-col items-center pt-2 mx-2 mt-2 pb-2 lg:ml-0 lg:mt-0 lg:mb-0 lg:gap-2 border-b lg:border-1 h-full">
            <Sheet open={open} onOpenChange={setOpen} modal={false}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="hover:bg-white lg:m-2 !px-4 !py-6 lg:!px-3 lg:!py-5 !shadow-none !outline-none">
                        <PanelLeft className="!h-8 !w-8 md:!h-7 md:!w-7 text-gray-500 " strokeWidth={1.5}/>
                    </Button>
                </SheetTrigger>
                {/* [&_svg]:h-5 [&_svg]:w-5 → アイコンのサイズを5pxにする svg:画像フォーマットの一種で、アイコンやイラストを 数式（ベクトル）で描いている画像 */}
                {/* Shadcn UI が内部で使っている Lucide アイコンも svg */}
                <SheetContent side="left" className="w-80 md:w-70"  onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                    <VisuallyHidden>
                        <SheetTitle>サイドバー</SheetTitle>
                        <SheetDescription>サイドバー</SheetDescription>
                    </VisuallyHidden>
                    <aside className="h-screen bg-secondary border-r flex flex-col">
                        {/* flex-shrink-0: 要素のサイズを縮小しない */}
                        {/* flex-shrink-0がなければレシピが増えた際にサイドバーのサイズが縮小されてそのあとRecipeListがスクロール可能になる */}
                        <div className="flex-shrink-0">
                            <UserItem 
                                userEmail={currentUserStore.currentUser.email!} 
                                userName={currentUserStore.currentUser.userName!} 
                                signout={handleSignOut}
                            />
                            
                            <div className="hover:bg-primary/5 mb-4 w-1/2 border-1 ml-2 rounded-3xl bg-white">
                                <Item label="レシピ検索" icon={Search} onClick={openModal} />
                            </div>
                        </div>
                        {/* overflow-y-auto: 縦方向のスクロールを有効化 */}
                        <div className="flex-1 overflow-y-auto">
                            <RecipeList setOpen={setOpen}/>
                        </div>
                    </aside>
                </SheetContent>
            </Sheet>

                <Button variant="outline" className="hover:bg-white !px-3 !py-5 !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none" onClick={() => navigate("/")}>
                    <PlusCircle className="size-8 text-gray-500 fill-yellow-100 stroke-width-1" strokeWidth={1.5} />
                </Button>
        </div>
    )
}