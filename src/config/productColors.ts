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
]

export function getColorValue(colorName: string): string {
    const color = productColors.find(c => c.name.toLowerCase() === colorName.toLowerCase())
    return color ? color.value : '#CCCCCC' // Couleur par défaut si non trouvée
}

export function getColorName(colorValue: string): string {
    const color = productColors.find(c => c.value.toLowerCase() === colorValue.toLowerCase())
    return color ? color.name : 'Inconnu' // Nom par défaut si non trouvé
}

