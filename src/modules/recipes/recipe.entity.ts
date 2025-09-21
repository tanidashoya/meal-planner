// note.entity.ts は独自で作った型定義を入れていくファイル

import {Database} from "../../../database.types"


// 出典の型定義
// export type RecipeSource =
//   | { type: "url"; value: string }
//   | { type: "book"; title: string; page: number }

// メインのRecipe型（Database型を拡張）
// データベースから取得したデータを表現する型

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"]

// Repository用の型（オプショナル版）
//データベースに保存するデータを表現する型
//新規作成・更新時のパラメータ
export type RecipeParams = {
  title?: string
  category?: string
  source?: string
  rating?: number
}

export type updateRecipe = {
  id: number
  title?: string
  category?: string
  source?: string
  rating?: number
}