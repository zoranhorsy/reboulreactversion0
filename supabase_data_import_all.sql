-- Nettoyer les données existantes
TRUNCATE users, categories, products, orders, order_items CASCADE;

-- Réinitialiser les séquences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

-- Importer les utilisateurs
INSERT INTO users (id, username, email, password_hash, is_admin, created_at)
VALUES 
(1, 'zoran', 'zoran@reboul.com', '$2b$10$UzLt9qVpmXa9vSRmhBs2O.MwEf3aC1oS..TY18g8lAzoE/SNXt6lG', true, '2025-01-01 13:10:41.056359+01'),
(3, 'jaab', 'jaab@reboul.com', '$2b$10$lCQosEgj19A9w4S/a/hX9eKm/qXvEQPaQwfd8VUIlPguks98nCwUO', false, '2025-01-02 11:09:26.046441+01');

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
(32, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 96, 8, NULL, 'C.P.COMPANY', '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}, {"size": "S", "color": "Noir", "stock": 10}, {"size": "XS", "color": "Vert", "stock": 15}]'::jsonb, 'cpcompany', false),
(33, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 100, 2, 'http://localhost:5001/api/uploads/placeholder.png', NULL, '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}, {"size": "S", "color": "Noir", "stock": 50}]'::jsonb, 'adult', true),
(34, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 100, 2, 'http://localhost:5001/api/uploads/placeholder.png', NULL, '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}]'::jsonb, 'adult', true),
(35, 'SALOMON XT SLATE', 'Un t-shirt confortable et élégant', 200.00, 92, 12, 'http://localhost:5001/api/uploads/placeholder.png', NULL, '[{"size": "40", "color": "Noir", "stock": 10}]'::jsonb, 'sneakers', true),
(36, 'Nouveau T-shirt', 'Un t-shirt confortable et élégant', 29.99, 100, 2, '/placeholder.png', 'APC', '[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}]'::jsonb, 'adult', false),
(41, 'Produit cp', 'ssss', 150.00, 0, 6, NULL, 'C.P.COMPANY', '[]'::jsonb, 'cpcompany', true),
(42, 'Produit', 'ssss', 300.00, 0, 2, NULL, 'C.P.COMPANY', '[{"size": "L", "color": "Noir", "stock": 2}]'::jsonb, 'cpcompany', true),
(44, 'Produit Test', 'Description test', 99.99, 5, 13, NULL, 'STONE ISLAND', '[{"size": "M", "color": "Noir", "stock": 3}, {"size": "L", "color": "Noir", "stock": 2}]'::jsonb, 'adult', false),
(50, 'Produit Test 1', 'Description détaillée du produit test 1', 668.32, 64, 2, 'https://picsum.photos/400/600?random=1', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 43}]'::jsonb, 'kids', false),
(51, 'Produit Test 2', 'Description détaillée du produit test 2', 420.22, 84, 2, 'https://picsum.photos/400/600?random=2', 'Puma', '[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 37}]'::jsonb, 'sneakers', false),
(52, 'Produit Test 3', 'Description détaillée du produit test 3', 947.89, 36, 2, 'https://picsum.photos/400/600?random=3', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 48}, {"size": "L", "color": "Blanc", "stock": 44}]'::jsonb, 'cpcompany', false),
(53, 'Produit Test 4', 'Description détaillée du produit test 4', 472.07, 44, 2, 'https://picsum.photos/400/600?random=4', 'Nike', '[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 1}]'::jsonb, 'adult', false),
(54, 'Produit Test 5', 'Description détaillée du produit test 5', 261.05, 0, 2, 'https://picsum.photos/400/600?random=5', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 6}]'::jsonb, 'kids', false),
(55, 'Produit Test 6', 'Description détaillée du produit test 6', 918.35, 35, 2, 'https://picsum.photos/400/600?random=6', 'Puma', '[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 49}]'::jsonb, 'sneakers', false),
(56, 'Produit Test 7', 'Description détaillée du produit test 7', 54.11, 37, 2, 'https://picsum.photos/400/600?random=7', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 38}, {"size": "L", "color": "Blanc", "stock": 47}]'::jsonb, 'cpcompany', false),
(57, 'Produit Test 8', 'Description détaillée du produit test 8', 786.72, 44, 2, 'https://picsum.photos/400/600?random=8', 'Nike', '[{"size": "M", "color": "Noir", "stock": 9}, {"size": "L", "color": "Blanc", "stock": 4}]'::jsonb, 'adult', false),
(58, 'Produit Test 9', 'Description détaillée du produit test 9', 703.32, 30, 2, 'https://picsum.photos/400/600?random=9', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 39}, {"size": "L", "color": "Blanc", "stock": 14}]'::jsonb, 'kids', false),
(59, 'Produit Test 10', 'Description détaillée du produit test 10', 850.10, 99, 2, 'https://picsum.photos/400/600?random=10', 'Puma', '[{"size": "M", "color": "Noir", "stock": 35}, {"size": "L", "color": "Blanc", "stock": 41}]'::jsonb, 'sneakers', false),
(60, 'Produit Test 11', 'Description détaillée du produit test 11', 949.86, 7, 2, 'https://picsum.photos/400/600?random=11', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 2}, {"size": "L", "color": "Blanc", "stock": 6}]'::jsonb, 'cpcompany', false),
(61, 'Produit Test 12', 'Description détaillée du produit test 12', 749.81, 74, 2, 'https://picsum.photos/400/600?random=12', 'Nike', '[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 12}]'::jsonb, 'adult', false),
(62, 'Produit Test 13', 'Description détaillée du produit test 13', 783.92, 50, 2, 'https://picsum.photos/400/600?random=13', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 36}]'::jsonb, 'kids', false),
(63, 'Produit Test 14', 'Description détaillée du produit test 14', 852.42, 35, 2, 'https://picsum.photos/400/600?random=14', 'Puma', '[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 38}]'::jsonb, 'sneakers', false),
(64, 'Produit Test 15', 'Description détaillée du produit test 15', 883.12, 79, 2, 'https://picsum.photos/400/600?random=15', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 12}, {"size": "L", "color": "Blanc", "stock": 24}]'::jsonb, 'cpcompany', false),
(65, 'Produit Test 16', 'Description détaillée du produit test 16', 207.48, 10, 2, 'https://picsum.photos/400/600?random=16', 'Nike', '[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 9}]'::jsonb, 'adult', false),
(66, 'Produit Test 17', 'Description détaillée du produit test 17', 326.97, 16, 2, 'https://picsum.photos/400/600?random=17', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 33}, {"size": "L", "color": "Blanc", "stock": 1}]'::jsonb, 'kids', false),
(67, 'Produit Test 18', 'Description détaillée du produit test 18', 571.54, 17, 2, 'https://picsum.photos/400/600?random=18', 'Puma', '[{"size": "M", "color": "Noir", "stock": 15}, {"size": "L", "color": "Blanc", "stock": 41}]'::jsonb, 'sneakers', false),
(68, 'Produit Test 19', 'Description détaillée du produit test 19', 999.17, 25, 2, 'https://picsum.photos/400/600?random=19', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 22}, {"size": "L", "color": "Blanc", "stock": 46}]'::jsonb, 'cpcompany', false),
(69, 'Produit Test 20', 'Description détaillée du produit test 20', 513.61, 8, 2, 'https://picsum.photos/400/600?random=20', 'Nike', '[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 40}]'::jsonb, 'adult', false),
(70, 'Produit Test 21', 'Description détaillée du produit test 21', 127.24, 47, 2, 'https://picsum.photos/400/600?random=21', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 43}, {"size": "L", "color": "Blanc", "stock": 11}]'::jsonb, 'kids', false),
(71, 'Produit Test 22', 'Description détaillée du produit test 22', 244.42, 94, 2, 'https://picsum.photos/400/600?random=22', 'Puma', '[{"size": "M", "color": "Noir", "stock": 48}, {"size": "L", "color": "Blanc", "stock": 24}]'::jsonb, 'sneakers', false),
(72, 'Produit Test 23', 'Description détaillée du produit test 23', 739.70, 57, 2, 'https://picsum.photos/400/600?random=23', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 40}, {"size": "L", "color": "Blanc", "stock": 42}]'::jsonb, 'cpcompany', false),
(73, 'Produit Test 24', 'Description détaillée du produit test 24', 382.50, 96, 2, 'https://picsum.photos/400/600?random=24', 'Nike', '[{"size": "M", "color": "Noir", "stock": 25}, {"size": "L", "color": "Blanc", "stock": 20}]'::jsonb, 'adult', false),
(74, 'Produit Test 25', 'Description détaillée du produit test 25', 298.11, 31, 2, 'https://picsum.photos/400/600?random=25', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 49}]'::jsonb, 'kids', false),
(75, 'Produit Test 26', 'Description détaillée du produit test 26', 294.89, 79, 2, 'https://picsum.photos/400/600?random=26', 'Puma', '[{"size": "M", "color": "Noir", "stock": 34}, {"size": "L", "color": "Blanc", "stock": 12}]'::jsonb, 'sneakers', false),
(76, 'Produit Test 27', 'Description détaillée du produit test 27', 502.06, 35, 2, 'https://picsum.photos/400/600?random=27', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 42}, {"size": "L", "color": "Blanc", "stock": 21}]'::jsonb, 'cpcompany', false),
(77, 'Produit Test 28', 'Description détaillée du produit test 28', 148.21, 44, 2, 'https://picsum.photos/400/600?random=28', 'Nike', '[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 31}]'::jsonb, 'adult', false),
(78, 'Produit Test 29', 'Description détaillée du produit test 29', 932.20, 37, 2, 'https://picsum.photos/400/600?random=29', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 33}]'::jsonb, 'kids', false),
(79, 'Produit Test 30', 'Description détaillée du produit test 30', 386.38, 90, 2, 'https://picsum.photos/400/600?random=30', 'Puma', '[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 20}]'::jsonb, 'sneakers', false),
(80, 'Produit Test 31', 'Description détaillée du produit test 31', 205.67, 30, 2, 'https://picsum.photos/400/600?random=31', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 44}]'::jsonb, 'cpcompany', false),
(81, 'Produit Test 32', 'Description détaillée du produit test 32', 487.89, 62, 2, 'https://picsum.photos/400/600?random=32', 'Nike', '[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 41}]'::jsonb, 'adult', false),
(82, 'Produit Test 33', 'Description détaillée du produit test 33', 323.36, 67, 2, 'https://picsum.photos/400/600?random=33', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 26}, {"size": "L", "color": "Blanc", "stock": 20}]'::jsonb, 'kids', false),
(83, 'Produit Test 34', 'Description détaillée du produit test 34', 696.16, 93, 2, 'https://picsum.photos/400/600?random=34', 'Puma', '[{"size": "M", "color": "Noir", "stock": 6}, {"size": "L", "color": "Blanc", "stock": 35}]'::jsonb, 'sneakers', false),
(84, 'Produit Test 35', 'Description détaillée du produit test 35', 800.16, 12, 2, 'https://picsum.photos/400/600?random=35', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 45}]'::jsonb, 'cpcompany', false),
(85, 'Produit Test 36', 'Description détaillée du produit test 36', 224.87, 30, 2, 'https://picsum.photos/400/600?random=36', 'Nike', '[{"size": "M", "color": "Noir", "stock": 22}, {"size": "L", "color": "Blanc", "stock": 13}]'::jsonb, 'adult', false),
(86, 'Produit Test 37', 'Description détaillée du produit test 37', 797.49, 42, 2, 'https://picsum.photos/400/600?random=37', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 8}]'::jsonb, 'kids', false),
(87, 'Produit Test 38', 'Description détaillée du produit test 38', 923.13, 38, 2, 'https://picsum.photos/400/600?random=38', 'Puma', '[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 31}]'::jsonb, 'sneakers', false),
(88, 'Produit Test 39', 'Description détaillée du produit test 39', 262.85, 6, 2, 'https://picsum.photos/400/600?random=39', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 34}, {"size": "L", "color": "Blanc", "stock": 46}]'::jsonb, 'cpcompany', false),
(89, 'Produit Test 40', 'Description détaillée du produit test 40', 953.45, 70, 2, 'https://picsum.photos/400/600?random=40', 'Nike', '[{"size": "M", "color": "Noir", "stock": 28}, {"size": "L", "color": "Blanc", "stock": 2}]'::jsonb, 'adult', false),
(90, 'Produit Test 41', 'Description détaillée du produit test 41', 538.11, 78, 2, 'https://picsum.photos/400/600?random=41', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 33}]'::jsonb, 'kids', false),
(91, 'Produit Test 42', 'Description détaillée du produit test 42', 365.20, 41, 2, 'https://picsum.photos/400/600?random=42', 'Puma', '[{"size": "M", "color": "Noir", "stock": 9}, {"size": "L", "color": "Blanc", "stock": 12}]'::jsonb, 'sneakers', false),
(92, 'Produit Test 43', 'Description détaillée du produit test 43', 194.45, 50, 2, 'https://picsum.photos/400/600?random=43', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 23}, {"size": "L", "color": "Blanc", "stock": 15}]'::jsonb, 'cpcompany', false),
(93, 'Produit Test 44', 'Description détaillée du produit test 44', 355.00, 7, 2, 'https://picsum.photos/400/600?random=44', 'Nike', '[{"size": "M", "color": "Noir", "stock": 12}, {"size": "L", "color": "Blanc", "stock": 2}]'::jsonb, 'adult', false),
(94, 'Produit Test 45', 'Description détaillée du produit test 45', 782.09, 56, 2, 'https://picsum.photos/400/600?random=45', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 25}, {"size": "L", "color": "Blanc", "stock": 10}]'::jsonb, 'kids', false),
(95, 'Produit Test 46', 'Description détaillée du produit test 46', 702.52, 55, 2, 'https://picsum.photos/400/600?random=46', 'Puma', '[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 3}]'::jsonb, 'sneakers', false),
(96, 'Produit Test 47', 'Description détaillée du produit test 47', 422.57, 91, 2, 'https://picsum.photos/400/600?random=47', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 9}, {"size": "L", "color": "Blanc", "stock": 44}]'::jsonb, 'cpcompany', false),
(97, 'Produit Test 48', 'Description détaillée du produit test 48', 525.19, 33, 2, 'https://picsum.photos/400/600?random=48', 'Nike', '[{"size": "M", "color": "Noir", "stock": 46}, {"size": "L", "color": "Blanc", "stock": 49}]'::jsonb, 'adult', false),
(98, 'Produit Test 49', 'Description détaillée du produit test 49', 846.96, 95, 2, 'https://picsum.photos/400/600?random=49', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 14}]'::jsonb, 'kids', false),
(99, 'Produit Test 50', 'Description détaillée du produit test 50', 525.47, 80, 2, 'https://picsum.photos/400/600?random=50', 'Puma', '[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 24}]'::jsonb, 'sneakers', false),
(100, 'Produit Test 51', 'Description détaillée du produit test 51', 413.93, 81, 2, 'https://picsum.photos/400/600?random=51', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 27}, {"size": "L", "color": "Blanc", "stock": 5}]'::jsonb, 'cpcompany', false),
(101, 'Produit Test 52', 'Description détaillée du produit test 52', 98.73, 79, 2, 'https://picsum.photos/400/600?random=52', 'Nike', '[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 31}]'::jsonb, 'adult', false),
(102, 'Produit Test 53', 'Description détaillée du produit test 53', 661.11, 58, 2, 'https://picsum.photos/400/600?random=53', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 39}]'::jsonb, 'kids', false),
(103, 'Produit Test 54', 'Description détaillée du produit test 54', 598.15, 61, 2, 'https://picsum.photos/400/600?random=54', 'Puma', '[{"size": "M", "color": "Noir", "stock": 47}, {"size": "L", "color": "Blanc", "stock": 18}]'::jsonb, 'sneakers', false),
(104, 'Produit Test 55', 'Description détaillée du produit test 55', 324.41, 81, 2, 'https://picsum.photos/400/600?random=55', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 21}]'::jsonb, 'cpcompany', false),
(105, 'Produit Test 56', 'Description détaillée du produit test 56', 747.67, 25, 2, 'https://picsum.photos/400/600?random=56', 'Nike', '[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 43}]'::jsonb, 'adult', false),
(106, 'Produit Test 57', 'Description détaillée du produit test 57', 540.16, 83, 2, 'https://picsum.photos/400/600?random=57', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 23}, {"size": "L", "color": "Blanc", "stock": 29}]'::jsonb, 'kids', false),
(107, 'Produit Test 58', 'Description détaillée du produit test 58', 400.31, 65, 2, 'https://picsum.photos/400/600?random=58', 'Puma', '[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 46}]'::jsonb, 'sneakers', false),
(108, 'Produit Test 59', 'Description détaillée du produit test 59', 862.47, 81, 2, 'https://picsum.photos/400/600?random=59', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 36}, {"size": "L", "color": "Blanc", "stock": 37}]'::jsonb, 'cpcompany', false),
(109, 'Produit Test 60', 'Description détaillée du produit test 60', 848.48, 86, 2, 'https://picsum.photos/400/600?random=60', 'Nike', '[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 44}]'::jsonb, 'adult', false),
(110, 'Produit Test 61', 'Description détaillée du produit test 61', 81.48, 35, 2, 'https://picsum.photos/400/600?random=61', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 48}]'::jsonb, 'kids', false),
(111, 'Produit Test 62', 'Description détaillée du produit test 62', 637.43, 92, 2, 'https://picsum.photos/400/600?random=62', 'Puma', '[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 8}]'::jsonb, 'sneakers', false),
(112, 'Produit Test 63', 'Description détaillée du produit test 63', 206.80, 80, 2, 'https://picsum.photos/400/600?random=63', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 44}]'::jsonb, 'cpcompany', false),
(113, 'Produit Test 64', 'Description détaillée du produit test 64', 102.27, 44, 2, 'https://picsum.photos/400/600?random=64', 'Nike', '[{"size": "M", "color": "Noir", "stock": 29}, {"size": "L", "color": "Blanc", "stock": 9}]'::jsonb, 'adult', false),
(114, 'Produit Test 65', 'Description détaillée du produit test 65', 914.62, 36, 2, 'https://picsum.photos/400/600?random=65', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 46}, {"size": "L", "color": "Blanc", "stock": 41}]'::jsonb, 'kids', false),
(115, 'Produit Test 66', 'Description détaillée du produit test 66', 974.60, 0, 2, 'https://picsum.photos/400/600?random=66', 'Puma', '[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 49}]'::jsonb, 'sneakers', false),
(116, 'Produit Test 67', 'Description détaillée du produit test 67', 763.50, 43, 2, 'https://picsum.photos/400/600?random=67', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 27}]'::jsonb, 'cpcompany', false),
(117, 'Produit Test 68', 'Description détaillée du produit test 68', 520.44, 69, 2, 'https://picsum.photos/400/600?random=68', 'Nike', '[{"size": "M", "color": "Noir", "stock": 33}, {"size": "L", "color": "Blanc", "stock": 34}]'::jsonb, 'adult', false),
(118, 'Produit Test 69', 'Description détaillée du produit test 69', 959.63, 58, 2, 'https://picsum.photos/400/600?random=69', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 14}]'::jsonb, 'kids', false),
(119, 'Produit Test 70', 'Description détaillée du produit test 70', 378.05, 32, 2, 'https://picsum.photos/400/600?random=70', 'Puma', '[{"size": "M", "color": "Noir", "stock": 30}, {"size": "L", "color": "Blanc", "stock": 29}]'::jsonb, 'sneakers', false),
(120, 'Produit Test 71', 'Description détaillée du produit test 71', 978.44, 31, 2, 'https://picsum.photos/400/600?random=71', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 32}, {"size": "L", "color": "Blanc", "stock": 11}]'::jsonb, 'cpcompany', false),
(121, 'Produit Test 72', 'Description détaillée du produit test 72', 881.11, 32, 2, 'https://picsum.photos/400/600?random=72', 'Nike', '[{"size": "M", "color": "Noir", "stock": 42}, {"size": "L", "color": "Blanc", "stock": 22}]'::jsonb, 'adult', false),
(122, 'Produit Test 73', 'Description détaillée du produit test 73', 881.35, 2, 2, 'https://picsum.photos/400/600?random=73', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 35}]'::jsonb, 'kids', false),
(123, 'Produit Test 74', 'Description détaillée du produit test 74', 286.39, 38, 2, 'https://picsum.photos/400/600?random=74', 'Puma', '[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 38}]'::jsonb, 'sneakers', false),
(124, 'Produit Test 75', 'Description détaillée du produit test 75', 226.10, 80, 2, 'https://picsum.photos/400/600?random=75', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 45}, {"size": "L", "color": "Blanc", "stock": 30}]'::jsonb, 'cpcompany', false),
(125, 'Produit Test 76', 'Description détaillée du produit test 76', 148.65, 2, 2, 'https://picsum.photos/400/600?random=76', 'Nike', '[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 25}]'::jsonb, 'adult', false),
(126, 'Produit Test 77', 'Description détaillée du produit test 77', 263.15, 20, 2, 'https://picsum.photos/400/600?random=77', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 5}]'::jsonb, 'kids', false),
(127, 'Produit Test 78', 'Description détaillée du produit test 78', 923.71, 50, 2, 'https://picsum.photos/400/600?random=78', 'Puma', '[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 47}]'::jsonb, 'sneakers', false),
(128, 'Produit Test 79', 'Description détaillée du produit test 79', 237.29, 1, 2, 'https://picsum.photos/400/600?random=79', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 6}, {"size": "L", "color": "Blanc", "stock": 35}]'::jsonb, 'cpcompany', false),
(129, 'Produit Test 80', 'Description détaillée du produit test 80', 243.01, 88, 2, 'https://picsum.photos/400/600?random=80', 'Nike', '[{"size": "M", "color": "Noir", "stock": 12}, {"size": "L", "color": "Blanc", "stock": 48}]'::jsonb, 'adult', false),
(130, 'Produit Test 81', 'Description détaillée du produit test 81', 825.18, 96, 2, 'https://picsum.photos/400/600?random=81', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 32}]'::jsonb, 'kids', false),
(131, 'Produit Test 82', 'Description détaillée du produit test 82', 879.01, 4, 2, 'https://picsum.photos/400/600?random=82', 'Puma', '[{"size": "M", "color": "Noir", "stock": 39}, {"size": "L", "color": "Blanc", "stock": 12}]'::jsonb, 'sneakers', false),
(132, 'Produit Test 83', 'Description détaillée du produit test 83', 426.16, 38, 2, 'https://picsum.photos/400/600?random=83', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 17}, {"size": "L", "color": "Blanc", "stock": 39}]'::jsonb, 'cpcompany', false),
(133, 'Produit Test 84', 'Description détaillée du produit test 84', 486.03, 45, 2, 'https://picsum.photos/400/600?random=84', 'Nike', '[{"size": "M", "color": "Noir", "stock": 21}, {"size": "L", "color": "Blanc", "stock": 2}]'::jsonb, 'adult', false),
(134, 'Produit Test 85', 'Description détaillée du produit test 85', 323.27, 9, 2, 'https://picsum.photos/400/600?random=85', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 32}]'::jsonb, 'kids', false),
(135, 'Produit Test 86', 'Description détaillée du produit test 86', 602.46, 22, 2, 'https://picsum.photos/400/600?random=86', 'Puma', '[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 22}]'::jsonb, 'sneakers', false),
(136, 'Produit Test 87', 'Description détaillée du produit test 87', 694.99, 33, 2, 'https://picsum.photos/400/600?random=87', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 12}]'::jsonb, 'cpcompany', false),
(137, 'Produit Test 88', 'Description détaillée du produit test 88', 838.65, 56, 2, 'https://picsum.photos/400/600?random=88', 'Nike', '[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 1}]'::jsonb, 'adult', false),
(138, 'Produit Test 89', 'Description détaillée du produit test 89', 195.56, 16, 2, 'https://picsum.photos/400/600?random=89', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 32}, {"size": "L", "color": "Blanc", "stock": 47}]'::jsonb, 'kids', false),
(139, 'Produit Test 90', 'Description détaillée du produit test 90', 51.61, 90, 2, 'https://picsum.photos/400/600?random=90', 'Puma', '[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 37}]'::jsonb, 'sneakers', false),
(140, 'Produit Test 91', 'Description détaillée du produit test 91', 184.47, 94, 2, 'https://picsum.photos/400/600?random=91', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 6}, {"size": "L", "color": "Blanc", "stock": 36}]'::jsonb, 'cpcompany', false),
(141, 'Produit Test 92', 'Description détaillée du produit test 92', 925.28, 83, 2, 'https://picsum.photos/400/600?random=92', 'Nike', '[{"size": "M", "color": "Noir", "stock": 0}, {"size": "L", "color": "Blanc", "stock": 49}]'::jsonb, 'adult', false),
(142, 'Produit Test 93', 'Description détaillée du produit test 93', 683.98, 14, 2, 'https://picsum.photos/400/600?random=93', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 30}, {"size": "L", "color": "Blanc", "stock": 1}]'::jsonb, 'kids', false),
(143, 'Produit Test 94', 'Description détaillée du produit test 94', 750.04, 39, 2, 'https://picsum.photos/400/600?random=94', 'Puma', '[{"size": "M", "color": "Noir", "stock": 29}, {"size": "L", "color": "Blanc", "stock": 23}]'::jsonb, 'sneakers', false),
(144, 'Produit Test 95', 'Description détaillée du produit test 95', 866.86, 29, 2, 'https://picsum.photos/400/600?random=95', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 42}]'::jsonb, 'cpcompany', false),
(145, 'Produit Test 96', 'Description détaillée du produit test 96', 355.49, 42, 2, 'https://picsum.photos/400/600?random=96', 'Nike', '[{"size": "M", "color": "Noir", "stock": 28}, {"size": "L", "color": "Blanc", "stock": 19}]'::jsonb, 'adult', false),
(146, 'Produit Test 97', 'Description détaillée du produit test 97', 600.30, 44, 2, 'https://picsum.photos/400/600?random=97', 'Adidas', '[{"size": "M", "color": "Noir", "stock": 45}, {"size": "L", "color": "Blanc", "stock": 29}]'::jsonb, 'kids', false),
(147, 'Produit Test 98', 'Description détaillée du produit test 98', 313.86, 51, 2, 'https://picsum.photos/400/600?random=98', 'Puma', '[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 46}]'::jsonb, 'sneakers', false),
(148, 'Produit Test 99', 'Description détaillée du produit test 99', 678.58, 40, 2, 'https://picsum.photos/400/600?random=99', 'Under Armour', '[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 16}]'::jsonb, 'cpcompany', false),
(149, 'Produit Test 100', 'Description détaillée du produit test 100', 859.10, 12, 2, 'https://picsum.photos/400/600?random=100', 'Nike', '[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 49}]'::jsonb, 'adult', false);

-- Mettre à jour les séquences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
