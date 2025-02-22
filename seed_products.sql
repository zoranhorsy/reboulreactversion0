-- Create categories first
INSERT INTO categories (name, description) VALUES
('Vêtements', 'Collection de vêtements'),
('Accessoires', 'Collection d''accessoires'),
('Chaussures', 'Collection de chaussures'),
('Sport', 'Équipement sportif');

-- Function to generate random prices between 50 and 1000
CREATE OR REPLACE FUNCTION random_price() RETURNS numeric AS $$
BEGIN
    RETURN round((random() * 950 + 50)::numeric, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to generate random stock between 0 and 100
CREATE OR REPLACE FUNCTION random_stock() RETURNS integer AS $$
BEGIN
    RETURN floor(random() * 100)::integer;
END;
$$ LANGUAGE plpgsql;

-- Insert 100 test products
INSERT INTO products (
    name,
    description,
    price,
    stock,
    category_id,
    image_url,
    brand,
    images,
    variants,
    tags,
    reviews,
    questions,
    faqs,
    size_chart,
    store_type
)
SELECT 
    'Produit Test ' || i::text,
    'Description détaillée du produit test ' || i::text,
    random_price(),
    random_stock(),
    (SELECT id FROM categories ORDER BY random() LIMIT 1),
    'https://picsum.photos/400/600?random=' || i::text,
    CASE (i % 4)
        WHEN 0 THEN 'Nike'
        WHEN 1 THEN 'Adidas'
        WHEN 2 THEN 'Puma'
        WHEN 3 THEN 'Under Armour'
    END,
    ARRAY['https://picsum.photos/400/600?random=' || i::text, 'https://picsum.photos/400/600?random=' || (i+1)::text],
    jsonb_build_array(
        jsonb_build_object(
            'size', 'M',
            'color', 'Noir',
            'stock', floor(random() * 50)
        ),
        jsonb_build_object(
            'size', 'L',
            'color', 'Blanc',
            'stock', floor(random() * 50)
        )
    ),
    ARRAY['sport', 'tendance', 'nouveau'],
    jsonb_build_array(
        jsonb_build_object(
            'user', 'User' || i::text,
            'rating', floor(random() * 5 + 1),
            'comment', 'Très bon produit!'
        )
    ),
    jsonb_build_array(
        jsonb_build_object(
            'question', 'Question sur la taille?',
            'answer', 'Taille standard.'
        )
    ),
    jsonb_build_array(
        jsonb_build_object(
            'question', 'Comment laver?',
            'answer', 'Lavage à 30°C'
        )
    ),
    jsonb_build_object(
        'XS', '36-38',
        'S', '38-40',
        'M', '40-42',
        'L', '42-44',
        'XL', '44-46'
    ),
    CASE (i % 4)
        WHEN 0 THEN 'adult'
        WHEN 1 THEN 'kids'
        WHEN 2 THEN 'sneakers'
        WHEN 3 THEN 'cpcompany'
    END
FROM generate_series(1, 100) i;

-- Display summary of inserted products
SELECT 
    c.name as category,
    count(*) as product_count,
    min(p.price) as min_price,
    max(p.price) as max_price
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.name
ORDER BY c.name; 