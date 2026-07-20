import pandas as pd
import json
import re
import math

excel_file = 'BISNIS_GEMARTOPUP_ANALISIS.xlsx'
xl = pd.ExcelFile(excel_file)

games_list = []
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
    # Skip info sheets
    if sheet in ['Dashboard', 'Analisis Detail', 'Catatan & Asumsi', 'Gontak Whatsapp dan SMS Gateway']:
        continue
        
    # Skip competitor/research sheets
    sheet_upper = sheet.upper()
    if any(comp in sheet_upper for comp in ['OURA', 'EMPE']):
        continue
        
    df = pd.read_excel(excel_file, sheet_name=sheet)
    if 'LAYANAN' not in df.columns or 'HARGA SILVER' not in df.columns:
        continue

    # Extract base game name by removing provider suffix
    game_name = sheet_upper
    providers = ['INDOFLAZZ', 'INDOFLAZ', 'INDOLAZ', 'IND']
    for p in providers:
        if game_name.endswith(p) or game_name.endswith(p + " "):
            game_name = game_name[:game_name.rfind(p)].strip()
            break
            
    if not game_name:
        continue
        
    game_id = game_name.lower().replace(' ', '-').replace(':', '').replace('.', '')
    
    category, has_zone = get_category_and_zone(game_name)
    games_list.append({
        "id": game_id,
        "name": game_name,
        "code": game_name.upper(),
        "status": "ACTIVE",
        "category": category,
        "hasZone": has_zone
    })
    
    sheet_products = []
    p_id = 1
    
    # Track added product names to avoid exact duplicates (same name and price)
    # But if same name and different price, keep both or cheapest? The user said "paket per paketnya"
    # To be perfectly safe and match the Excel exactly, we append everything except identical rows.
    seen = set()
    
    for idx, row in df.iterrows():
        try:
            product_name = str(row['LAYANAN'])
            if pd.isna(row['HARGA SILVER']) or not product_name or product_name == 'nan':
                continue
            
            price_str = str(row['HARGA SILVER']).replace('Rp', '').replace('.', '').replace(',', '').strip()
            if not price_str or price_str == 'nan':
                continue
            price = int(price_str)
            
            unique_key = f"{product_name}_{price}"
            if unique_key in seen:
                continue
            seen.add(unique_key)
            
            badge = None
            if 'pass' in product_name.lower() or 'weekly' in product_name.lower():
                badge = 'promo'
                
            sheet_products.append({
                "id": p_id,
                "name": product_name,
                "price": price,
                "badge": badge
            })
            p_id += 1
        except Exception as e:
            pass
            
    products_dict[game_id] = sheet_products

games = games_list
games.sort(key=lambda x: x["name"])

products = products_dict

catalog = {
    "games": games,
    "products": products
}

import os
os.makedirs('src/data', exist_ok=True)
with open('src/data/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("Catalog generated successfully!")
