import pandas as pd
import json
import re
import math

excel_file = 'BISNIS_GEMARTOPUP_ANALISIS.xlsx'
xl = pd.ExcelFile(excel_file)

games_dict = {}
products_dict = {}

def get_category_and_zone(name):
    name_lower = name.lower()
    if any(x in name_lower for x in ['pulsa', 'pln', 'indosat', 'xl', 'axis', 'tri', 'smartfren', 'byu', 'telkomsel']):
        category = 'pulsa'
    elif any(x in name_lower for x in ['voucher', 'google play', 'steam', 'itunes', 'nintendo', 'spotify', 'vidio', 'xbox', 'hotelmurah']):
        category = 'voucher'
    else:
        category = 'game'
        
    if any(x in name_lower for x in ['mlbb', 'mobile legend', 'genshin', 'honkai', 'gi', 'hsr', 'ragnarok', 'aov', 'call of duty']):
        has_zone = True
    else:
        has_zone = False
        
    return category, has_zone

for sheet in xl.sheet_names:
    if sheet in ['Dashboard', 'Analisis Detail', 'Catatan & Asumsi', 'Gontak Whatsapp dan SMS Gateway']:
        continue
        
    df = pd.read_excel(excel_file, sheet_name=sheet)
    if 'LAYANAN' not in df.columns or 'HARGA SILVER' not in df.columns:
        continue

    # Extract base game name by removing provider names
    game_name = sheet.upper()
    providers = ['INDOFLAZZ', 'INDOFLAZ', 'INDOLAZ', 'IND', 'OURA STORE', 'OURASTORE', 'OUR', 'EMPESHOP', 'EMPE SHOP']
    for p in providers:
        if game_name.endswith(p):
            game_name = game_name[:-len(p)].strip()
            break
            
    if not game_name:
        continue
        
    game_id = game_name.lower().replace(' ', '-').replace(':', '').replace('.', '')
    
    if game_id not in games_dict:
        category, has_zone = get_category_and_zone(game_name)
        games_dict[game_id] = {
            "id": game_id,
            "name": game_name,
            "code": game_name.upper(),
            "status": "ACTIVE",
            "category": category,
            "hasZone": has_zone
        }
        products_dict[game_id] = {}

    for idx, row in df.iterrows():
        try:
            product_name = str(row['LAYANAN'])
            if pd.isna(row['HARGA SILVER']) or not product_name or product_name == 'nan':
                continue
            
            price_str = str(row['HARGA SILVER']).replace('Rp', '').replace('.', '').replace(',', '').strip()
            if not price_str or price_str == 'nan':
                continue
            price = int(price_str)
            
            if product_name not in products_dict[game_id]:
                products_dict[game_id][product_name] = price
            else:
                if price < products_dict[game_id][product_name]:
                    products_dict[game_id][product_name] = price
        except Exception as e:
            pass

games = list(games_dict.values())
games.sort(key=lambda x: x["name"])

products = {}
for gid, prods in products_dict.items():
    sheet_products = []
    p_id = 1
    for p_name, p_price in prods.items():
        badge = None
        if 'pass' in p_name.lower() or 'weekly' in p_name.lower():
            badge = 'promo'
        sheet_products.append({
            "id": p_id,
            "name": p_name,
            "price": p_price,
            "badge": badge
        })
        p_id += 1
    products[gid] = sheet_products

catalog = {
    "games": games,
    "products": products
}

import os
os.makedirs('src/data', exist_ok=True)
with open('src/data/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("Catalog generated successfully!")
