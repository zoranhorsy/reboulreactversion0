/**
 * Script de test pour les Web Workers dans un environnement navigateur
 * Pour l'utiliser, incluez-le dans une page HTML de test
 */

// Fonction pour tester le cartWorker
function testCartWorker() {
  console.log('🧪 Test du cartWorker...');
  
  const testData = {
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
  };

  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker('/workers/cartWorker.js');
      
      worker.onmessage = (e) => {
        console.log('✅ Réponse du cartWorker:', e.data);
        worker.terminate();
        resolve(e.data);
      };
      
      worker.onerror = (error) => {
        console.error('❌ Erreur du cartWorker:', error);
        worker.terminate();
        reject(error);
      };
      
      console.log('→ Envoi des données au cartWorker:', testData);
      worker.postMessage(testData);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du cartWorker:', error);
      reject(error);
    }
  });
}

// Fonction pour tester des codes promo spécifiques
function testPromoCode(code) {
  console.log(`🧪 Test du code promo "${code}"...`);
  
  const testData = {
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
      }
    ],
    options: {
      shippingMethod: 'standard',
      discountCode: code
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker('/workers/cartWorker.js');
      
      worker.onmessage = (e) => {
        console.log(`✅ Résultat pour code "${code}":`, e.data);
        worker.terminate();
        resolve(e.data);
      };
      
      worker.onerror = (error) => {
        console.error(`❌ Erreur avec code "${code}":`, error);
        worker.terminate();
        reject(error);
      };
      
      worker.postMessage(testData);
    } catch (error) {
      console.error(`❌ Erreur lors de l'initialisation du worker pour code "${code}":`, error);
      reject(error);
    }
  });
}

// Fonction pour tester différentes méthodes de livraison
function testShippingMethod(method, subtotal) {
  console.log(`🧪 Test de la méthode de livraison "${method}" avec sous-total ${subtotal}€...`);
  
  const testData = {
    type: 'CALCULATE_TOTAL',
    items: [
      {
        id: '1', 
        name: 'Test', 
        price: subtotal, 
        quantity: 1,
        image: '/images/test.jpg',
        variant: {
          size: 'M',
          color: 'blue',
          colorLabel: 'Bleu',
          stock: 10
        }
      }
    ],
    options: {
      shippingMethod: method,
      discountCode: null
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker('/workers/cartWorker.js');
      
      worker.onmessage = (e) => {
        console.log(`✅ Résultat pour "${method}" (${subtotal}€):`, e.data);
        worker.terminate();
        resolve(e.data);
      };
      
      worker.onerror = (error) => {
        console.error(`❌ Erreur avec "${method}" (${subtotal}€):`, error);
        worker.terminate();
        reject(error);
      };
      
      worker.postMessage(testData);
    } catch (error) {
      console.error(`❌ Erreur lors de l'initialisation du worker pour "${method}":`, error);
      reject(error);
    }
  });
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests des Web Workers...');
  
  try {
    // Test de base
    await testCartWorker();
    
    // Tests des codes promo
    console.log('\n📦 Tests des codes promo:');
    await testPromoCode('WELCOME10');
    await testPromoCode('SUMMER20');
    await testPromoCode('REBOUL25');
    await testPromoCode('FREE50');
    await testPromoCode('INVALID');
    
    // Tests des méthodes de livraison
    console.log('\n🚚 Tests des méthodes de livraison:');
    
    // Standard
    await testShippingMethod('standard', 40); // En dessous du seuil
    await testShippingMethod('standard', 60); // Au-dessus du seuil
    
    // Express
    await testShippingMethod('express', 80); // En dessous du seuil
    await testShippingMethod('express', 120); // Au-dessus du seuil
    
    // Pickup
    await testShippingMethod('pickup', 50);
    
    console.log('\n✨ Tous les tests sont terminés avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
  }
}

// Si ce script est inclus dans une page HTML, exécuter les tests
if (typeof window !== 'undefined') {
  // Ajouter un bouton pour lancer les tests
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.textContent = 'Lancer les tests des Workers';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.margin = '20px';
    button.onclick = runAllTests;
    
    const results = document.createElement('pre');
    results.id = 'results';
    results.style.margin = '20px';
    results.style.padding = '15px';
    results.style.backgroundColor = '#f5f5f5';
    results.style.borderRadius = '5px';
    results.style.maxHeight = '500px';
    results.style.overflow = 'auto';
    
    // Rediriger la console vers notre élément pre
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      results.textContent += args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ') + '\n';
      results.scrollTop = results.scrollHeight;
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      results.textContent += '🔴 ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ') + '\n';
      results.scrollTop = results.scrollHeight;
    };
    
    document.body.appendChild(button);
    document.body.appendChild(results);
  });
} 