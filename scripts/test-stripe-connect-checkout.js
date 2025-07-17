const axios = require('axios');

// Configuration du test
const API_BASE_URL = 'http://localhost:3000';
const RAILWAY_API_URL = 'https://reboul-store-api-production.up.railway.app/api';
const TEST_USER_EMAIL = 'test@reboul.com';

// Données de test avec URLs d'images valides
const TEST_SCENARIOS = {
  // Scénario 1: Produits Reboul uniquement
  reboul_only: {
    items: [
      {
        id: 1, // ID d'un produit Reboul
        name: 'T-shirt Reboul',
        price: 29.99,
        quantity: 1,
        image: 'https://reboul.com/placeholder.png', // URL valide
        variant: {
          size: 'M',
          color: 'Noir',
          colorLabel: 'Noir',
          stock: 10
        }
      },
      {
        id: 2, // ID d'un autre produit Reboul
        name: 'Pantalon Reboul',
        price: 59.99,
        quantity: 2,
        image: 'https://reboul.com/placeholder.png', // URL valide
        variant: {
          size: 'L',
          color: 'Bleu',
          colorLabel: 'Bleu',
          stock: 5
        }
      }
    ]
  },
  
  // Scénario 2: Produits The Corner uniquement
  corner_only: {
    items: [
      {
        id: 101, // ID d'un produit The Corner (supposé)
        name: 'Veste CP Company',
        price: 149.99,
        quantity: 1,
        image: 'https://reboul.com/placeholder.png', // URL valide
        variant: {
          size: 'L',
          color: 'Gris',
          colorLabel: 'Gris',
          stock: 3
        }
      }
    ]
  },
  
  // Scénario 3: Panier mixte (Reboul + The Corner)
  mixed_cart: {
    items: [
      {
        id: 1, // Produit Reboul
        name: 'T-shirt Reboul',
        price: 29.99,
        quantity: 1,
        image: 'https://reboul.com/placeholder.png', // URL valide
        variant: {
          size: 'M',
          color: 'Noir',
          colorLabel: 'Noir',
          stock: 10
        }
      },
      {
        id: 101, // Produit The Corner
        name: 'Veste CP Company',
        price: 149.99,
        quantity: 1,
        image: 'https://reboul.com/placeholder.png', // URL valide
        variant: {
          size: 'L',
          color: 'Gris',
          colorLabel: 'Gris',
          stock: 3
        }
      }
    ]
  }
};

/**
 * Teste un scénario de checkout
 */
async function testCheckoutScenario(scenarioName, testData) {
  console.log(`\n🧪 Test du scénario: ${scenarioName}`);
  console.log('=' .repeat(50));
  
  try {
    const payload = {
      items: testData.items,
      cart_id: `test-cart-${Date.now()}`,
      shipping_method: 'standard',
      force_user_email: TEST_USER_EMAIL,
      discount_code: null
    };
    
    console.log(`📦 Envoi de ${testData.items.length} produits...`);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/checkout/create-cart-session-connect`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    const result = response.data;
    
    console.log('✅ Succès !');
    console.log(`📊 Résultat:`);
    console.log(`   - Sessions créées: ${result.session_count}`);
    console.log(`   - Session principale: ${result.primary_session.store}`);
    console.log(`   - Numéro de commande: ${result.primary_session.order_number}`);
    console.log(`   - URL de paiement: ${result.primary_session.url}`);
    
    if (result.all_sessions) {
      console.log(`\n📋 Détail des sessions:`);
      result.all_sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.store_info.displayName}`);
        console.log(`      - Session ID: ${session.session_id}`);
        console.log(`      - Commande: ${session.order_number}`);
        console.log(`      - Articles: ${session.item_count}`);
      });
    }
    
    return {
      success: true,
      result
    };
    
  } catch (error) {
    console.log('❌ Erreur !');
    
    if (error.response) {
      console.log(`   - Statut: ${error.response.status}`);
      console.log(`   - Erreur: ${error.response.data.error}`);
      console.log(`   - Détails: ${error.response.data.details}`);
    } else {
      console.log(`   - Erreur: ${error.message}`);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Teste tous les scénarios
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests Stripe Connect Checkout');
  console.log('='.repeat(60));
  
  const results = {};
  
  for (const [scenarioName, testData] of Object.entries(TEST_SCENARIOS)) {
    const result = await testCheckoutScenario(scenarioName, testData);
    results[scenarioName] = result;
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Résumé des résultats
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  
  let passedTests = 0;
  let totalTests = 0;
  
  for (const [scenarioName, result] of Object.entries(results)) {
    totalTests++;
    const status = result.success ? '✅ RÉUSSI' : '❌ ÉCHOUÉ';
    console.log(`${status} - ${scenarioName}`);
    
    if (result.success) {
      passedTests++;
      const sessions = result.result.session_count;
      console.log(`         Sessions: ${sessions}`);
    }
  }
  
  console.log('\n📈 STATISTIQUES');
  console.log(`Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Tous les tests sont passés ! Stripe Connect fonctionne correctement.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
}

/**
 * Teste spécifiquement la détection des magasins
 */
async function testStoreDetection() {
  console.log('\n🔍 Test de détection des magasins');
  console.log('='.repeat(40));
  
  const testProductIds = [1, 2, 3, 101, 102, 103]; // IDs de test
  
  for (const productId of testProductIds) {
    try {
      // Utiliser directement l'API Railway pour tester
      const cornerResponse = await axios.get(
        `${RAILWAY_API_URL}/corner-products/${productId}`,
        { 
          validateStatus: () => true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const isCornerProduct = cornerResponse.status === 200;
      const store = isCornerProduct ? 'The Corner' : 'Reboul';
      
      console.log(`   Produit ${productId}: ${store} (${cornerResponse.status})`);
      
      if (isCornerProduct) {
        console.log(`      → Nom: ${cornerResponse.data.name || 'Non disponible'}`);
      }
    } catch (error) {
      console.log(`   Produit ${productId}: Erreur - ${error.message}`);
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🏪 Test du système Stripe Connect - Reboul & The Corner');
  console.log('='.repeat(60));
  console.log(`🌐 API Railway: ${RAILWAY_API_URL}`);
  console.log(`🖥️  API Frontend: ${API_BASE_URL}`);
  console.log('='.repeat(60));
  
  // Test 1: Détection des magasins
  await testStoreDetection();
  
  // Test 2: Scénarios de checkout
  await runAllTests();
  
  console.log('\n✨ Tests terminés !');
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur lors des tests:', error);
    process.exit(1);
  });
}

module.exports = {
  testCheckoutScenario,
  runAllTests,
  testStoreDetection,
  TEST_SCENARIOS
}; 