//ユーザーからの入力を正規化するための関数
export function normalize(text: string): string {
  return (
    text
      .toLowerCase() //小文字に変換
      // 全角英数字 → 半角英数字
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      )
      // 全角カタカナ → ひらがな（ァ-ヶ: U+30A1-U+30F6）
      .replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60))
      // 長音記号「ー」→ ひらがなの「ー」として保持（または削除せず残す）
      .replace(/ー/g, "ー")
      // ひらがな、長音記号、英数字以外を削除
      //正規表現の [^...] は「〜以外」を意味
      .replace(/[^ぁ-んa-z0-9ー]/g, "")
      .trim() //前後の空白を削除
  );
}
