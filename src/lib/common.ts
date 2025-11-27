import { z } from "zod";

//URLのバリデーション
const isURLSchema = z.url("正しいURLを入力してください").startsWith("http");

export const isURL = (url: string | null) => {
  if (!url) return false;
  //zodではtry-catchを使わずにsafeParse()を使用することで、例外を投げない代わりに、成功・失敗の結果をオブジェクトで返すことができる
  return isURLSchema.safeParse(url).success;
};

export type IsURLInput = z.infer<typeof isURLSchema>;
