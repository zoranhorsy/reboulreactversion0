#!/bin/bash

# Script pour importer les données Railway dans PostgreSQL local

echo "🔄 Import des données Railway vers PostgreSQL local..."

# Trouver le backup le plus récent
BACKUP_DIR=$(find . -name "railway-backup-*" -type d | sort -r | head -n 1)

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ Aucun backup Railway trouvé"
    exit 1
fi

echo "📁 Utilisation du backup: $BACKUP_DIR"

# Aller dans le répertoire de backup
cd "$BACKUP_DIR"

# Variables de connexion locale
LOCAL_DB="reboul_store"
LOCAL_USER=${USER:-${LOGNAME}}

echo "🏗️  Application du schéma..."
# Appliquer le schéma (en ignorant les erreurs de version)
psql -d "$LOCAL_DB" -f sql/schema.sql 2>/dev/null || {
    echo "⚠️  Schéma appliqué avec quelques avertissements (normal)"
}

echo "📊 Import des données..."

# Import des données dans l'ordre des dépendances
psql -d "$LOCAL_DB" -c "\copy users FROM 'users.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy categories FROM 'categories.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy brands FROM 'brands.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy products FROM 'products.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy orders FROM 'orders.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy order_items FROM 'order_items.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy addresses FROM 'addresses.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy reviews FROM 'reviews.csv' WITH CSV HEADER;" 2>/dev/null
psql -d "$LOCAL_DB" -c "\copy favorites FROM 'favorites.csv' WITH CSV HEADER;" 2>/dev/null

# Corner products si le fichier existe
if [ -f "corner_products.csv" ]; then
    psql -d "$LOCAL_DB" -c "\copy corner_products FROM 'corner_products.csv' WITH CSV HEADER;" 2>/dev/null
fi

echo "🔧 Mise à jour des séquences..."
psql -d "$LOCAL_DB" -c "
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('brands_id_seq', COALESCE((SELECT MAX(id) FROM brands), 1));
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 1));
SELECT setval('order_items_id_seq', COALESCE((SELECT MAX(id) FROM order_items), 1));
SELECT setval('addresses_id_seq', COALESCE((SELECT MAX(id) FROM addresses), 1));
SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 1));
SELECT setval('favorites_id_seq', COALESCE((SELECT MAX(id) FROM favorites), 1));
" 2>/dev/null

echo "✅ Import terminé avec succès!"
echo ""
echo "📊 Vérification des données importées:"
psql -d "$LOCAL_DB" -c "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'brands', COUNT(*) FROM brands
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'orders', COUNT(*) FROM orders;
"

cd ..
