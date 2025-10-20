import {useCurrentUserStore} from "../modules/auth/current-user.state";
import { Navigate } from "react-router-dom"
import { RecipeParams } from "../modules/recipes/recipe.entity"
import { recipeRepository } from "../modules/recipes/recipe.repository"
import { useRecipeStore } from "../modules/recipes/recipe.state"
import { Card, CardDescription, CardHeader, CardTitle, CardContent,} from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "../components/ui/button"
import { toast } from "react-toastify"
import mealPlanner from "../assets/mealPlanner.png"

export function Home(){

    const currentUserStore = useCurrentUserStore();
    const recipeStore = useRecipeStore();
    const [recipeTitle,setRecipeTitle] = useState("")
    const [source,setSource] = useState("")
    //selectedCategoryはcategoryの中の最初の要素を初期値としている
    const [selectedCategory,setSelectedCategory] = useState("")
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const createRecipe = async(params:RecipeParams) => {
        if (!currentUserStore.currentUser) return;
        try{
            const recipe = await recipeRepository.create(currentUserStore.currentUser.id,params)
            if (recipe == null) return;
            //グローバルステートに追加
            recipeStore.set([recipe])
            toast.success("レシピの追加に成功しました")
        }catch(error){
            //instanceofは左のオペランドが右のクラスに属するインスタンスかを判定してboolean値を返す
            const message = error instanceof Error ? error.message : "不明なエラーが発生しました"
            toast.error(message)
        }
        setRecipeTitle("")
        setSource("")
        setSelectedCategory("")
        // return recipe
    } 

    //条件分岐の中で「この画面を表示する代わりにリダイレクトしたい」場合はNavigateを使う
    if (currentUserStore.currentUser == null) {
        return <Navigate to="/signin" />
    }
    

    //m-auto: 左右のマージンを自動で設定し、水平方向の中央揃えを行います
    // w-1/2: 幅を親要素の50%に設定します
    return(
        <div className="h-full max-h-full flex items-center justify-center overflow-hidden">
            <Card className="border-0 shadow-none w-19/20 sm:w-9/10 lg:w-3/5 gap-2">
                <CardHeader>
                    <CardTitle className="text-xl font-['Inter'] font-bold md:text-5xl font-medium tracking-wide text-center text-gray-800">
                        <img src={mealPlanner} alt="mealPlanner" className="h-30 m-auto" />
                    </CardTitle>
                    <CardDescription className="text-base md:text-2xl font-medium lg:mt-16 text-gray-500 text-center mb-4">
                        新しいレシピを追加しよう！
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3.5 border-2 border-gray-300 rounded-lg px-6 py-6 shadow-sm lg:gap-3.5">            
                    {/* categoryの入力欄を作成する */}
                    <div className="flex items-center gap-2.5">
                        <Select 
                            value={selectedCategory} 
                            onValueChange={(value) => setSelectedCategory(value)}
                            open={isSelectOpen}
                            onOpenChange={setIsSelectOpen}
                        >
                            {/* onTouchStart */}
                            <SelectTrigger 
                                className="w-[170px] bg-gray-100 focus:!outline-none focus-visible:!outline-none focus:!ring-1 focus:!ring-blue-500"
                                onTouchStart={() => {
                                    // スマホでキーボードが開いている場合は少し遅らせて閉じる
                                    if (document.activeElement && document.activeElement instanceof HTMLElement) {
                                        // タッチ開始から少し待ってからキーボードを閉じる
                                        setTimeout(() => {
                                            if (document.activeElement instanceof HTMLElement) {
                                                document.activeElement.blur();
                                            }
                                            // キーボードが閉じた後にSelectを開く
                                            setTimeout(() => {
                                                setIsSelectOpen(true);
                                            }, 200);
                                        }, 150);
                                    } else {
                                        // キーボードが開いていない場合は即座にSelectを開く
                                        setIsSelectOpen(true);
                                    }
                                }}
                            >
                                <SelectValue placeholder="カテゴリの選択" className="focus:outline-none focus:ring-1 focus:!ring-blue-500" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="肉料理" className="text-lg">肉料理</SelectItem>
                                <SelectItem value="魚料理" className="text-lg">魚料理</SelectItem>
                                <SelectItem value="丼・ルー料理" className="text-lg">丼・ルー料理</SelectItem>
                                <SelectItem value="麺料理" className="text-lg">麺料理</SelectItem>
                                <SelectItem value="小物" className="text-lg">小物</SelectItem>
                                <SelectItem value="その他" className="text-lg">その他</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-red-500 ml-2 text-base md:text-lg">※必須</span>
                    </div>
                    
                    {/* recipeTitleの入力欄・参照元の入力欄を作成する */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-4/5">
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="レシピのタイトルを入力" 
                                    value={recipeTitle} 
                                    onChange={(e) => setRecipeTitle(e.target.value)}
                                />
                            </div>
                            <div className="text-red-500 ml-2 text-base md:text-lg">※必須</div>
                        </div>

                        <div className="flex items-center gap-1 w-4/5">
                            <input 
                                type="text" 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="参照元（例：URL、書籍など）" 
                                value={source} 
                                onChange={(e) => setSource(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* createRecipeメソッドにはparams:RecipeParams型のオブジェクトを渡す */}
                    <Button 
                        onClick={() => createRecipe({title: recipeTitle, category: selectedCategory, source: source})}
                        className="w-[180px] mt-8 bg-green-500 mx-auto "
                        disabled={!recipeTitle.trim() || !selectedCategory}
                    >
                        <Plus className="h-4 w-4 text-white" />
                        <span className="text-white pr-2">Myレシピに追加</span>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}


/*

CategorySelectコンポーネントはカテゴリを選択するためのUIを提供する

<Select> : Select全体のラッパー。valueで現在の値を保持し、onValueChangeで変更時に親へ通知する
<SelectTrigger> : ドロップダウンを開くためのボタン。classNameで見た目や幅を指定できる
<SelectValue> : 現在選択されている値を表示する。選択前はplaceholderが表示される
<SelectContent> : ドロップダウンの中身。選択肢（SelectItem）が並ぶコンテナ
<SelectItem> : 実際の選択肢。valueがアプリ側で扱う値、テキストがユーザーに見えるラベル

*/
