-- Script pour ajouter des détails techniques aux produits existants
UPDATE products 
SET details = ARRAY['Matière premium', 'Confort optimal', 'Fabrication européenne']
WHERE details IS NULL OR details = '{}';

-- Pour les chaussures
UPDATE products 
SET details = ARRAY['Semelle intérieure amortissante', 'Semelle extérieure antidérapante', 'Maintien optimal du pied', 'Respirant pour un confort de longue durée']
WHERE category_id = (SELECT id FROM categories WHERE name LIKE '%Chaussures%') 
AND (details IS NULL OR details = '{}');

-- Pour les vêtements
UPDATE products 
SET details = ARRAY['Tissu de haute qualité', 'Coupe ajustée', 'Résistant à l''usure', 'Couleurs durables']
WHERE category_id = (SELECT id FROM categories WHERE name LIKE '%Vêtements%')
AND (details IS NULL OR details = '{}');

-- Pour les accessoires
UPDATE products 
SET details = ARRAY['Design exclusif', 'Finition soignée', 'Matériaux premium', 'Polyvalent']
WHERE category_id = (SELECT id FROM categories WHERE name LIKE '%Accessoires%')
AND (details IS NULL OR details = '{}');

-- Pour les sneakers spécifiquement
UPDATE products 
SET details = ARRAY['Semelle cushion', 'Tige en matière respirante', 'Conception ergonomique', 'Adhérence maximale', 'Idéal pour un usage quotidien']
WHERE store_type = 'sneakers'
AND (details IS NULL OR details = '{}');

-- Identifier les produits Salomon
UPDATE products 
SET details = ARRAY['Technologie Speedcross', 'Semelle Contagrip', 'Système d''amorti Energy Cell', 'Membrane Gore-Tex imperméable', 'Système de laçage Quicklace']
WHERE brand LIKE '%Salomon%'
AND (details IS NULL OR details = '{}'); 