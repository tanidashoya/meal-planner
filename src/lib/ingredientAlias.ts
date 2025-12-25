export type IngredientAliasRule = {
  pattern: RegExp; //正規表現パターン
  canonical: string; //正規化後の食材名
};

export const INGREDIENT_ALIAS_RULES: IngredientAliasRule[] = [
  { pattern: /豚こま切れ肉.*/, canonical: "豚こま" },
  { pattern: /豚こま肉.*/, canonical: "豚こま" },
  { pattern: /豚小間.*/, canonical: "豚こま" },
  { pattern: /豚こま切れ.*/, canonical: "豚こま" },
  { pattern: /豚ばら.*/, canonical: "豚ばら" },
  { pattern: /豚バラ.*/, canonical: "豚ばら" },
  { pattern: /豚バラ肉.*/, canonical: "豚ばら" },
  { pattern: /豚ロース.*/, canonical: "豚ロース" },
  { pattern: /豚ロース肉.*/, canonical: "豚ロース" },
  { pattern: /豚ひき.*/, canonical: "豚ひき肉" },
  { pattern: /豚ひき.*/, canonical: "豚ひき肉" },
  { pattern: /豚ミンチ.*/, canonical: "豚ひき肉" },

  // 牛肉系
  { pattern: /牛こま.*/, canonical: "牛こま" },
  { pattern: /牛コマ.*/, canonical: "牛こま" },
  { pattern: /牛こま肉.*/, canonical: "牛こま" },
  { pattern: /牛小間.*/, canonical: "牛こま" },
  { pattern: /牛こま切れ.*/, canonical: "牛こま" },
  { pattern: /牛こま切れ肉.*/, canonical: "牛こま" },
  { pattern: /牛ばら.*/, canonical: "牛ばら" },
  { pattern: /牛ばら肉.*/, canonical: "牛ばら" },
  { pattern: /牛バラ.*/, canonical: "牛ばら" },
  { pattern: /牛バラ肉.*/, canonical: "牛ばら" },
  { pattern: /牛ロース.*/, canonical: "牛ロース" },
  { pattern: /牛ロース肉.*/, canonical: "牛ロース" },
  { pattern: /牛ひき.*/, canonical: "牛ひき肉" },
  { pattern: /牛ミンチ.*/, canonical: "牛ひき肉" },

  // 鶏肉系
  { pattern: /鶏もも.*/, canonical: "鶏もも肉" },
  { pattern: /鶏むね.*/, canonical: "鶏むね肉" },
  { pattern: /鶏ひき.*/, canonical: "鶏ひき肉" },
  { pattern: /鶏ミンチ.*/, canonical: "鶏ひき肉" },
  { pattern: /ささみ.*/, canonical: "ささみ" },

  //その他肉
  { pattern: /ミンチ.*/, canonical: "ひき肉" },

  //魚
  { pattern: /鰤.*/, canonical: "ぶり" },

  //卵
  //   { pattern: /たまご.*/, canonical: "卵" },
  //   { pattern: /タマゴ.*/, canonical: "卵" },
  //   { pattern: /玉子.*/, canonical: "卵" },
  //   { pattern: /卵黄.*/, canonical: "卵" },
  //   { pattern: /卵黄.*/, canonical: "卵" },
  //   { pattern: /卵白.*/, canonical: "卵" },
  //   { pattern: /卵白.*/, canonical: "卵" },

  // ねぎ系
  { pattern: /白ねぎ.*/, canonical: "長ねぎ" },
  { pattern: /白ネギ.*/, canonical: "長ねぎ" },
  { pattern: /長ネギ.*/, canonical: "長ねぎ" },
  { pattern: /玉ネギ.*/, canonical: "玉ねぎ" },
  { pattern: /青ねぎ.*/, canonical: "青ねぎ" },
  { pattern: /青ネギ.*/, canonical: "青ねぎ" },
  { pattern: /万能ねぎ.*/, canonical: "万能ねぎ" },

  // 根菜類
  { pattern: /じゃが芋.*/, canonical: "じゃがいも" },
  { pattern: /さつま芋.*/, canonical: "さつまいも" },
  { pattern: /にんじん.*/, canonical: "にんじん" },
  { pattern: /人参.*/, canonical: "にんじん" },

  // 野菜類
  { pattern: /茄子.*/, canonical: "ナス" },
  { pattern: /なす.*/, canonical: "ナス" },
  { pattern: /ホウレンソウ.*/, canonical: "ほうれん草" },
  { pattern: /ホウレン草.*/, canonical: "ほうれん草" },
  { pattern: /しそ.*/, canonical: "大葉" },
  { pattern: /シソ.*/, canonical: "大葉" },
  { pattern: /にら.*/, canonical: "ニラ" },

  // 調味料
  { pattern: /みそ.*/, canonical: "味噌" },
];

// 単一トークンに対してエイリアス変換を行う
function normalizeToken(token: string): string {
  for (const rule of INGREDIENT_ALIAS_RULES) {
    if (rule.pattern.test(token)) return rule.canonical;
  }
  return token;
}

// 入力を分割し、各トークンにエイリアス変換を適用して結合する
export function normalizeIngredientByAlias(input: string): string {
  // スペース（全角・半角）、カンマ、読点などで分割
  const tokens = input.split(/[\s\u3000,、・]+/).filter(Boolean);
  if (tokens.length === 0) return input;

  // 各トークンにエイリアス変換を適用
  const normalizedTokens = tokens.map(normalizeToken);

  // スペース区切りで結合して返す
  return normalizedTokens.join(" ");
}
