import React from "react";

export default function MentionsLegales() {
  return (
    <main className="container mx-auto py-16 space-y-12 px-4 sm:px-6 md:px-0 max-w-3xl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.2em] sm:tracking-[0.3em]">Mentions légales</h1>
        <div className="w-16 sm:w-20 md:w-24 h-px bg-primary mx-auto" />
      </div>
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">Éditeur du site</h2>
          <p>
            <strong>Horsy SAS</strong><br />
            Siège social : 523 rue Paradis, 13008 Marseille<br />
            SIRET : [À compléter]<br />
            Responsable de publication : [À compléter]<br />
            Contact : [email à compléter]
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium">Établissements secondaires :</span>
            <ul className="list-disc list-inside mt-1">
              <li>Les Minots de Reboul, 523 rue Paradis, 13008 Marseille</li>
              <li>C.P. Company Marseille, 376 avenue du Prado, 13008 Marseille</li>
              <li>Reboul Concept Store Cassis, 7 avenue Victor Hugo, 13260 Cassis</li>
              <li>L’Hôtel By Reboul, 7 avenue Victor Hugo, 13260 Cassis</li>
              <li>Utility by Reboul, 5 rue Gaillard, 83110 Sanary-sur-mer</li>
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">Hébergement</h2>
          <p>Hébergeur : [À compléter]</p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">Propriété intellectuelle</h2>
          <p>
            L’ensemble du contenu du site (textes, images, graphismes, logo, etc.) est la propriété exclusive de Horsy ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l’autorisation écrite préalable de Horsy.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">Données personnelles</h2>
          <p>
            Les informations recueillies via les formulaires du site sont destinées exclusivement à Horsy et ne sont en aucun cas transmises à des tiers. Conformément à la loi « Informatique et Libertés », vous disposez d’un droit d’accès, de rectification et de suppression des données vous concernant. Pour exercer ce droit, contactez-nous à l’adresse indiquée ci-dessus.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">Cookies</h2>
          <p>
            Le site peut être amené à utiliser des cookies pour améliorer l’expérience utilisateur et réaliser des statistiques de visite. Vous pouvez configurer votre navigateur pour refuser les cookies.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">Contact</h2>
          <p>
            Pour toute question, vous pouvez nous contacter à l’adresse indiquée ci-dessus.
          </p>
        </div>
      </section>
    </main>
  );
} 