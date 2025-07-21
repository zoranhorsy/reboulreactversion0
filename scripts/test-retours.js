const axios = require('axios');

const API_URL = 'https://reboul-store-api-production.up.railway.app';
const ADMIN_EMAIL = 'zoran@reboul.com';
const ADMIN_PASSWORD = 'nouveauMotDePasse123';

async function main() {
  try {
    // 1. Connexion admin pour récupérer le token
    console.log('Connexion admin...');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginRes.data.token || loginRes.data.accessToken;
    if (!token) throw new Error('Token non récupéré !');
    console.log('Token récupéré :', token.slice(0, 20) + '...');

    // 2. Lister les commandes existantes
    console.log('\nListe des commandes existantes :');
    let orders = [];
    try {
      const ordersRes = await axios.get(`${API_URL}/api/orders?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      orders = ordersRes.data.data || ordersRes.data;
      orders.forEach(o => {
        console.log(`- id: ${o.id}, statut: ${o.status}, montant: ${o.total_amount}`);
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes :', err.response ? err.response.data : err);
      return;
    }
    if (!orders.length) {
      console.error('Aucune commande trouvée.');
      return;
    }

    // 3. Prendre une commande livrée si possible
    let testOrder = orders.find(o => o.status === 'delivered') || orders[0];
    const TEST_ORDER_ID = testOrder.id;
    console.log(`\nCommande utilisée pour les tests : id=${TEST_ORDER_ID}, statut=${testOrder.status}`);

    // 4. Récupérer les items de la commande
    let orderItems = [];
    try {
      const orderDetailRes = await axios.get(`${API_URL}/api/orders/${TEST_ORDER_ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      orderItems = orderDetailRes.data.items || [];
      orderItems.forEach(i => {
        console.log(`  - item id: ${i.id}, produit: ${i.product_id}, quantité: ${i.quantity}`);
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des items :', err.response ? err.response.data : err);
      return;
    }
    if (!orderItems.length) {
      console.error('Aucun item trouvé dans la commande.');
      return;
    }
    const TEST_ORDER_ITEM_ID = orderItems[0].id;
    console.log(`\nItem utilisé pour les tests : id=${TEST_ORDER_ITEM_ID}`);

    // 5. Initier un retour
    console.log('\nTest PATCH /api/orders/:orderId/return ...');
    try {
      const retourRes = await axios.patch(
        `${API_URL}/api/orders/${TEST_ORDER_ID}/return`,
        {
          items: [
            {
              order_item_id: TEST_ORDER_ITEM_ID,
              quantity: 1,
              reason: 'Trop petit'
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Réponse retour :', retourRes.data);
    } catch (err) {
      if (err.response) console.error('Erreur retour :', err.response.data);
      else console.error(err);
    }

    // 6. Valider le retour (admin)
    console.log('\nTest PATCH /api/orders/:orderId/return/validate ...');
    try {
      const validateRes = await axios.patch(
        `${API_URL}/api/orders/${TEST_ORDER_ID}/return/validate`,
        {
          items: [
            {
              order_item_id: TEST_ORDER_ITEM_ID,
              approved: true,
              admin_comment: 'Produit conforme, retour accepté'
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Réponse validation :', validateRes.data);
    } catch (err) {
      if (err.response) console.error('Erreur validation :', err.response.data);
      else console.error(err);
    }

    // 7. Marquer comme remboursé (admin)
    console.log('\nTest PATCH /api/orders/:orderId/mark-refunded ...');
    try {
      const refundRes = await axios.patch(
        `${API_URL}/api/orders/${TEST_ORDER_ID}/mark-refunded`,
        {
          refund_id: 're_1Nxxxxxx',
          admin_comment: 'Remboursement effectué le 25/06/2025'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Réponse remboursement :', refundRes.data);
    } catch (err) {
      if (err.response) console.error('Erreur remboursement :', err.response.data);
      else console.error(err);
    }

  } catch (err) {
    console.error('Erreur générale :', err.message);
  }
}

main(); 