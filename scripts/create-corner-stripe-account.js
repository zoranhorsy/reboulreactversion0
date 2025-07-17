const Stripe = require('stripe');

// Utiliser directement les clés Stripe de test
const STRIPE_SECRET_KEY = 'sk_test_51QZX1KCvFAONCF3NkRoUlVKIKXv6Qm5QZdAX49vCxlvqtxh06LT9uhjauOetT4HQ6wfdROEjbTN48iyZN4hjQbSS00NFFSxnjg';

// Initialiser Stripe avec la clé de test
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function createCornerStripeAccount() {
  console.log('🚀 Création du compte connecté The Corner...');
  
  try {
    // Créer le compte connecté
    const account = await stripe.accounts.create({
      type: 'express', // Type express pour onboarding simplifié
      country: 'FR',
      email: 'corner@test.com', // Email de test
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'company',
      company: {
        name: 'The Corner CP Company',
        // Adresse fictive pour les tests
        address: {
          line1: '123 Rue de Test',
          city: 'Paris',
          postal_code: '75001',
          country: 'FR'
        }
      },
      metadata: {
        store_name: 'The Corner',
        franchise_type: 'CP Company',
        created_by: 'reboul_platform',
        test_account: 'true'
      }
    });

    console.log('✅ Compte connecté créé avec succès !');
    console.log('📋 Détails du compte :');
    console.log(`   - Account ID: ${account.id}`);
    console.log(`   - Type: ${account.type}`);
    console.log(`   - Pays: ${account.country}`);
    console.log(`   - Email: ${account.email}`);
    console.log(`   - Statut: ${account.details_submitted ? 'Complet' : 'En attente'}`);
    
    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/stripe/reauth',
      return_url: 'http://localhost:3000/stripe/return',
      type: 'account_onboarding'
    });
    
    console.log('\n🔗 Lien d\'onboarding créé :');
    console.log(`   URL: ${accountLink.url}`);
    console.log(`   Expire le: ${new Date(accountLink.expires_at * 1000).toLocaleString()}`);
    
    // Vérifier les capabilities
    console.log('\n⚙️ Capabilities :');
    console.log(`   - Paiements par carte: ${account.capabilities.card_payments}`);
    console.log(`   - Transferts: ${account.capabilities.transfers}`);
    
    // Sauvegarder les informations importantes
    console.log('\n📝 À sauvegarder dans ton .env :');
    console.log(`THE_CORNER_STRIPE_ACCOUNT_ID=${account.id}`);
    
    return {
      account,
      accountLink,
      account_id: account.id
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error.message);
    if (error.code) {
      console.error(`   Code d'erreur: ${error.code}`);
    }
    if (error.param) {
      console.error(`   Paramètre: ${error.param}`);
    }
    throw error;
  }
}

// Fonction pour vérifier le statut du compte
async function checkAccountStatus(accountId) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    
    console.log('\n🔍 Statut du compte:');
    console.log(`   - ID: ${account.id}`);
    console.log(`   - Charges activées: ${account.charges_enabled}`);
    console.log(`   - Paiements activés: ${account.payouts_enabled}`);
    console.log(`   - Détails soumis: ${account.details_submitted}`);
    
    if (account.requirements) {
      console.log('   - Exigences manquantes:', account.requirements.currently_due);
    }
    
    return account;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    throw error;
  }
}

// Exécuter le script
async function main() {
  try {
    console.log('🏪 Script de création du compte The Corner');
    console.log('=====================================\n');
    
    const result = await createCornerStripeAccount();
    
    console.log('\n🎉 Compte créé avec succès !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Ajouter THE_CORNER_STRIPE_ACCOUNT_ID à ton .env');
    console.log('2. Aller sur le lien d\'onboarding pour compléter le compte');
    console.log('3. Tester un paiement vers ce compte');
    
  } catch (error) {
    console.error('\n💥 Échec du script:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  createCornerStripeAccount,
  checkAccountStatus
}; 