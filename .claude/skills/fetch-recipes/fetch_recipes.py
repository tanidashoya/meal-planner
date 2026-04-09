#!/usr/bin/env python3
"""
レシピ自動収集スクリプト
クラシル・クックパッドなどからレシピを取得し、TSV形式で出力
"""

import argparse
import uuid
import re
import sys
from typing import List, Dict
import unicodedata
import csv
from pathlib import Path
from scrape_nadia import scrape_nadia_recipe_urls_by_page
from scrape_nadia import scrape_nadia_recipe_detail


def chunked(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]



def convert_to_hiragana(text: str) -> str:
    if not text:
        return ""

    # ① 正規化（全角半角・濁点など）
    text = unicodedata.normalize("NFKC", text)

    # ② 記号・絵文字・装飾の除去
    text = re.sub(r"[!！?？・、。,（）()\[\]【】『』「」<>＜＞★☆♪♩♡♥︎]", "", text)

    result = []

    for char in text:
        code = ord(char)

        # ③ カタカナ → ひらがな
        if 0x30A1 <= code <= 0x30F6:
            result.append(chr(code - 0x60))
        else:
            result.append(char)

    # ④ 連続空白を1つに
    normalized = "".join(result)
    normalized = re.sub(r"\s+", " ", normalized)

    return normalized.strip()


def expand_steps(steps: list[str], max_steps: int = 18):
    data = {}
    for i in range(max_steps):
        key = f"step_{(i + 1) * 10}"
        data[key] = steps[i] if i < len(steps) else ""
    return data


def generate_recipe_data(platform: str, category: str, query:str, target_count: int, existing_urls: set[str]):
    recipes = []
    seen_urls = set(existing_urls)

    if platform != "ナディア":
        return recipes

    page = 1
    MAX_PAGES = 100

    while len(recipes) < target_count and page <= MAX_PAGES:
        urls = scrape_nadia_recipe_urls_by_page(category, page, query)

        if not urls:
            break

        for url in urls:
            if url in seen_urls:
                continue

            detail = scrape_nadia_recipe_detail(url)
            if not detail:
                continue

            step_data = expand_steps(detail.get("steps", []))

            recipe = {
                "id": str(uuid.uuid4()),
                "search_query": query or "",   # ★ 追加
                "title_original": detail["title_original"],
                "title_core": convert_to_hiragana(detail["title_original"]),
                "time": detail.get("time", ""),   # ★ 追加
                "description": detail["description"],
                "description_embedding": "",
                "category": category,
                "url": url,
                "ingredients_raw_text": detail["ingredients_raw_text"],
            }

            recipe.update(step_data)

            recipes.append(recipe)
            seen_urls.add(url)

            if len(recipes) >= target_count:
                break

        page += 1

    return recipes



def load_existing_urls(csv_path: str) -> set[str]:
    urls = set()
    if not csv_path:
        return urls
    path = Path(csv_path)
    if not path.exists():
        return urls
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            url = row.get("url")
            if url:
                urls.add(url.strip())
    return urls



def output_tsv(recipes: List[Dict[str, str]], output_file: str = None):
    headers = [
        "id", "search_query","title_original", "title_core","time", "description",
        "description_embedding", "category", "url", "ingredients_raw_text"
    ]
    headers += [f"step_{i}" for i in range(10, 181, 10)]

    lines = ["\t".join(headers)]

    for recipe in recipes:
        row = [recipe.get(h, "") for h in headers]
        lines.append("\t".join(row))

    output = "\n".join(lines)

    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"✅ {len(recipes)}件のレシピを {output_file} に保存しました", file=sys.stderr)
    else:
        print(output)

