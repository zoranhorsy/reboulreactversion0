import React from "react";

export default function Confidentialite() {
  return (
    <main className="container mx-auto py-16 space-y-12 px-4 sm:px-6 md:px-0 max-w-3xl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.2em] sm:tracking-[0.3em]">Politique de confidentialité</h1>
        <div className="w-16 sm:w-20 md:w-24 h-px bg-primary mx-auto" />
      </div>
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">1. Collecte des données personnelles</h2>
          <p>
            Nous collectons des informations lorsque vous utilisez notre site, passez commande, remplissez un formulaire ou interagissez avec nos services. Les données collectées sont strictement nécessaires à la gestion de votre commande, à l’amélioration de nos services et à la communication avec vous.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">2. Utilisation des données</h2>
          <p>
            Vos données sont utilisées uniquement par Horsy SAS pour le traitement des commandes, la gestion de la relation client, l’envoi d’informations commerciales (si vous y avez consenti) et le respect de nos obligations légales.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">3. Partage des données</h2>
          <p>
            Vos données ne sont jamais vendues ni cédées à des tiers. Elles peuvent être transmises à nos prestataires techniques (hébergement, paiement, livraison) uniquement pour l’exécution de votre commande.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">4. Sécurité</h2>
          <p>
            Nous mettons en œuvre toutes les mesures nécessaires pour assurer la sécurité de vos données personnelles et empêcher tout accès non autorisé.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">5. Vos droits</h2>
          <p>
            Conformément à la loi « Informatique et Libertés » et au RGPD, vous disposez d’un droit d’accès, de rectification, d’opposition, de suppression et de portabilité de vos données. Pour exercer vos droits, contactez-nous à [email à compléter].
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">6. Cookies</h2>
          <p>
            Le site utilise des cookies pour améliorer l’expérience utilisateur et réaliser des statistiques de visite. Vous pouvez configurer votre navigateur pour refuser les cookies.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">7. Contact</h2>
          <p>
            Pour toute question relative à la confidentialité de vos données, contactez-nous à [email à compléter].
          </p>
        </div>
      </section>
    </main>
  );
} 