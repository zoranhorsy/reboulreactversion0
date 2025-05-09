/**
 * Tests pour le cartWorker
 * Ce script ne peut pas être exécuté directement dans Node.js car les workers
 * ne sont pas supportés dans le même contexte que Node.js.
 * Il sert de référence pour les tests à réaliser dans le navigateur.
 */

// Données de test pour cartWorker
const testData = {
  // Test de base
  basic: {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'T-shirt', 
        price: 25, 
        quantity: 2,
        image: '/images/tshirt.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      },
      {
        id: '2', 
        name: 'Pantalon', 
        price: 50, 
        quantity: 1,
        image: '/images/pants.jpg',
        variant: {
          size: 'L',
          color: 'black',
          colorLabel: 'Noir',
          stock: 5
        }
      }
    ],
    options: {
      shippingMethod: 'standard',
      discountCode: 'WELCOME10'
    }
  },
  
  // Test avec code promo WELCOME10
  welcome10: {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'T-shirt', 
        price: 100, 
        quantity: 1,
        image: '/images/tshirt.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      }
    ],
    options: {
      shippingMethod: 'standard',
      discountCode: 'WELCOME10'
    }
  },
  
  // Test avec livraison standard sous le seuil
  standardBelow: {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'T-shirt', 
        price: 40, 
        quantity: 1,
        image: '/images/tshirt.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      }
    ],
    options: {
      shippingMethod: 'standard',
      discountCode: null
    }
  },
  
  // Test avec livraison standard au-dessus du seuil
  standardAbove: {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'T-shirt', 
        price: 60, 
        quantity: 1,
        image: '/images/tshirt.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      }
    ],
    options: {
      shippingMethod: 'standard',
      discountCode: null
    }
  },
  
  // Test avec livraison express sous le seuil
  expressBelow: {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'T-shirt', 
        price: 80, 
        quantity: 1,
        image: '/images/tshirt.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      }
    ],
    options: {
      shippingMethod: 'express',
      discountCode: null
    }
  },
  
  // Test avec livraison express au-dessus du seuil
  expressAbove: {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'T-shirt', 
        price: 120, 
        quantity: 1,
        image: '/images/tshirt.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      }
    ],
    options: {
      shippingMethod: 'express',
      discountCode: null
    }
  }
};

// Résultats attendus (pour documentation)
const expectedResults = {
  basic: {
    subtotal: 100, // (25*2 + 50)
    shipping: 0, // Gratuit car > 50€
    discount: 10, // 10% de 100€
    total: 90, // 100 + 0 - 10
    itemCount: 3 // 2 + 1
  },
  welcome10: {
    subtotal: 100,
    shipping: 0, // Gratuit car > 50€
    discount: 10, // 10% de 100€
    total: 90,
    itemCount: 1
  },
  standardBelow: {
    subtotal: 40,
    shipping: 8, // Sous le seuil de 50€
    discount: 0,
    total: 48,
    itemCount: 1
  },
  standardAbove: {
    subtotal: 60,
    shipping: 0, // Au-dessus du seuil de 50€
    discount: 0,
    total: 60,
    itemCount: 1
  },
  expressBelow: {
    subtotal: 80,
    shipping: 15, // Sous le seuil de 100€
    discount: 0,
    total: 95,
    itemCount: 1
  },
  expressAbove: {
    subtotal: 120,
    shipping: 0, // Au-dessus du seuil de 100€
    discount: 0,
    total: 120,
    itemCount: 1
  }
};

// Cette fonction est une référence pour les tests à exécuter dans le navigateur
async function runCartWorkerTests() {
  console.log('Ces tests ne peuvent pas être exécutés directement via Node.js.');
  console.log('Veuillez utiliser la page HTML de test dans le navigateur.');
}

// Exporter pour référence
module.exports = {
  testData,
  expectedResults,
  runCartWorkerTests
}; 