def append_existing_csv(csv_path: str, recipes: list[dict]):
    if not csv_path:
        return

    path = Path(csv_path)

    # ファイルがなければヘッダー作成
    is_new = not path.exists()

    with open(path, "a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["url"])
        if is_new:
            writer.writeheader()

        for r in recipes:
            writer.writerow({"url": r["url"]})



def append_to_sheets(recipes, sheet_id, sheet_name):
    import time
    import sys
    from pathlib import Path

    try:
        import gspread
        from oauth2client.service_account import ServiceAccountCredentials
    except ImportError:
        print("❌ gspreadライブラリが必要です", file=sys.stderr)
        sys.exit(1)

    # ===== 認証 =====
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
    ]

    cred_path = Path.home() / ".config/gspread/service_account.json"
    creds = ServiceAccountCredentials.from_json_keyfile_name(str(cred_path), scope)
    client = gspread.authorize(creds)

    spreadsheet = client.open_by_key(sheet_id)
    worksheet = spreadsheet.worksheet(sheet_name)

    # ===== 行データ作成 =====
    rows = []

    for recipe in recipes:
        row = [
            recipe["id"],
            recipe.get("search_query", ""),
            recipe["title_original"],
            recipe["title_core"],
            recipe.get("time", ""), 
            recipe["description"],
            recipe["description_embedding"],
            recipe["category"],
            recipe["url"],
            recipe["ingredients_raw_text"],
        ]

        for i in range(10, 181, 10):
            row.append(recipe.get(f"step_{i}", ""))

        rows.append(row)

    # ===== 再集計用 =====
    total_rows = len(rows)
    total_cols = len(rows[0]) if rows else 0
    chunk_size = 100

    request_count = 0
    written_rows = 0

    # ===== chunk append =====
    for i in range(0, total_rows, chunk_size):
        chunk = rows[i : i + chunk_size]

        worksheet.append_rows(chunk, value_input_option="RAW")

        written_rows += len(chunk)
        request_count += 1

        time.sleep(1)  # Sheets API 安定化用

    # ===== 最終ログ =====
    print(
        (
            "✅ Google Sheets 追記完了\n"
            f"   - 追記レシピ数: {written_rows}\n"
            f"   - 列数: {total_cols}\n"
            f"   - 書き込みリクエスト回数: {request_count}\n"
            f"   - chunk サイズ: {chunk_size}"
        ),
        file=sys.stderr,
    )



def main():
    
    
    parser = argparse.ArgumentParser(
        description='レシピ自動収集スクリプト',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  # TSVファイル出力
  python3 fetch_recipes.py --platform クラシル --category 肉料理 --count 10 --output recipes.tsv
  
  # 標準出力
  python3 fetch_recipes.py --platform クックパッド --category 魚料理 --count 5
  
  # Google Sheetsに追記
  python3 fetch_recipes.py --platform クラシル --category 肉料理 --count 10 --sheets-append
        """
    )
    
    parser.add_argument('--platform', required=True, 
                       help='プラットフォーム名（クラシル、クックパッドなど）')
    parser.add_argument('--category', required=True,
                       help='カテゴリ名（肉料理、魚料理、麺料理、丼・ルー料理、小物、その他）')
    parser.add_argument('--count', type=int, required=True,
                       help='取得件数')
    parser.add_argument('--output', 
                       help='出力ファイル名（省略時：標準出力）')
    parser.add_argument('--sheets-append', action='store_true',
                       help='Google Sheetsに直接追記')
    parser.add_argument('--sheet-id', default='1GKYL6QOZxJwAJcBEsXTq6Fzr5Vbmjc2p8MzCX1tiZgo',
                       help='追記先スプレッドシートID')
    parser.add_argument(
    "--queries",
    help="検索キーワード（カンマ区切り：例 鮭,鯖,ぶり）"
    )
    parser.add_argument(
    '--quiet',
    action='store_true',
    help='最小出力モード（Claude向け）。成功/失敗のみ出力'
    )
    parser.add_argument(
    '--existing-csv',
    help='既存レシピCSV（URL重複排除用）'
    )


    
    args = parser.parse_args()
    existing_urls = load_existing_urls(args.existing_csv)
    
    if args.queries:
        queries = [q.strip() for q in args.queries.split(",") if q.strip()]
    else:
        queries = [None]
    
    # # レシピデータ生成
    # print(f"🔍 {args.platform}の{args.category}を{args.count}件取得中...", file=sys.stderr)
    
    # recipes = generate_recipe_data(
    #     args.platform,
    #     args.category,
    #     args.count,
    #     existing_urls
    # )

    
    # if not recipes:
    #     print("NG", file=sys.stdout)
    #     sys.exit(1)
    print(f"🔍 {args.platform}の{args.category}を{args.count}件取得中...", file=sys.stderr)

    all_recipes = []

    for query in queries:
        recipes = generate_recipe_data(
            args.platform,
            args.category,
            query,
            args.count,
            existing_urls
        )

        if not recipes:
            continue

        all_recipes.extend(recipes)

        # ★ CSVに即反映（完全自動②の要）
        append_existing_csv(args.existing_csv, recipes)

        # ★ 次の query で重複しないように更新
        for r in recipes:
            existing_urls.add(r["url"])

    if not all_recipes:
        print("NG", file=sys.stdout)
        sys.exit(1)


    # 出力
    if args.sheets_append:
        append_to_sheets(all_recipes, args.sheet_id, args.category)
        if args.quiet:
            print("OK")
    else:
        if args.quiet:
            print("OK")
        else:
            output_tsv(all_recipes, args.output)



if __name__ == '__main__':
    main()
