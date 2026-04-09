import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ja-JP,ja;q=0.9",
}

def scrape_nadia_recipe_urls_by_page(category: str, page: int, query: str = None):
    urls = []
    if query:
        keywords = [query]
    else:
        keyword_map = {
            "肉料理": ["肉"],
            "魚料理": ["魚"],
            "麺料理": ["麺", "パスタ", "うどん", "そば", "ラーメン", "そうめん", "冷麺"],
            "丼・ルー料理": ["丼", "カレー", "シチュー", "ハヤシ", "グラタン", "ドリア"],
            "小物": ["副菜", "サラダ", "おかず"],
            "汁物": ["汁物", "スープ", "味噌汁", "お吸い物", "ポタージュ"],
            "その他": [""],
        }
        keywords = keyword_map.get(category, [""])

    for keyword in keywords:
        list_url = f"https://oceans-nadia.com/search?q={keyword}&page={page}"
        try:
            r = requests.get(list_url, headers=HEADERS, timeout=(3, 7))
        except Exception:
            continue
        if r.status_code != 200:
            continue

        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.select("a[href*='/recipe/']"):
            href = a.get("href")
            if not href:
                continue
            full_url = href if href.startswith("http") else f"https://oceans-nadia.com{href}"
            if full_url not in urls:
                urls.append(full_url)

    return urls

def scrape_nadia_recipe_detail(url: str):
    try:
        r = requests.get(url, headers=HEADERS, timeout=(3, 7))
    except Exception:
        return None
    if r.status_code != 200:
        return None

    soup = BeautifulSoup(r.text, "html.parser")

    title = ""
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(strip=True)

    time_minutes = ""
    time_wrap = soup.select_one('div[class^="RecipeInfo_timeWrapper"]')
    if time_wrap:
        time_minutes = time_wrap.get_text(strip=True)

    description = ""
    desc = soup.select_one('div[class^="RecipeDesc_box"] p')
    if desc:
        description = desc.get_text(strip=True)

    ingredients = []
    for li in soup.select('ul[class^="IngredientsList_list"] li'):
        name_el = li.select_one('div[class^="IngredientsList_ingredient"]')
        amount_el = li.select_one('div[class^="IngredientsList_amount"]')
        if not name_el:
            continue
        name = name_el.get_text(strip=True)
        amount = amount_el.get_text(strip=True) if amount_el else ""
        ingredients.append(f"{name} {amount}".strip())

    steps = []
    for p in soup.select('ul[class^="CookingProcess_list"] p'):
        text = p.get_text(strip=True)
        if not text:
            continue
        text = re.sub(r"^[0-9０-９]+[\.．]?\s*", "", text)
        steps.append(text)
    steps = list(dict.fromkeys(steps))

    return {
        "title_original": title,
        "description": description,
        "time": time_minutes,
        "ingredients_raw_text": ",\n".join(ingredients),
        "steps": steps,
    }
