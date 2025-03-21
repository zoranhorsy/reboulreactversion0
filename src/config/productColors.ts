export const productColors = [
    { name: 'Noir', value: '#000000' },
    { name: 'Blanc', value: '#FFFFFF' },
    { name: 'Gris', value: '#808080' },
    { name: 'Bleu Marine', value: '#000080' },
    { name: 'Bleu Ciel', value: '#87CEEB' },
    { name: 'Rouge', value: '#FF0000' },
    { name: 'Vert', value: '#008000' },
    { name: 'Jaune', value: '#FFFF00' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Violet', value: '#800080' },
    { name: 'Rose', value: '#FFB6C1' },
    { name: 'Marron', value: '#8B4513' },
    { name: 'Beige', value: '#F5F5DC' },
    { name: 'Marine', value: '#1B1B3A' },
    { name: 'Bleu', value: '#0052CC' },
]

// Mapping des noms de couleurs standardisés en français vers les valeurs hexadécimales
export const colorMap: Record<string, { hex: string; label: string }> = {
    "noir": { hex: "#000000", label: "Noir" },
    "blanc": { hex: "#FFFFFF", label: "Blanc" },
    "gris": { hex: "#808080", label: "Gris" },
    "marine": { hex: "#1B1B3A", label: "Marine" },
    "bleu": { hex: "#0052CC", label: "Bleu" },
    "bleu-ciel": { hex: "#87CEEB", label: "Bleu Ciel" },
    "bleu-marine": { hex: "#000080", label: "Bleu Marine" },
    "rouge": { hex: "#E12B38", label: "Rouge" },
    "vert": { hex: "#2D8C3C", label: "Vert" },
    "jaune": { hex: "#FFD700", label: "Jaune" },
    "orange": { hex: "#FFA500", label: "Orange" },
    "violet": { hex: "#800080", label: "Violet" },
    "rose": { hex: "#FFB6C1", label: "Rose" },
    "marron": { hex: "#8B4513", label: "Marron" },
    "beige": { hex: "#F5F5DC", label: "Beige" },
    "white": { hex: "#FFFFFF", label: "Blanc" },
    "black": { hex: "#000000", label: "Noir" }
}

/**
 * Récupère la valeur hexadécimale d'une couleur à partir de son nom
 */
export function getColorValue(colorName: string): string {
    const color = productColors.find(c => c.name.toLowerCase() === colorName.toLowerCase())
    return color ? color.value : '#CCCCCC' // Couleur par défaut si non trouvée
}

/**
 * Récupère le nom d'une couleur à partir de sa valeur hexadécimale
 */
export function getColorName(colorValue: string): string {
    const color = productColors.find(c => c.value.toLowerCase() === colorValue.toLowerCase())
    return color ? color.name : 'Inconnu' // Nom par défaut si non trouvé
}

/**
 * Récupère les informations d'une couleur à partir de son identifiant (nom ou code)
 * Format de retour compatible avec l'affichage dans les composants
 */
export function getColorInfo(colorId: string): { hex: string; label: string } {
    if (!colorId) return { hex: '#CCCCCC', label: 'Inconnu' };
    
    // Tentative de récupération depuis le colorMap (prioritaire)
    const mappedColor = colorMap[colorId.toLowerCase()];
    if (mappedColor) return mappedColor;
    
    // Vérifier si c'est directement une valeur hexadécimale
    if (colorId.startsWith('#')) {
        const colorName = getColorName(colorId);
        return { hex: colorId, label: colorName };
    }
    
    // Sinon essayer de trouver par nom dans productColors
    const colorByName = productColors.find(c => c.name.toLowerCase() === colorId.toLowerCase());
    if (colorByName) {
        return { hex: colorByName.value, label: colorByName.name };
    }
    
    // Si aucune correspondance, retourner la valeur originale
    return { hex: colorId, label: colorId };
}

/**
 * Vérifie si une couleur est considérée comme "blanche"
 */
export function isWhiteColor(color: string): boolean {
    if (!color) return false;
    
    const lowerColor = color.toLowerCase();
    return lowerColor === '#ffffff' || 
           lowerColor === '#fff' || 
           lowerColor === 'white' || 
           lowerColor === 'blanc';
}

