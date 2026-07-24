import pandas as pd
import json
import re

with open(r'D:\MUH HERI SAHAR\CODING\gemartopup-main\gemartopup-main\src\data\catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

df = pd.read_excel(r'C:\Users\MyPC PRO\Downloads\gemartopup-fix\Daftar Harga Jokemon.xlsx', header=1)

def clean_price(val):
    if pd.isna(val): return 0
    s = str(val).replace('Rp', '').replace('.', '').strip()
    try:
        return int(s)
    except:
        return 0

df['Harga Tamu'] = df['Harga Tamu'].apply(clean_price)
df['Member'] = df['Member'].apply(clean_price)

# Mapping our game_id to their SKU prefix
game_prefixes = {
    'mlbb': ['ML', 'MOBILELEGEND'],
    'ff': ['FF', 'FREEFIRE'],
    'pubg': ['PUBG'],
    'valo': ['VALO'],
    'genshin': ['GENSHIN', 'GI'],
    'aov': ['AOV'],
    'call-of-duty-mobile': ['CODM']
}

results = []

for game_id, products in catalog['products'].items():
    prefixes = game_prefixes.get(game_id, [])
    if not prefixes: continue
    
    # Filter Jokemon df for this game
    # Either SKU starts with prefix, or Nama Layanan contains it
    mask = df['Kode / SKU'].astype(str).str.upper().apply(lambda x: any(x.startswith(p) for p in prefixes))
    game_df = df[mask]
    
    for p in products:
        our_name = p['name'].lower()
        # Extract numbers from our item name (e.g. "5 Diamonds" -> 5)
        nums = re.findall(r'\b\d+\b', our_name)
        if not nums: continue
        target_num = nums[0] # Usually the main amount
        
        # Try to find matching item in game_df
        # We look for the same number in their name
        match_row = None
        for _, row in game_df.iterrows():
            j_name = str(row['Nama Layanan']).lower()
            j_nums = re.findall(r'\b\d+\b', j_name)
            
            # Simple heuristic: if the primary number matches
            if target_num in j_nums:
                # To be safer, avoid matching "5" with "50" -> regex \b\d+\b already handles this
                # Check for exact matches for things like Weekly Pass
                if 'weekly' in our_name and 'weekly' not in j_name: continue
                match_row = row
                break
                
        if match_row is not None:
            results.append({
                'Game': game_id,
                'Item': p['name'],
                'Our Price': p['price'],
                'Jokemon (Tamu)': match_row['Harga Tamu'],
                'Jokemon (Member)': match_row['Member'],
                'Jokemon Name': match_row['Nama Layanan']
            })

cheaper = 0
equal = 0
more = 0

with open(r'C:\Users\MyPC PRO\.gemini\antigravity\brain\563c9d4a-b98a-48c4-8cc2-bdd2cf3e8bec\jokemon_comparison.md', 'w', encoding='utf-8') as out:
    out.write("# Komparasi Harga: Gemartopup vs Jokemon\n\n")
    out.write(f"Berhasil me-macth {len(results)} produk unggulan.\n\n")
    out.write("| Game | Item Kita | Harga Kita | Harga Jokemon (Tamu) | Harga Jokemon (Member) | Status (vs Tamu) |\n")
    out.write("|---|---|---|---|---|---|\n")
    
    for r in results:
        status = "✅ Lebih Murah"
        if r['Our Price'] > r['Jokemon (Tamu)']:
            status = "❌ Lebih Mahal"
            more += 1
        elif r['Our Price'] == r['Jokemon (Tamu)']:
            status = "➖ Sama Persis"
            equal += 1
        else:
            cheaper += 1
            
        out.write(f"| {r['Game']} | {r['Item']} | Rp {r['Our Price']:,} | Rp {r['Jokemon (Tamu)']:,} | Rp {r['Jokemon (Member)']:,} | {status} |\n")

print(f"Matched {len(results)}. Cheaper: {cheaper}, Equal: {equal}, More exp: {more}")
