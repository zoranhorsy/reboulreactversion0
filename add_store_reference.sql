-- Ajouter le champ store_reference à la table products
ALTER TABLE products 
ADD COLUMN store_reference VARCHAR(100);

-- Ajouter un index pour optimiser les recherches par référence magasin
CREATE INDEX idx_products_store_reference ON products(store_reference);

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN products.store_reference IS 'Référence du magasin où le produit est stocké, pour une meilleure organisation des stocks'; 