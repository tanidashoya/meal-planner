# レシピ自動収集スキル

## 概要

ナディア（Nadia）からレシピを自動取得し、Google SheetsまたはTSVファイルに出力するスキルです。

## ファイル構成

```
.claude/skills/fetch-recipes/
├── SKILL.md              # Claude Code用スキル定義
├── fetch_recipes.py      # メインスクリプト
├── scrape_nadia.py       # ナディアスクレイピング
└── README.md             # このファイル
```

---

## 対応プラットフォーム

- **ナディア**（https://oceans-nadia.com）

---

## 対応カテゴリ

| カテゴリ | 検索キーワード |
|---------|---------------|
| 肉料理 | 肉 |
| 魚料理 | 魚 |
| 麺料理 | 麺 |
| 丼・ルー料理 | 丼 |
| 小物 | 副菜 |
| その他 | （空） |

---

## コマンドオプション

```bash
python3 fetch_recipes.py [OPTIONS]

必須オプション:
  --platform PLATFORM    プラットフォーム名（現在はナディアのみ）
  --category CATEGORY    カテゴリ名
  --count COUNT          取得件数

出力オプション:
  --output FILE          TSVファイル出力（省略時：標準出力）
  --sheets-append        Google Sheetsに直接追記

その他:
  --existing-csv FILE    既存レシピCSV（URL重複排除用）
  --sheet-id ID          追記先スプレッドシートID
  --quiet                最小出力モード（成功/失敗のみ）
```

---

## 使用例

### Google Sheetsに追記（重複排除あり）

```bash
python3 ./.claude/skills/fetch-recipes/fetch_recipes.py \
  --platform "ナディア" \
  --category "肉料理" \
  --count 50 \
  --existing-csv '/path/to/existing.csv' \
  --sheets-append \
  --quiet
```

### TSVファイル出力

```bash
python3 ./.claude/skills/fetch-recipes/fetch_recipes.py \
  --platform "ナディア" \
  --category "魚料理" \
  --count 10 \
  --output recipes.tsv
```

---

## 出力データ項目

| 列 | 項目名 | 説明 |
|---|--------|------|
| A | id | UUID v4形式 |
| B | title_original | レシピ正式タイトル |
| C | title_core | ひらがな検索用タイトル |
| D | description | 説明文 |
| E | description_embedding | 空欄（後処理用） |
| F | category | カテゴリ名 |
| G | url | レシピURL |
| H | ingredients_raw_text | 材料リスト（改行区切り） |
| I〜 | step_10〜step_180 | 調理手順（最大18ステップ） |

---

## Google Sheets連携の設定

### 1. ライブラリインストール

```bash
pip install gspread oauth2client requests beautifulsoup4
```

### 2. サービスアカウント設定

1. Google Cloud Platformでサービスアカウントを作成
2. JSONキーをダウンロード
3. 以下に配置：

```bash
mkdir -p ~/.config/gspread
mv ~/Downloads/service-account-key.json ~/.config/gspread/service_account.json
```

### 3. スプレッドシートに権限付与

サービスアカウントのメールアドレスを対象シートに編集者として追加。

---

## 重複排除

`--existing-csv` で指定したCSVファイルに含まれるURLは取得対象から除外されます。
CSVファイルには `url` カラムが必要です。

---

## 注意事項

- スクレイピングはサイトの利用規約に従って使用してください
- 大量取得時はサーバーへの負荷を考慮してください
- ナディアのHTML構造変更により動作しなくなる可能性があります
