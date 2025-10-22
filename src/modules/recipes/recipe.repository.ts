import {supabase} from "../../lib/supabase"
import {RecipeParams,updateRecipe} from "./recipe.entity"
//zodはバリデーションするためのライブラリ
//「このデータはこういう形であるべき」と定義して、フロントエンドやバックエンドでチェックできる
import {z} from "zod"

//z.enumは特定の文字列の集合だけを許可する型を定義()
const CategorySchema = z.enum(["肉料理","魚料理","丼・ルー料理","麺料理","小物","その他"])


/*
.insert() は オブジェクト単体でも配列でもOK
でも返り値は基本「配列」なので、.single() を付けないと [ { … } ] の形で返ってくる
複数件 insert する可能性があるなら、最初から [ { … } ] 形式で書いておくと後で修正が不要になる
*/
export const recipeRepository = {
    async create(userID: string, params: RecipeParams) {

        const isURL = (url: string | null) => {
          try {
            new URL(url || "");
            return true;
          } catch {
            return false;
          }
        };

        if (!params.category) {
          throw new Error("カテゴリは必須です")
        }
        if (!params.title) {
          throw new Error("タイトルは必須です")
        }
        //safeParse() は 例外を投げない 代わりに、成功・失敗の結果をオブジェクトで返す
        const parsedCategory = CategorySchema.safeParse(params.category)
        if (!parsedCategory.success) {
          throw new Error("値が正しくありません")
        }
        //undefined → JavaScriptの内部的な「欠損」
        // null → SQLでも理解できる「空」
        //sourceValueがundefinedの場合はnullとして扱う
        //任意入力OK（空欄OK）の値はundefinedになる可能性があり、undefinedはnullとして扱う
        /*
          他のタイトルやカテゴリは型生成で?と | null としているためundefinedとなる可能性が想定されていないため、null変換が不要
          source も同様の型生成がされているが外部サイトのURL（任意入力）であり、undefinedになることが想定されるため、null変換が必要。
          IDE（TypeScript言語サーバー）は「undefinedが来る可能性がある」と予測して警告を出してくれている、というのが本質です。
        */
        const sourceValue = params.source ?? null
        //重複チェック（sourceValueが存在して、空ではなく、URLであることを確認）
        if (sourceValue && sourceValue.trim() !== "" && isURL(sourceValue)) {
            const {data:existingData,error:existingError} = await supabase
              .from("recipes")
              .select("*")
              .eq("user_id",userID)
              .eq("source",sourceValue ?? "")
              .single()
            if (existingData != null && existingError == null) {
              throw new Error("そのレシピは既に存在しています")
          }
        }
      
        //.select:実際に挿入した行を返してくれるオプション
        const { data, error } = await supabase
          .from("recipes")
          .insert(
                {
                  user_id: userID,
                  title: params.title,
                  category: params.category,
                  source: sourceValue
                }
            )
          .select().single()
      
        if (error !== null) {
          console.error(error.message)
          throw new Error("レシピの追加に失敗しました")
        }
        // 単発の場合はオブジェクトを返す、複数なら配列を返す
        return data
    },

    //update の引数に渡すのは「更新後にしたいデータを表すオブジェクト（またはオブジェクトの配列）」
    //params の中にある { rating: 3.5, title: "新しいタイトル" } などがそのまま更新される。
    //paramsはオブジェクトであることが前提
    async update(userID:string,params:updateRecipe){
        const {data,error} = await supabase
          .from("recipes")
          .update(params)
          .eq("user_id",userID)
          .eq("id",params.id)
          .select()
          .single()
        if (error != null || data == null){
          console.error(error?.message)
          throw new Error("レシピの更新に失敗しました")
        }
        return data
    },

    //ratingを既存データに追加する
    async updateRating(userID:string,id:number,rating:number){
      const {data,error} = await supabase
        .from("recipes")
        //.update({ ... }) の {} 内のオブジェクトは 「更新したいカラム名: 値」 のペア
        //左側の rating → テーブルのカラム名
        //右側の rating → 関数の引数で受け取った変数
        //更新したいカラムを一つで固定しておく
        .update({rating:rating})
        .eq("user_id",userID)
        .eq("id",id)
        //seledtですべてのデータを取得しているため返り値は完全なレシピのデータをして返ってくる
        .select()
        //single()で返り値を配列ではなく、オブジェクトとして返ってくる
        .single()
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピの評価更新に失敗しました")
      }
      //更新後のデータを返す
      return data
    },

    //ratingを既存データからとってくる
    //dataは{ rating: number }というオブジェクトとして返ってくる
    //関数名はfetchRatingとしているが、rating以外の指定したレシピデータを取得している
    async fetchRating(userID:string,id:number){
      const {data,error} = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id",userID)
        .eq("id",id)
        .single()
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピの評価取得に失敗しました")
      }
      return data
    },

    //timeを既存データに追加する
    async updateTime(userID:string,id:number,time:number){
      const {data,error} = await supabase
        .from("recipes")
        .update({time:time})
        .eq("user_id",userID)
        .eq("id",id)
        .select()
        .single()
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピの時間更新に失敗しました")
      }
      //更新後のデータを返す
      return data
    },

    async fetchTime(userID:string,id:number){
      const {data,error} = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id",userID)
        .eq("id",id)
        .single()
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピの時間取得に失敗しました")
      }
      return data
    },


    
    //レシピの評価を更新する
    //deleteは引数なしで呼ぶ
    async delete(userID:string,id:number){
      const {error} = await supabase
        .from("recipes")
        .delete()
        .eq("user_id",userID)
        .eq("id",id)
      if (error != null){
        console.error(error?.message)
        throw new Error("レシピの削除に失敗しました")
      }
    },

    //レシピの詳細を取得
    //呼び出しもとではuseParamsを使ってURLからidを取得する
    //findOneで取得してグローバルステートに保持したうえで詳細ページに表示する
    async findOne(userID:string,id:number){
      const {data,error} = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id",userID)
        .eq("id",id)
        .single()
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピの詳細取得に失敗しました")
      }
      return data
    },

    //ユーザーの全てのレシピを取得
    //検索機能で使用する
    //findAllで取得してグローバルステートに保持したうえで検索する
    // メインページではサイドバーにユーザーのレシピ（category別）で折りたたまれるようにする
    //Supabase の .select() は ―条件に合うデータが1件もなくても「空配列 []」を返します。
    //null にはなりません（エラーでない限り）。
    async findAll(userID:string){
      const {data,error} = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id",userID)
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピの全件取得に失敗しました")
      }
      return data
    },

    //キーワードで検索
    //ilike("title",`%{keyword}%`)はtitleカラムに対して、keywordを含む行を選ぶ
    //%は任意の文字列を表す
    async findByKeyword(userID:string, keyword:string){
      const {data,error} = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id",userID)
        .ilike("title",`%${keyword}%`)
        .select()
      if (error != null || data == null){
        console.error(error?.message)
        throw new Error("レシピのキーワード検索に失敗しました")
      }
      return data
    }


}