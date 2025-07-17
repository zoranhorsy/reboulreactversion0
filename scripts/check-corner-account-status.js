const Stripe = require('stripe');

// Utiliser directement les clés Stripe de test
const STRIPE_SECRET_KEY = 'sk_test_51QZX1KCvFAONCF3NkRoUlVKIKXv6Qm5QZdAX49vCxlvqtxh06LT9uhjauOetT4HQ6wfdROEjbTN48iyZN4hjQbSS00NFFSxnjg';
const CORNER_ACCOUNT_ID = 'acct_1RlnwI2QtSgjqCiP';

// Initialiser Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function checkCornerAccountStatus() {
  try {
    console.log('🔍 Vérification du statut du compte The Corner...');
    console.log(`Account ID: ${CORNER_ACCOUNT_ID}\n`);
    
    // Récupérer les détails du compte
    const account = await stripe.accounts.retrieve(CORNER_ACCOUNT_ID);
    
    console.log('📋 Détails du compte :');
    console.log(`   - Nom: ${account.company?.name || 'Non défini'}`);
    console.log(`   - Email: ${account.email}`);
    console.log(`   - Pays: ${account.country}`);
    console.log(`   - Type: ${account.type}`);
    console.log(`   - Statut: ${account.details_submitted ? '✅ Complet' : '⏳ En attente'}`);
    
    console.log('\n⚙️ Capabilities :');
    console.log(`   - Paiements par carte: ${account.capabilities.card_payments === 'active' ? '✅ Actif' : '❌ Inactif'}`);
    console.log(`   - Transferts: ${account.capabilities.transfers === 'active' ? '✅ Actif' : '❌ Inactif'}`);
    
    console.log('\n💳 Permissions de paiement :');
    console.log(`   - Charges activées: ${account.charges_enabled ? '✅ Oui' : '❌ Non'}`);
    console.log(`   - Paiements activés: ${account.payouts_enabled ? '✅ Oui' : '❌ Non'}`);
    
    // Vérifier les exigences manquantes
    if (account.requirements && account.requirements.currently_due.length > 0) {
      console.log('\n⚠️ Exigences manquantes :');
      account.requirements.currently_due.forEach(req => {
        console.log(`   - ${req}`);
      });
    } else {
      console.log('\n✅ Aucune exigence manquante !');
    }
    
    // Vérifier si le compte est prêt pour recevoir des paiements
    const isReady = account.charges_enabled && account.details_submitted;
    console.log('\n🚀 Statut global :');
    console.log(`   ${isReady ? '✅ Prêt à recevoir des paiements !' : '⏳ Configuration en cours...'}`);
    
    if (isReady) {
      console.log('\n📝 Configuration pour ton code :');
      console.log('   Tu peux maintenant utiliser ce compte dans ton checkout !');
      console.log(`   THE_CORNER_STRIPE_ACCOUNT_ID=${CORNER_ACCOUNT_ID}`);
    }
    
    return account;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    throw error;
  }
}

// Exécuter la vérification
checkCornerAccountStatus()
  .then(() => {
    console.log('\n🎉 Vérification terminée !');
  })
  .catch(error => {
    console.error('💥 Erreur:', error.message);
    process.exit(1);
  }); 