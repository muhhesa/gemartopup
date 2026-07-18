import pandas as pd
df = pd.read_excel('BISNIS_GEMARTOPUP_ANALISIS.xlsx', sheet_name='MLBB INDOFLAZ')
js_array = '[\n'
for i, row in df.iterrows():
    name_str = row['LAYANAN']
    price_str = str(row['HARGA SILVER']).replace('Rp. ', '').replace('.', '')
    price = int(price_str)
    
    badge = 'null'
    if '85 Diamonds' in name_str or '86 Diamonds' in name_str or '170' in name_str or '172' in name_str or '110' in name_str or '258' in name_str:
        badge = '"bestseller"'
    elif 'Weekly Diamond Pass' in name_str:
        badge = '"promo"'
        
    js_array += f'    {{ id: {i+1}, name: "{name_str}", price: {price}, badge: {badge} }},\n'
js_array += '  ]'
print(js_array)
