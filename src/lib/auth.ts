// src/lib/validations/auth.ts
import { z } from "zod";

//バリデーションエンジン = “入力された値が正しいかどうか判定する仕組み”（z.email()これら一つ一つがバリデーションエンジン）
//z.object() は “複数のバリデーションエンジン（バリデーションの定義ルール）をひとつにまとめる装置”
//z.object({})はオブジェクトのバリデーションエンジンとして扱うスキーマを作る。
//Zod の本体は
// 入力データのバリデーション（検証）と型推論（型生成）を同時に行う仕組み
// その中心にあるのが z.object()
//サインインのバリデーション
export const signInSchema = z.object({
  email: z.string().trim().email("正しいメールアドレス形式で入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .min(6, "パスワードは6文字以上で入力してください"),
});

//サインアップのバリデーション
//refine はスキーマのメソッドで「そのスキーマが表すデータに対して追加の条件を課すメソッド」
//refine((data) => ...) の data には z.object({ ... }) が受け取った “オブジェクト全体（name,email,password,confirmPasswordのオブジェクト）” が渡される。
//refineの第1引数（コールバック関数）には “そのスキーマ全体の値（オブジェクト）” が渡されて条件を定義する
//refineの第2引数（オブジェクト）には “エラーメッセージ、第3引数にはエラーの紐づけ先（path）も指定できるオプション
//path とは「どのフィールドにエラーを紐づけて表示するか」を指定するもの。ここでは👉 「エラーを confirmPassword フィールドに出してね」
export const signUpSchema = z
  .object({
    name: z
      .string() //string()は文字列でなければいけないというZodのバリデーションエンジンを作る。そのバリデーションエンジンをもとにz.infer<typeof signUpSchema>でTypeScriptの型を生成する。
      .trim()
      .min(1, "名前を入力してください")
      .min(2, "名前は2文字以上で入力してください")
      .max(20, "名前は20文字以内で入力してください"),
    email: z
      .string()
      .trim()
      .email("正しいメールアドレス形式で入力してください"),
    password: z
      .string()
      .trim()
      .min(1, "パスワードを入力してください")
      .min(6, "パスワードは6文字以上で入力してください")
      .max(20, "パスワードは20文字以内で入力してください")
      .regex(
        //正規表現でパスワードの形式を指定（英字と数字を含む必要があります）
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "パスワードは英字と数字を含む必要があります"
      ),
    confirmPassword: z
      .string()
      .trim()
      .min(1, "確認用パスワードを入力してください")
      .max(20, "確認用パスワードは20文字以内で入力してください"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

//サインインのバリデーションの型
//z.infer<typeof signInSchema>はsignInSchemaの型を返す
export type SignInInput = z.infer<typeof signInSchema>;
//サインアップのバリデーションの型
//z.infer<typeof signUpSchema>はsignUpSchemaの型を返す
export type SignUpInput = z.infer<typeof signUpSchema>;

//正規表現（regex）
//① ^
// → 文字列の先頭
// これは 「先頭から評価する」 という意味。
// ② (?= … )（肯定先読み = positive lookahead）
// 「この条件を満たす必要がある」
// だけど実際の文字を消費しない（後で全体を評価する）
// という仕組み。
// ③ (?=.*[A-Za-z])
// . → どんな1文字でも
// * → 0文字以上繰り返しても良い、途中に何があってもいい
// [A-Za-z] → 英字（大文字 or 小文字）
// 👉 **「どこかに英字が最低1つ存在するか」
// ④ (?=.*\d)
// \d は 数字 0〜9 の意味。
// したがって：
// 👉 「どこかに数字が最低1つ存在するか」
