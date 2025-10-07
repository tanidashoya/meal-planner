import {supabase} from "../../lib/supabase"
import {RecipeParams,updateRecipe} from "./recipe.entity"
//zodはバリデーションするためのライブラリ
//「このデータはこういう形であるべき」と定義して、フロントエンドやバックエンドでチェックできる
import {z} from "zod"


const CategorySchema = z.enum(["肉料理","魚料理","丼・ルー料理","麺料理","小物","その他"])

//ingregients:材料[{name:string,amount:string,unit:string}]
//steps:手順[手順１,手順２]
//paramsに渡されるのは一件追加であればオブジェクト、または複数件追加であればオブジェクトの配列
//from("recipes")はrecipesテーブルを参照する
//Supabase の .insert() が 基本的に配列を返す
/*
.insert() は オブジェクト単体でも配列でもOK
でも返り値は基本「配列」なので、.single() を付けないと [ { … } ] の形で返ってくる
複数件 insert する可能性があるなら、最初から [ { … } ] 形式で書いておくと後で修正が不要になる
*/
export const recipeRepository = {
    async create(userID: string, params: RecipeParams) {

        const parsedCategory = CategorySchema.safeParse(params.category)
        if (!parsedCategory.success) {
          throw new Error("値が正しくありません")
        }
        

        //.select:実際に挿入した行を返してくれるオプション
        const { data, error } = await supabase
          .from("recipes")
          .insert(
              [
              {
              user_id: userID,
              title: params.title,
              category: params.category,
              source: params.source
              }
              ]
            )
          .select().single()
      
        if (error !== null) throw new Error(error?.message)
        // 単発の場合はオブジェクトを返す、複数なら配列を返す
        return data
    },

    //update の引数に渡すのは「更新後にしたいデータを表すオブジェクト（またはオブジェクトの配列）」
    //params の中にある { rating: 3.5, title: "新しいタイトル" } などがそのまま更新される。
    //paramsはオブジェクトであることが前提
    //eq(第一引数, 第二引数) は 「第一引数のカラム名に対して、第二引数の値と一致する行を選ぶ」
    async update(userID:string,params:updateRecipe){
        const {data,error} = await supabase
          .from("recipes")
          .update(params)
          .eq("user_id",userID)
          .eq("id",params.id)
          .select()
          .single()
        if (error != null || data == null)
          throw new Error(error?.message)
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
        throw new Error(error?.message)
      }
      //更新後のデータを返す
      return data
    },

    //ratingを既存データからとってくる
    //dataは{ rating: number }というオブジェクトとして返ってくる
    async fetchRating(userID:string,id:number){
      const {data,error} = await supabase
        .from("recipes")
        //ratingカラムのみを取得(selectではなくselect("rating")とすることで返り値をratingカラムのみ取得する)
        // .select("rating")
        .select("*")
        .eq("user_id",userID)
        .eq("id",id)
        .single()
      if (error != null || data == null){
        throw new Error(error?.message)
      }
      return data
    },

    //ratingを既存データに追加する
    async updateTime(userID:string,id:number,time:number){
      const {data,error} = await supabase
        .from("recipes")
        //.update({ ... }) の {} 内のオブジェクトは 「更新したいカラム名: 値」 のペア
        //左側の rating → テーブルのカラム名
        //右側の rating → 関数の引数で受け取った変数
        //更新したいカラムを一つで固定しておく
        .update({time:time})
        .eq("user_id",userID)
        .eq("id",id)
        //seledtですべてのデータを取得しているため返り値は完全なレシピのデータをして返ってくる
        .select()
        //single()で返り値を配列ではなく、オブジェクトとして返ってくる
        .single()
      if (error != null || data == null){
        throw new Error(error?.message)
      }
      //更新後のデータを返す
      return data
    },

    //ratingを既存データからとってくる
    //dataは{ rating: number }というオブジェクトとして返ってくる
    async fetchTime(userID:string,id:number){
      const {data,error} = await supabase
        .from("recipes")
        //ratingカラムのみを取得(selectではなくselect("rating")とすることで返り値をratingカラムのみ取得する)
        .select("time")
        .eq("user_id",userID)
        .eq("id",id)
        .single()
      if (error != null || data == null){
        throw new Error(error?.message)
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
        throw new Error(error?.message)
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
        throw new Error(error?.message)
      }
      return data
    },

    //ユーザーの全てのレシピを取得
    //検索機能で使用する
    //findAllで取得してグローバルステートに保持したうえで検索する
    // メインページではサイドバーにユーザーのレシピ（category別）で折りたたまれるようにする
    async findAll(userID:string){
      const {data,error} = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id",userID)
        .select()
      if (error != null || data == null){
        throw new Error(error?.message)
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
        throw new Error(error?.message)
      }
      return data
    }


}