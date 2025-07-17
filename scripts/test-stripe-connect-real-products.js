const axios = require('axios');

// Configuration du test
const API_BASE_URL = 'http://localhost:3000';
const RAILWAY_API_URL = 'https://reboul-store-api-production.up.railway.app/api';
const TEST_USER_EMAIL = 'test@reboul.com';

/**
 * Récupère de vrais produits depuis l'API Railway
 */
async function fetchRealProducts() {
  console.log('📦 Récupération des vrais produits...');
  
  try {
    // Récupérer des produits The Corner
    const cornerResponse = await axios.get(`${RAILWAY_API_URL}/corner-products?limit=5`);
    const cornerProducts = cornerResponse.data.data || [];
    
    // Récupérer des produits Reboul (supposant qu'ils sont dans /products)
    const reboulResponse = await axios.get(`${RAILWAY_API_URL}/products?limit=5`);
    const reboulProducts = reboulResponse.data.data || [];
    
    console.log(`✅ Récupéré ${cornerProducts.length} produits The Corner`);
    console.log(`✅ Récupéré ${reboulProducts.length} produits Reboul`);
    
    return {
      corner: cornerProducts,
      reboul: reboulProducts
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error.message);
    return {
      corner: [],
      reboul: []
    };
  }
}

/**
 * Convertit un produit API en format test
 */
function convertProductToTestFormat(product, quantity = 1) {
  // Normaliser les variants
  let variants = [];
  if (product.variants) {
    if (typeof product.variants === 'string') {
      try {
        variants = JSON.parse(product.variants);
      } catch (e) {
        console.warn(`Erreur parsing variants pour ${product.id}:`, e.message);
      }
    } else if (Array.isArray(product.variants)) {
      variants = product.variants;
    }
  }
  
  // Prendre le premier variant disponible
  const firstVariant = variants.length > 0 ? variants[0] : {
    size: 'M',
    color: 'Noir',
    taille: 'M',
    couleur: 'Noir',
    stock: 1
  };
  
  // Normaliser l'image
  let imageUrl = '';
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    imageUrl = product.images[0];
  } else if (product.image_url) {
    imageUrl = product.image_url;
  } else if (product.image) {
    imageUrl = product.image;
  }
  
  // Convertir en URL absolue si nécessaire
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `https://reboul.com${imageUrl}`;
  }
  
  return {
    id: product.id,
    name: product.name || `Produit ${product.id}`,
    price: parseFloat(product.price) || 29.99,
    quantity: quantity,
    image: imageUrl || 'https://reboul.com/placeholder.png',
    variant: {
      size: firstVariant.size || firstVariant.taille || 'M',
      color: firstVariant.color || firstVariant.couleur || 'Noir',
      colorLabel: firstVariant.color || firstVariant.couleur || 'Noir',
      stock: parseInt(firstVariant.stock) || 1
    }
  };
}

/**
 * Génère des scénarios de test avec de vrais produits
 */
async function generateRealTestScenarios() {
  const products = await fetchRealProducts();
  
  if (products.corner.length === 0 && products.reboul.length === 0) {
    console.error('❌ Aucun produit récupéré, impossible de créer les scénarios');
    return null;
  }
  
  const scenarios = {};
  
  // Scénario 1: Produits The Corner uniquement
  if (products.corner.length > 0) {
    const cornerItems = products.corner.slice(0, 2).map(p => convertProductToTestFormat(p, 1));
    scenarios.corner_only = {
      description: 'Produits The Corner uniquement',
      items: cornerItems
    };
    
    console.log(`📋 Scénario Corner: ${cornerItems.length} produits`);
    cornerItems.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id}) - ${item.price}€`);
    });
  }
  
  // Scénario 2: Produits Reboul uniquement
  if (products.reboul.length > 0) {
    const reboulItems = products.reboul.slice(0, 2).map(p => convertProductToTestFormat(p, 1));
    scenarios.reboul_only = {
      description: 'Produits Reboul uniquement',
      items: reboulItems
    };
    
    console.log(`📋 Scénario Reboul: ${reboulItems.length} produits`);
    reboulItems.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id}) - ${item.price}€`);
    });
  }
  
  // Scénario 3: Panier mixte
  if (products.corner.length > 0 && products.reboul.length > 0) {
    const mixedItems = [
      convertProductToTestFormat(products.reboul[0], 1),
      convertProductToTestFormat(products.corner[0], 1)
    ];
    scenarios.mixed_cart = {
      description: 'Panier mixte (Reboul + The Corner)',
      items: mixedItems
    };
    
    console.log(`📋 Scénario Mixte: ${mixedItems.length} produits`);
    mixedItems.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id}) - ${item.price}€`);
    });
  }
  
  return scenarios;
}

/**
 * Teste un scénario de checkout avec de vrais produits
 */
async function testCheckoutScenario(scenarioName, testData) {
  console.log(`\n🧪 Test du scénario: ${scenarioName}`);
  console.log(`📝 ${testData.description}`);
  console.log('=' .repeat(60));
  
  try {
    const payload = {
      items: testData.items,
      cart_id: `real-test-cart-${Date.now()}`,
      shipping_method: 'standard',
      force_user_email: TEST_USER_EMAIL,
      discount_code: null
    };
    
    console.log(`📦 Envoi de ${testData.items.length} vrais produits...`);
    testData.items.forEach(item => {
      console.log(`   - ${item.name} (ID: ${item.id}) - ${item.price}€`);
    });
    
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
    console.log(`   - URL de paiement: ${result.primary_session.url.substring(0, 80)}...`);
    
    if (result.all_sessions) {
      console.log(`\n📋 Détail des sessions:`);
      result.all_sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.store_info.displayName}`);
        console.log(`      - Session ID: ${session.session_id.substring(0, 40)}...`);
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
 * Affiche des informations détaillées sur les produits
 */
