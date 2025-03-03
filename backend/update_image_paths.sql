-- Mise à jour des chemins des logos de marques
UPDATE brands 
SET name = 'MONCLER' 
WHERE name = 'MONCLERC';

UPDATE brands 
SET 
    logo_url = CONCAT('/brands/', 
        CASE 
            WHEN name = 'STONE ISLAND' THEN 'STONE ISLAND/STONE_ISLAND_1_b.png'
            WHEN name = 'NIKE' THEN 'NIKE/LOGO.png'
            WHEN name = 'AUTRY' THEN 'AUTRY/AUTRY_b.png'
            WHEN name = 'APC' THEN 'APC/APC_b.png'
            WHEN name = 'AXEL ARIGATO' THEN 'AXEL ARIGATO/AXEL_b.png'
            WHEN name = 'HERNO' THEN 'HERNO/HERNO_b.png'
            WHEN name = 'ARTE' THEN 'ARTE/ARTE_b.png'
            WHEN name = 'ASPESI' THEN 'ASPESI/aspesi_b.png'
            WHEN name = 'BISOUS SKATEBOARDS' THEN 'BISOUS SKATEBOARDS/BISOUS_b.png'
            WHEN name = 'CARHART' THEN 'CARHARTT/CARHARTT_b.png'
            WHEN name = 'CHLOE' THEN 'CHLOE/CHLOE_b.png'
            WHEN name = 'C.P.COMPANY' THEN 'CP COMPANY/CP_2_b.png'
            WHEN name = 'DOUCAL''S' THEN 'DOUCALS/DOUCALS_b.png'
            WHEN name = 'GIVENCHY' THEN 'GIVENCHY/GIVENCHY_b.png'
            WHEN name = 'GOLDEN GOOSE' THEN 'GOLDEN GOOSE/GOLDEN_b.png'
            WHEN name = 'JACOB COHEN' THEN 'JACOBCOHEN/JACOB_b.png'
            WHEN name = 'K-WAY' THEN 'K-WAY/KWAY_b.png'
            WHEN name = 'LANVIN' THEN 'LANVIN/LANVIN_b.png'
            WHEN name = 'AFTER LABEL' THEN 'AFTER LABEL/AFTER_b.png'
            WHEN name = 'MARGIELA' THEN 'MARGIELA/MARGIELA_b.png'
            WHEN name = 'MARNI' THEN 'MARNI/MARNI_b.png'
            WHEN name = 'MERCER' THEN 'MERCER/MERCER_b.png'
            WHEN name = 'MONCLER' THEN 'MONCLER/MONCLER_b.png'
            WHEN name = 'NUMERO 21' THEN 'NUMERO21/N21_b.png'
            WHEN name = 'OFF-WHITE' THEN 'OFF-WHITE/OFF-WHITE_b.png'
            WHEN name = 'PALM ANGELS' THEN 'PALM ANGELS/PALMANGELS_b.png'
            WHEN name = 'PARAJUMPERS' THEN 'PARAJUMPERS/PARAJUMPERS_b.png'
            WHEN name = 'PATAGONIA' THEN 'PATAGONIA/PATAGONIA_b.png'
            WHEN name = 'PYRENEX' THEN 'PYRENEX/PYRENEX_b.png'
            WHEN name = 'RAINS' THEN 'RAINS/RAINS_b.png'
            WHEN name = 'RRD' THEN 'RRD/RRD_b.png'
            WHEN name = 'SALOMON' THEN 'SALOMON/SALOMON_1_b.png'
            WHEN name = 'TOPOLOGIE' THEN 'TOPOLOGIE/topo_b.png'
            WHEN name = 'WHITE SAND' THEN 'WHITE SAND/white_b.png'
            WHEN name = 'MANUEL RITZ' THEN 'MANUELRITZ/manuel_b.png'
            WHEN name = 'LES DEUX' THEN 'LESDEUX/lesdeux_b.png'
            WHEN name = 'SERAPHIN' THEN 'SERAPHIN/SERAPHIN_b.png'
            WHEN name = 'MIZUNO' THEN 'MIZUNO/MIZUNO_b.png'
            WHEN name = 'HOLOGRAM' THEN 'HOLOGRAM/HOLOGRAM_b.png'
            WHEN name = 'ATELIER DE NIMES' THEN 'ATELIER DE NIMES/ATELIER_b.png'
            WHEN name = 'NOMAD SOCIETY' THEN 'NOMAD_SOCIETY/NOMAD_b.png'
            WHEN name = 'NORSE PROJECTS' THEN 'NORSE PROJECTS/NORSE_b.png'
            WHEN name = 'PHILIPPE MODEL' THEN 'PHILIPPE MODEL/PHILIPPE_b.png'
            WHEN name = 'ZADIG & VOLTAIRE' THEN 'ZADIG & VOLTAIRE/ZADIG_b.png'
            WHEN name = 'DSQUARED' THEN 'DSQUARED/DSQUARED_b.png'
            WHEN name = 'VILBREQUIN' THEN 'VILBREQUIN/VILBREQUIN_b.png'
            WHEN name = 'FINAMORE' THEN 'FINAMORE/FINAMORE_b.png'
            WHEN name = 'GCDS' THEN 'GCDS/GCDS_b.png'
            WHEN name = 'MAISON LABICHE' THEN 'MAISON LABICHE/MAISON_b.png'
            WHEN name = 'JONSEN' THEN 'JONSEN/JONSEN_b.png'
            WHEN name = 'VEJA' THEN 'VEJA/VEJA_b.png'
            WHEN name = 'DOLCE & GABBANA' THEN 'DOLCE & GABBANA/DOLCE_b.png'
            WHEN name = 'NEW BALANCE' THEN 'NEW BALANCE/NEWBALANCE_b.png'
            WHEN name = 'PREMIATA' THEN 'PREMIATA/PREMIATA_b.png'
            WHEN name = 'MC2' THEN 'MC2/MC2_b.png'
            WHEN name = 'PHILIP KARTO' THEN 'PHILIP KARTO/PHILIP_b.png'
            ELSE name || '/' || REPLACE(REPLACE(name, ' ', ''), '''', '') || '_b.png'
        END),
    logo_dark = CONCAT('/brands/', 
        CASE 
            WHEN name = 'STONE ISLAND' THEN 'STONE ISLAND/STONE_ISLAND_1_b.png'
            WHEN name = 'NIKE' THEN 'NIKE/LOGO.png'
            WHEN name = 'AUTRY' THEN 'AUTRY/AUTRY_b.png'
            WHEN name = 'APC' THEN 'APC/APC_b.png'
            WHEN name = 'AXEL ARIGATO' THEN 'AXEL ARIGATO/AXEL_b.png'
            WHEN name = 'HERNO' THEN 'HERNO/HERNO_b.png'
            WHEN name = 'ARTE' THEN 'ARTE/ARTE_b.png'
            WHEN name = 'ASPESI' THEN 'ASPESI/aspesi_b.png'
            WHEN name = 'BISOUS SKATEBOARDS' THEN 'BISOUS SKATEBOARDS/BISOUS_b.png'
            WHEN name = 'CARHART' THEN 'CARHARTT/CARHARTT_b.png'
            WHEN name = 'CHLOE' THEN 'CHLOE/CHLOE_b.png'
            WHEN name = 'C.P.COMPANY' THEN 'CP COMPANY/CP_2_b.png'
            WHEN name = 'DOUCAL''S' THEN 'DOUCALS/DOUCALS_b.png'
            WHEN name = 'GIVENCHY' THEN 'GIVENCHY/GIVENCHY_b.png'
            WHEN name = 'GOLDEN GOOSE' THEN 'GOLDEN GOOSE/GOLDEN_b.png'
            WHEN name = 'JACOB COHEN' THEN 'JACOBCOHEN/JACOB_b.png'
            WHEN name = 'K-WAY' THEN 'K-WAY/KWAY_b.png'
            WHEN name = 'LANVIN' THEN 'LANVIN/LANVIN_b.png'
            WHEN name = 'AFTER LABEL' THEN 'AFTER LABEL/AFTER_b.png'
            WHEN name = 'MARGIELA' THEN 'MARGIELA/MARGIELA_b.png'
            WHEN name = 'MARNI' THEN 'MARNI/MARNI_b.png'
            WHEN name = 'MERCER' THEN 'MERCER/MERCER_b.png'
            WHEN name = 'MONCLER' THEN 'MONCLER/MONCLER_b.png'
            WHEN name = 'NUMERO 21' THEN 'NUMERO21/N21_b.png'
            WHEN name = 'OFF-WHITE' THEN 'OFF-WHITE/OFF-WHITE_b.png'
            WHEN name = 'PALM ANGELS' THEN 'PALM ANGELS/PALMANGELS_b.png'
            WHEN name = 'PARAJUMPERS' THEN 'PARAJUMPERS/PARAJUMPERS_b.png'
            WHEN name = 'PATAGONIA' THEN 'PATAGONIA/PATAGONIA_b.png'
            WHEN name = 'PYRENEX' THEN 'PYRENEX/PYRENEX_b.png'
            WHEN name = 'RAINS' THEN 'RAINS/RAINS_b.png'
            WHEN name = 'RRD' THEN 'RRD/RRD_b.png'
            WHEN name = 'SALOMON' THEN 'SALOMON/SALOMON_1_b.png'
            WHEN name = 'TOPOLOGIE' THEN 'TOPOLOGIE/topo_b.png'
            WHEN name = 'WHITE SAND' THEN 'WHITE SAND/white_b.png'
            WHEN name = 'MANUEL RITZ' THEN 'MANUELRITZ/manuel_b.png'
            WHEN name = 'LES DEUX' THEN 'LESDEUX/lesdeux_b.png'
            WHEN name = 'SERAPHIN' THEN 'SERAPHIN/SERAPHIN_b.png'
            WHEN name = 'MIZUNO' THEN 'MIZUNO/MIZUNO_b.png'
            WHEN name = 'HOLOGRAM' THEN 'HOLOGRAM/HOLOGRAM_b.png'
            WHEN name = 'ATELIER DE NIMES' THEN 'ATELIER DE NIMES/ATELIER_b.png'
            WHEN name = 'NOMAD SOCIETY' THEN 'NOMAD_SOCIETY/NOMAD_b.png'
            WHEN name = 'NORSE PROJECTS' THEN 'NORSE PROJECTS/NORSE_b.png'
            WHEN name = 'PHILIPPE MODEL' THEN 'PHILIPPE MODEL/PHILIPPE_b.png'
            WHEN name = 'ZADIG & VOLTAIRE' THEN 'ZADIG & VOLTAIRE/ZADIG_b.png'
            WHEN name = 'DSQUARED' THEN 'DSQUARED/DSQUARED_b.png'
            WHEN name = 'VILBREQUIN' THEN 'VILBREQUIN/VILBREQUIN_b.png'
            WHEN name = 'FINAMORE' THEN 'FINAMORE/FINAMORE_b.png'
            WHEN name = 'GCDS' THEN 'GCDS/GCDS_b.png'
            WHEN name = 'MAISON LABICHE' THEN 'MAISON LABICHE/MAISON_b.png'
            WHEN name = 'JONSEN' THEN 'JONSEN/JONSEN_b.png'
            WHEN name = 'VEJA' THEN 'VEJA/VEJA_b.png'
            WHEN name = 'DOLCE & GABBANA' THEN 'DOLCE & GABBANA/DOLCE_b.png'
            WHEN name = 'NEW BALANCE' THEN 'NEW BALANCE/NEWBALANCE_b.png'
            WHEN name = 'PREMIATA' THEN 'PREMIATA/PREMIATA_b.png'
            WHEN name = 'MC2' THEN 'MC2/MC2_b.png'
            WHEN name = 'PHILIP KARTO' THEN 'PHILIP KARTO/PHILIP_b.png'
            ELSE name || '/' || REPLACE(REPLACE(name, ' ', ''), '''', '') || '_b.png'
        END),
    logo_light = CONCAT('/brands/', 
        CASE 
            WHEN name = 'STONE ISLAND' THEN 'STONE ISLAND/STONE_ISLAND_1_w.png'
            WHEN name = 'NIKE' THEN 'NIKE/LOGO.png'
            WHEN name = 'AUTRY' THEN 'AUTRY/AUTRY_w.png'
            WHEN name = 'APC' THEN 'APC/APC_w.png'
            WHEN name = 'AXEL ARIGATO' THEN 'AXEL ARIGATO/AXEL_w.png'
            WHEN name = 'HERNO' THEN 'HERNO/HERNO_w.png'
            WHEN name = 'ARTE' THEN 'ARTE/ARTE_w.png'
            WHEN name = 'ASPESI' THEN 'ASPESI/aspesi_w.png'
            WHEN name = 'BISOUS SKATEBOARDS' THEN 'BISOUS SKATEBOARDS/BISOUS_w.png'
            WHEN name = 'CARHART' THEN 'CARHARTT/CARHARTT_w.png'
            WHEN name = 'CHLOE' THEN 'CHLOE/CHLOE_w.png'
            WHEN name = 'C.P.COMPANY' THEN 'CP COMPANY/CP_2_w.png'
            WHEN name = 'DOUCAL''S' THEN 'DOUCALS/DOUCALS_w.png'
            WHEN name = 'GIVENCHY' THEN 'GIVENCHY/GIVENCHY_w.png'
            WHEN name = 'GOLDEN GOOSE' THEN 'GOLDEN GOOSE/GOLDEN_w.png'
            WHEN name = 'JACOB COHEN' THEN 'JACOBCOHEN/JACOB_w.png'
            WHEN name = 'K-WAY' THEN 'K-WAY/KWAY_w.png'
            WHEN name = 'LANVIN' THEN 'LANVIN/LANVIN_w.png'
            WHEN name = 'AFTER LABEL' THEN 'AFTER LABEL/AFTER_w.png'
            WHEN name = 'MARGIELA' THEN 'MARGIELA/MARGIELA_w.png'
            WHEN name = 'MARNI' THEN 'MARNI/MARNI_w.png'
            WHEN name = 'MERCER' THEN 'MERCER/MERCER_w.png'
            WHEN name = 'MONCLER' THEN 'MONCLER/MONCLER_w.png'
            WHEN name = 'NUMERO 21' THEN 'NUMERO21/N21_w 2.png'
            WHEN name = 'OFF-WHITE' THEN 'OFF-WHITE/OFF-WHITE_w.png'
            WHEN name = 'PALM ANGELS' THEN 'PALM ANGELS/PALMANGELS_w.png'
            WHEN name = 'PARAJUMPERS' THEN 'PARAJUMPERS/PARAJUMPERS_w.png'
            WHEN name = 'PATAGONIA' THEN 'PATAGONIA/PATAGONIA_w.png'
            WHEN name = 'PYRENEX' THEN 'PYRENEX/PYRENEX_w.png'
            WHEN name = 'RAINS' THEN 'RAINS/RAINS_w.png'
            WHEN name = 'RRD' THEN 'RRD/RRD_w.png'
            WHEN name = 'SALOMON' THEN 'SALOMON/SALOMON_1_w.png'
            WHEN name = 'TOPOLOGIE' THEN 'TOPOLOGIE/topo_w.png'
            WHEN name = 'WHITE SAND' THEN 'WHITE SAND/white_w.png'
            WHEN name = 'MANUEL RITZ' THEN 'MANUELRITZ/manuel_w.png'
            WHEN name = 'LES DEUX' THEN 'LESDEUX/lesdeux_w.png'
            WHEN name = 'SERAPHIN' THEN 'SERAPHIN/SERAPHIN_w.png'
            WHEN name = 'MIZUNO' THEN 'MIZUNO/MIZUNO_w.png'
            WHEN name = 'HOLOGRAM' THEN 'HOLOGRAM/HOLOGRAM_w.png'
            WHEN name = 'ATELIER DE NIMES' THEN 'ATELIER DE NIMES/ATELIER_w.png'
            WHEN name = 'NOMAD SOCIETY' THEN 'NOMAD_SOCIETY/NOMAD_w.png'
            WHEN name = 'NORSE PROJECTS' THEN 'NORSE PROJECTS/NORSE_w.png'
            WHEN name = 'PHILIPPE MODEL' THEN 'PHILIPPE MODEL/PHILIPPE_w.png'
            WHEN name = 'ZADIG & VOLTAIRE' THEN 'ZADIG & VOLTAIRE/ZADIG_w.png'
            WHEN name = 'DSQUARED' THEN 'DSQUARED/DSQUARED_w.png'
            WHEN name = 'VILBREQUIN' THEN 'VILBREQUIN/VILBREQUIN_w.png'
            WHEN name = 'FINAMORE' THEN 'FINAMORE/FINAMORE_w.png'
            WHEN name = 'GCDS' THEN 'GCDS/GCDS_w.png'
            WHEN name = 'MAISON LABICHE' THEN 'MAISON LABICHE/MAISON_w.png'
            WHEN name = 'JONSEN' THEN 'JONSEN/JONSEN_w.png'
            WHEN name = 'VEJA' THEN 'VEJA/VEJA_w.png'
            WHEN name = 'DOLCE & GABBANA' THEN 'DOLCE & GABBANA/DOLCE_w.png'
            WHEN name = 'NEW BALANCE' THEN 'NEW BALANCE/NEWBALANCE_w.png'
            WHEN name = 'PREMIATA' THEN 'PREMIATA/PREMIATA_w.png'
            WHEN name = 'MC2' THEN 'MC2/MC2_w.png'
            WHEN name = 'PHILIP KARTO' THEN 'PHILIP KARTO/PHILIP_w.png'
            ELSE name || '/' || REPLACE(REPLACE(name, ' ', ''), '''', '') || '_w.png'
        END);

-- Mise à jour des chemins des images de produits
UPDATE products 
SET image_url = CASE
    WHEN image_url IS NULL OR image_url = '' THEN '/uploads/product-placeholder.jpg'
    WHEN image_url NOT LIKE '/uploads/%' THEN CONCAT('/uploads/', SUBSTRING(image_url FROM '[^/]+$'))
    ELSE image_url
END;

-- Vérification des mises à jour
SELECT name, logo_url, logo_dark, logo_light 
FROM brands 
ORDER BY name; 