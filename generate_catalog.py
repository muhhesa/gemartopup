import pandas as pd
import json
import re
import math

excel_file = 'BISNIS_GEMARTOPUP_ANALISIS.xlsx'
xl = pd.ExcelFile(excel_file)

games = []
products = {}

def get_category_and_zone(name):
    name_lower = name.lower()
    
    # Category
    if any(x in name_lower for x in ['pulsa', 'pln', 'indosat', 'xl', 'axis', 'tri', 'smartfren', 'byu']):
        category = 'pulsa'
    elif any(x in name_lower for x in ['voucher', 'google play', 'steam', 'itunes', 'nintendo', 'spotify', 'vidio', 'xbox']):
        category = 'voucher'
    else:
        category = 'game'
        
    # Has Zone
    if any(x in name_lower for x in ['mlbb', 'mobile legend', 'genshin', 'honkai', 'gi', 'hsr', 'ragnarok']):
        has_zone = True
    else:
        has_zone = False
        
    return category, has_zone

for sheet in xl.sheet_names:
    if 'INDOFLAZ' in sheet.upper():
        game_name = sheet.upper().replace('INDOFLAZZ', '').replace('INDOFLAZ', '').strip()
        if not game_name:
            continue
            
        game_id = game_name.lower().replace(' ', '-').replace(':', '').replace('.', '')
        
        category, has_zone = get_category_and_zone(game_name)
        
        games.append({
            "id": game_id,
            "name": game_name,
            "code": game_name.upper(),
            "status": "ACTIVE",
            "category": category,
            "hasZone": has_zone
        })
        
        df = pd.read_excel(excel_file, sheet_name=sheet)
        
        sheet_products = []
        # Ensure it has LAYANAN and HARGA SILVER
        if 'LAYANAN' in df.columns and 'HARGA SILVER' in df.columns:
            has_pid = 'PID' in df.columns
            
            # Find duplicate names to selectively append suffixes
            name_counts = df['LAYANAN'].astype(str).value_counts().to_dict()
            
            for idx, row in df.iterrows():
                try:
                    original_name = str(row['LAYANAN'])
                    product_name = original_name
                    
                    # Only append suffix if the name appears more than once
                    if has_pid and not pd.isna(row['PID']) and name_counts.get(original_name, 0) > 1:
                        pid_str = str(row['PID'])
                        if '-' in pid_str:
                            suffix = pid_str.split('-')[-1]
                            product_name += f" ({suffix})"
                            
                    if pd.isna(row['HARGA SILVER']):
                        continue
                    price_str = str(row['HARGA SILVER']).replace('Rp. ', '').replace('.', '').strip()
                    if not price_str or price_str == 'nan':
                        continue
                    price = int(price_str)
                    
                    # Badge logic
                    badge = None
                    if 'pass' in product_name.lower() or 'weekly' in product_name.lower():
                        badge = 'promo'
                    
                    sheet_products.append({
                        "id": int(idx + 1),
                        "name": product_name,
                        "price": price,
                        "badge": badge
                    })
                except Exception as e:
                    pass
        
        products[game_id] = sheet_products

# Sort games alphabetically by name
games.sort(key=lambda x: x["name"])

catalog = {
    "games": games,
    "products": products
}

import os
os.makedirs('src/data', exist_ok=True)
with open('src/data/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

print("Catalog generated successfully!")