async function displayProductInfo() {
  console.log('\n🔍 Informations sur les produits dans la base de données');
  console.log('='.repeat(60));
  
  try {
    // Récupérer quelques produits The Corner avec détails
    const cornerResponse = await axios.get(`${RAILWAY_API_URL}/corner-products?limit=3`);
    const cornerProducts = cornerResponse.data.data || [];
    
    if (cornerProducts.length > 0) {
      console.log('📦 Produits The Corner:');
      cornerProducts.forEach(product => {
        console.log(`   ID ${product.id}: ${product.name}`);
        console.log(`      Prix: ${product.price}€`);
        console.log(`      Marque: ${product.brand || 'Non spécifiée'}`);
        if (product.variants) {
          const variantCount = Array.isArray(product.variants) ? product.variants.length : 
                             (typeof product.variants === 'string' ? JSON.parse(product.variants).length : 0);
          console.log(`      Variants: ${variantCount}`);
        }
      });
    }
    
    // Récupérer quelques produits Reboul
    const reboulResponse = await axios.get(`${RAILWAY_API_URL}/products?limit=3`);
    const reboulProducts = reboulResponse.data.data || [];
    
    if (reboulProducts.length > 0) {
      console.log('\n📦 Produits Reboul:');
      reboulProducts.forEach(product => {
        console.log(`   ID ${product.id}: ${product.name}`);
        console.log(`      Prix: ${product.price}€`);
        console.log(`      Marque: ${product.brand || 'Non spécifiée'}`);
        if (product.variants) {
          const variantCount = Array.isArray(product.variants) ? product.variants.length : 
                             (typeof product.variants === 'string' ? JSON.parse(product.variants).length : 0);
          console.log(`      Variants: ${variantCount}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des infos produits:', error.message);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🏪 Test Stripe Connect avec de VRAIS produits');
  console.log('='.repeat(60));
  console.log(`🌐 API Railway: ${RAILWAY_API_URL}`);
  console.log(`🖥️  API Frontend: ${API_BASE_URL}`);
  console.log('='.repeat(60));
  
  // Étape 1: Afficher les informations sur les produits
  await displayProductInfo();
  
  // Étape 2: Générer les scénarios de test avec de vrais produits
  const scenarios = await generateRealTestScenarios();
  
  if (!scenarios || Object.keys(scenarios).length === 0) {
    console.error('❌ Impossible de générer les scénarios de test');
    return;
  }
  
  // Étape 3: Exécuter les tests
  console.log('\n🚀 Démarrage des tests avec vrais produits');
  console.log('='.repeat(60));
  
  const results = {};
  let passedTests = 0;
  let totalTests = 0;
  
  for (const [scenarioName, testData] of Object.entries(scenarios)) {
    const result = await testCheckoutScenario(scenarioName, testData);
    results[scenarioName] = result;
    totalTests++;
    
    if (result.success) {
      passedTests++;
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Résumé des résultats
  console.log('\n📊 RÉSUMÉ DES TESTS AVEC VRAIS PRODUITS');
  console.log('='.repeat(60));
  
  for (const [scenarioName, result] of Object.entries(results)) {
    const status = result.success ? '✅ RÉUSSI' : '❌ ÉCHOUÉ';
    console.log(`${status} - ${scenarioName}`);
    
    if (result.success) {
      const sessions = result.result.session_count;
      console.log(`         Sessions: ${sessions}`);
    }
  }
  
  console.log('\n📈 STATISTIQUES FINALES');
  console.log(`Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Tous les tests sont passés ! Stripe Connect fonctionne avec de vrais produits !');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
  
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
  fetchRealProducts,
  convertProductToTestFormat,
  generateRealTestScenarios,
  testCheckoutScenario
}; 