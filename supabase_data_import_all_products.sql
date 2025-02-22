-- Nettoyer les données existantes
TRUNCATE users, categories, products, orders, order_items CASCADE;

-- Réinitialiser les séquences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

-- Importer les utilisateurs
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_admin, created_at, notification_settings)
VALUES 
(1, 'zoran', 'zoran@reboul.com', '$2b$10$UzLt9qVpmXa9vSRmhBs2O.MwEf3aC1oS..TY18g8lAzoE/SNXt6lG', 'zoran', '', true, '2025-01-01 13:10:41.056359+01', '{"push": true, "email": true, "security": true, "marketing": true}'),
(3, 'jaab', 'jaab@reboul.com', '$2b$10$lCQosEgj19A9w4S/a/hX9eKm/qXvEQPaQwfd8VUIlPguks98nCwUO', 'thomas', 'lorenzi', false, '2025-01-02 11:09:26.046441+01', '{"push": false, "email": true, "security": true, "marketing": false}');

-- Importer toutes les catégories
INSERT INTO categories (id, name, description) VALUES 
(2, 'Tee Shirts', 'Accessoires de mode'),
(6, 'Vestes', 'Description à ajouter'),
(8, 'outerwear', 'Description à ajouter'),
(10, 'PULL', NULL),
(11, 'pantalon', NULL),
(12, 'accesoires', NULL),
(13, 'Test Category', 'Description de la catégorie test'),
(18, 'Vêtements', 'Collection de vêtements'),
(19, 'Accessoires', 'Collection d''accessoires'),
(20, 'Chaussures', 'Collection de chaussures'),
(21, 'Sport', 'Équipement sportif');

-- Importer tous les produits
INSERT INTO products (id, name, description, price, stock, category_id, image_url, brand, variants, store_type, featured)
VALUES 
(32, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 96, 8, NULL, 'C.P.COMPANY',
    '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}, {"size": "S", "color": "Noir", "stock": 10}, {"size": "XS", "color": "Vert", "stock": 15}]'::jsonb,
    'cpcompany', false),
(33, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 100, 2, 'http://localhost:5001/api/uploads/placeholder.png', '',
    '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}, {"size": "S", "color": "Noir", "stock": 50}]'::jsonb,
    'adult', true),
(34, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 100, 2, 'http://localhost:5001/api/uploads/placeholder.png', '',
    '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}]'::jsonb,
    'adult', true),
(35, 'SALOMON XT SLATE', 'Un t-shirt confortable et élégant', 200.00, 92, 12, 'http://localhost:5001/api/uploads/placeholder.png', '',
    '[{"size": "40", "color": "Noir", "stock": 10}]'::jsonb,
    'sneakers', true),
(36, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 100, 2, '/placeholder.png', 'APC',
    '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}]'::jsonb,
    'adult', false),
(41, 'Produit cp', 'ssss', 150.00, 0, 6, NULL, 'C.P.COMPANY',
    '[]'::jsonb,
    'cpcompany', true),
(42, 'Produit', 'ssss', 300.00, 0, 2, NULL, 'C.P.COMPANY',
    '[{"size": "L", "color": "Noir", "stock": 2}]'::jsonb,
    'cpcompany', true),
(44, 'Produit Test', 'Description test', 99.99, 5, 13, NULL, 'STONE ISLAND',
    '[{"size": "M", "color": "Noir", "stock": 3}, {"size": "L", "color": "Noir", "stock": 2}]'::jsonb,
    'adult', false);

-- Mettre à jour les séquences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items)); 