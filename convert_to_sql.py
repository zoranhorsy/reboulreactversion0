import csv

sql_lines = []
with open('all_products.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Nettoyer les valeurs NULL
        for key in row:
            if row[key] == '':
                row[key] = 'NULL'
            elif key not in ['id', 'price', 'stock', 'category_id', 'variants', 'featured']:
                row[key] = f"'{row[key]}'"
        
        # Convertir le booléen featured
        row['featured'] = 'true' if row['featured'] == 't' else 'false'
        
        sql = f"({row['id']}, {row['name']}, {row['description']}, {row['price']}, {row['stock']}, " \
              f"{row['category_id']}, {row['image_url']}, {row['brand']}, " \
              f"'{row['variants']}'::jsonb, {row['store_type']}, {row['featured']})"
        sql_lines.append(sql)

with open('products_insert.sql', 'w') as f:
    f.write("INSERT INTO products (id, name, description, price, stock, category_id, image_url, brand, variants, store_type, featured)\nVALUES\n")
    f.write(',\n'.join(sql_lines))
    f.write(';') 