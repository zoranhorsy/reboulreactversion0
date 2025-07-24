import React from "react";

export default function CGV() {
  return (
    <main className="container mx-auto py-16 space-y-12 px-4 sm:px-6 md:px-0 max-w-3xl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.2em] sm:tracking-[0.3em]">Conditions Générales de Vente (CGV)</h1>
        <div className="w-16 sm:w-20 md:w-24 h-px bg-primary mx-auto" />
      </div>
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">1. Identification du vendeur</h2>
          <p>
            Reboul SAS<br />
            523 rue Paradis, 13008 Marseille<br />
            SIRET : [À compléter]<br />
            Email : [À compléter]<br />
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">2. Champ d’application</h2>
          <p>
            Les présentes conditions générales de vente s’appliquent à toutes les commandes passées sur le site reboul.fr par des clients particuliers.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">3. Produits</h2>
          <p>
            Les produits proposés à la vente sont ceux décrits sur le site. Reboul apporte le plus grand soin à la présentation et à la description de ces produits pour satisfaire au mieux l’information du client.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">4. Prix</h2>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises. Reboul se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de l’enregistrement de la commande.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">5. Commande</h2>
          <p>
            Toute commande vaut acceptation des prix et descriptions des produits disponibles à la vente. Reboul s’engage à honorer les commandes reçues sur le site dans la limite des stocks disponibles.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">6. Paiement</h2>
          <p>
            Le paiement s’effectue en ligne par carte bancaire via une plateforme sécurisée. La commande sera considérée comme effective après confirmation de l’accord des centres de paiement bancaire.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">7. Livraison</h2>
          <p>
            Les produits sont livrés à l’adresse de livraison indiquée lors de la commande. Les délais de livraison sont donnés à titre indicatif. Reboul ne saurait être tenu responsable des retards de livraison imputables au transporteur.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">8. Droit de rétractation</h2>
          <p>
            Conformément à la législation en vigueur, le client dispose d’un délai de 14 jours à compter de la réception de sa commande pour exercer son droit de rétractation et retourner le produit pour échange ou remboursement, sans pénalité à l’exception des frais de retour.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">9. Retours</h2>
          <p>
            Les retours doivent être effectués dans leur état d’origine et complets (emballage, accessoires, notice…). Les frais de retour sont à la charge du client.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">10. Service client</h2>
          <p>
            Pour toute question ou réclamation, le client peut contacter le service client à l’adresse indiquée ci-dessus.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">11. Propriété intellectuelle</h2>
          <p>
            Tous les éléments du site sont et restent la propriété intellectuelle et exclusive de Reboul SAS. Nul n’est autorisé à reproduire, exploiter, rediffuser ou utiliser à quelque titre que ce soit, même partiellement, des éléments du site.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">12. Loi applicable</h2>
          <p>
            Les présentes conditions générales de vente sont soumises à la loi française. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
          </p>
        </div>
      </section>
    </main>
  );
} 