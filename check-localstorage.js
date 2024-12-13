// Simuler le localStorage du navigateur avec le contenu réel des produits
const localStorage = {
    getItem: (key) => {
        if (key === 'products') {
            return JSON.stringify([
                {
                    "id": "1",
                    "name": "T-shirt classique",
                    "price": 19.99,
                    "description": "Un t-shirt confortable pour tous les jours",
                    "category": "Vêtements",
                    "brand": "Reboul",
                    "images": ["/images/t-shirt-classique.jpg"],
                    "variants": [
                        { "size": "S", "color": "Blanc", "stock": 10 },
                        { "size": "M", "color": "Blanc", "stock": 15 },
                        { "size": "L", "color": "Blanc", "stock": 20 }
                    ],
                    "tags": ["t-shirt", "basique", "confort"],
                    "reviews": [
                        { "id": 1, "rating": 5, "comment": "Excellent t-shirt, très confortable !", "userName": "Jean D.", "date": "2023-05-15" }
                    ],
                    "questions": [
                        { "id": 1, "question": "Le t-shirt rétrécit-il au lavage ?", "answer": "Non, il est pré-rétréci pour garder sa forme." }
                    ],
                    "faqs": [
                        { "question": "Comment laver ce t-shirt ?", "answer": "Lavage en machine à 30°C, pas de sèche-linge." }
                    ],
                    "sizeChart": [
                        { "size": "S", "chest": 92, "waist": 76, "hips": 92 },
                        { "size": "M", "chest": 100, "waist": 84, "hips": 100 },
                        { "size": "L", "chest": 108, "waist": 92, "hips": 108 }
                    ]
                }
                // Ajoutez ici d'autres produits si vous en avez dans votre localStorage
            ]);
        }
        return null;
    }
};

// Fonction pour récupérer les produits du localStorage
function getProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [];
}

// Vérifier les produits et leurs IDs
const products = getProductsFromLocalStorage();
console.log("Nombre total de produits:", products.length);

products.forEach((product, index) => {
    console.log(`Produit ${index + 1}:`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Nom: ${product.name}`);
    console.log(`  ID valide: ${typeof product.id === 'string' && product.id.length > 0}`);
    console.log('---');
});

// Vérifier si le produit spécifique existe
const specificProductId = "1";  // Changé pour correspondre à l'ID réel du produit
const specificProduct = products.find(p => p.id === specificProductId);

if (specificProduct) {
    console.log("Le produit spécifique a été trouvé:");
    console.log(JSON.stringify(specificProduct, null, 2));
} else {
    console.log(`Aucun produit trouvé avec l'ID: ${specificProductId}`);
}

// Vérification supplémentaire pour tous les champs du produit
if (specificProduct) {
    console.log("\nVérification détaillée du produit:");
    console.log(`Nom: ${specificProduct.name}`);
    console.log(`Prix: ${specificProduct.price}`);
    console.log(`Description: ${specificProduct.description}`);
    console.log(`Catégorie: ${specificProduct.category}`);
    console.log(`Marque: ${specificProduct.brand}`);
    console.log(`Images: ${specificProduct.images.join(', ')}`);
    console.log("Variants:");
    specificProduct.variants.forEach((variant, index) => {
        console.log(`  Variant ${index + 1}: Taille - ${variant.size}, Couleur - ${variant.color}, Stock - ${variant.stock}`);
    });
    console.log(`Tags: ${specificProduct.tags.join(', ')}`);
    console.log(`Nombre d'avis: ${specificProduct.reviews.length}`);
    console.log(`Nombre de questions: ${specificProduct.questions.length}`);
    console.log(`Nombre de FAQs: ${specificProduct.faqs.length}`);
    console.log(`Nombre de tailles dans le guide des tailles: ${specificProduct.sizeChart.length}`);
}