import React from "react";

export default function Condition() {
  return (
    <main className="container mx-auto py-16 space-y-12 px-4 sm:px-6 md:px-0 max-w-3xl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.2em] sm:tracking-[0.3em]">Conditions d’utilisation du site</h1>
        <div className="w-16 sm:w-20 md:w-24 h-px bg-primary mx-auto" />
      </div>
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">1. Acceptation des conditions</h2>
          <p>
            L’accès et l’utilisation du site reboul.fr impliquent l’acceptation pleine et entière des présentes conditions d’utilisation.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">2. Accès au site</h2>
          <p>
            Le site est accessible 24h/24, 7j/7, sauf cas de force majeure ou événement hors du contrôle de Horsy SAS. Une interruption pour raison de maintenance technique peut être toutefois décidée par Horsy SAS.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">3. Propriété intellectuelle</h2>
          <p>
            Tous les éléments du site (textes, images, graphismes, logo, etc.) sont la propriété exclusive de Horsy SAS ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l’autorisation écrite préalable de Horsy SAS.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">4. Responsabilité</h2>
          <p>
            Horsy SAS ne saurait être tenue responsable des dommages directs ou indirects causés au matériel de l’utilisateur lors de l’accès au site, ni des éventuelles erreurs ou omissions dans les contenus diffusés.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">5. Liens externes</h2>
          <p>
            Le site peut contenir des liens vers d’autres sites. Horsy SAS n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">6. Modification des conditions</h2>
          <p>
            Horsy SAS se réserve le droit de modifier à tout moment les présentes conditions d’utilisation. L’utilisateur est invité à les consulter régulièrement.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">7. Droit applicable</h2>
          <p>
            Les présentes conditions d’utilisation sont soumises à la loi française. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
          </p>
        </div>
      </section>
    </main>
  );
} 