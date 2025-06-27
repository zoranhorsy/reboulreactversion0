#!/bin/bash

# Script d'import des données dans la base locale Docker
# À exécuter après avoir démarré docker-compose

LOCAL_DB_URL="postgresql://user:password@localhost:5432/reboul_db"

echo "🔄 Import des données dans la base locale..."

# Attendre que la base soit prête
echo "⏳ Attente de la base de données locale..."
while ! psql "$LOCAL_DB_URL" -c '\q' > /dev/null 2>&1; do
    echo "  Attente de PostgreSQL..."
    sleep 2
done
echo "✅ Base de données locale prête"

# Appliquer le schéma
echo "📋 Application du schéma..."
psql "$LOCAL_DB_URL" -f sql/schema.sql

# Import des données
echo "📊 Import des données..."
psql "$LOCAL_DB_URL" -c "\copy users FROM 'users.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy categories FROM 'categories.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy brands FROM 'brands.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy products FROM 'products.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy orders FROM 'orders.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy order_items FROM 'order_items.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy addresses FROM 'addresses.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy reviews FROM 'reviews.csv' WITH CSV HEADER;"
psql "$LOCAL_DB_URL" -c "\copy favorites FROM 'favorites.csv' WITH CSV HEADER;"

# Corner products si le fichier existe
if [ -f "corner_products.csv" ]; then
    psql "$LOCAL_DB_URL" -c "\copy corner_products FROM 'corner_products.csv' WITH CSV HEADER;"
fi

# Mise à jour des séquences
echo "🔧 Mise à jour des séquences..."
psql "$LOCAL_DB_URL" -c "SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('brands_id_seq', COALESCE((SELECT MAX(id) FROM brands), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('order_items_id_seq', COALESCE((SELECT MAX(id) FROM order_items), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('addresses_id_seq', COALESCE((SELECT MAX(id) FROM addresses), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 1));"
psql "$LOCAL_DB_URL" -c "SELECT setval('favorites_id_seq', COALESCE((SELECT MAX(id) FROM favorites), 1));"

echo "✅ Import terminé avec succès!"
echo ""
echo "📊 Vérification des données importées:"
psql "$LOCAL_DB_URL" -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'products', COUNT(*) FROM products UNION ALL SELECT 'brands', COUNT(*) FROM brands UNION ALL SELECT 'categories', COUNT(*) FROM categories;"
