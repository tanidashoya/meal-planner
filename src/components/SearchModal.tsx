import { useState } from "react"
import { Recipe } from "../modules/recipes/recipe.entity"
import { CommandDialog, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"

interface SearchModalProps {
    isOpen:boolean,
    recipes:Recipe[],
    onClose:() => void,
    onItemSelect:(recipeId:number) => void,
    onKeywordChanged:(keyword:string) => void,
}

export const SearchModal = ({isOpen,recipes,onClose,onItemSelect,onKeywordChanged}:SearchModalProps) => {
    //キーワード入力欄の状態を管理する
    const [keyword,setKeyword] = useState("")
    
    const handleKeywordChanged = (value: string) => {
        setKeyword(value)
        onKeywordChanged(value)
        if (keyword == "") {
          onKeywordChanged("")
        }
    }
    
    // モーダルを閉じる時にキーワードをクリアする関数
    const handleClose = () => {
        setKeyword("")
        onKeywordChanged("")
        onClose()
    }

    const handleItemSelect = (recipeId:number) => {
      onItemSelect(recipeId)
      handleClose()
    }

    return (
      //open:モーダルが開いているかどうか
      //onOpenChange:モーダルが開いたり閉じたりした時に実行される関数
      <CommandDialog open={isOpen} onOpenChange={handleClose}>
        <Command shouldFilter={false}>
          {/* キーワードを入力するとonValueChangeが実行される(普通のコンポーネントのonChangeと同じ) */}
          {/* CommandItemコンポーネントのonSelectプロパティはユーザーがマウスクリック、Enterキー、方向キー + Enterキー（キーボードナビゲーション）で実行される */}
          <CommandInput
            placeholder={'キーワードで検索'}
            value={keyword}
            //onValueChange:キーワードが入力された時に実行される関数
            onValueChange={handleKeywordChanged}
            className="py-12 text-lg"
          />
          {/* 検索結果をスクロールできるように */}
          <CommandList className="max-h-[35vh] md:max-h-[70vw] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overscroll-contain touch-pan-y">
            <CommandEmpty className="text-center text-lg p-4 text-gray-500">条件に一致するノートがありません</CommandEmpty>
            <CommandGroup>
              {recipes?.map((recipe) => (
                <CommandItem
                  key={recipe.id}
                  title={recipe.title ?? '無題'}
                  onSelect={() => handleItemSelect(recipe.id)}
                  
                >
                  <span className="text-lg">{recipe.title ?? '無題'}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    )
}


/*
CommandDialog:
ダイアログのラッパー。openで開閉を制御し、onOpenChangeで開閉状態を変更する。
イメージ: モーダルウィンドウの外枠。

Command:
コマンドパレットの本体。検索欄・リスト・アイテムを包括するコンテナ。
shouldFilter={false} → デフォルトのフィルタリングをオフにして自前の検索処理を使う。
イメージ: 検索＋結果リストをまとめる箱。

CommandInput:
ユーザーが検索キーワードを入力する入力欄。
placeholder → ヒント文字。
onValueChange → 入力文字が変わるたびに呼ばれる（onChangeとほぼ同じ）。
イメージ: 検索バー。

CommandList:
検索結果や候補を表示するリスト領域。
イメージ: 検索候補の一覧。

CommandEmpty:
検索結果がゼロ件のときに表示されるプレースホルダー。
イメージ: 「見つかりません」のメッセージ。

CommandGroup:
「検索候補をまとめるグループ」
ここに複数の <CommandItem> を並べる
recipes（配列）を 1件ずつ回して CommandItem を生成している

CommandItem:
実際の候補アイテム。ユーザーがクリックやEnterで選択可能。
props: onSelect → アイテム選択時に呼ばれる。(onClickに近い) title → ホバー時に表示される。
イメージ: 1つの候補。
*/