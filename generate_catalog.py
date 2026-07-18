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
            
            unique_products = {}
            for idx, row in df.iterrows():
                try:
                    product_name = str(row['LAYANAN'])
                    
                    if pd.isna(row['HARGA SILVER']):
                        continue
                    
                    # Filter out anomalous 5 Diamond
                    if product_name.strip() == '5 Diamond' and game_id not in ['mlbb', 'ff', 'free-fire']:
                        continue
                        
                    price_str = str(row['HARGA SILVER']).replace('Rp. ', '').replace('.', '').strip()
                    if not price_str or price_str == 'nan':
                        continue
                    price = int(price_str)
                    
                    if product_name not in unique_products:
                        unique_products[product_name] = price
                    else:
                        if price < unique_products[product_name]:
                            unique_products[product_name] = price
                except Exception as e:
                    pass
            
            p_id = 1
            for p_name, p_price in unique_products.items():
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
