import React from "react";
import PriorityExample from "@/components/PriorityExample";
import { PriorityProvider } from "@/app/contexts/PriorityContext";

export const metadata = {
  title: "Démonstration du Système de Priorité | Reboul",
  description: "Page de démonstration du système de priorité avec Web Worker",
};

export default function DemoPriorityPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Système de Priorité</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Démonstration du système de priorité basé sur Web Worker
          </p>
        </div>

        <div className="mb-8 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">
            À propos du système de priorité
          </h2>
          <p className="mb-4">
            Ce système utilise un Web Worker pour traiter les tâches en
            arrière-plan sans bloquer le thread principal de l&apos;interface
            utilisateur. Les tâches sont organisées selon trois niveaux de
            priorité et traitées dans cet ordre:
          </p>

          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>
              <strong className="text-blue-600 dark:text-blue-400">
                Priorité haute
              </strong>{" "}
              - Pour les opérations critiques qui doivent être exécutées
              immédiatement.
            </li>
            <li>
              <strong className="text-purple-600 dark:text-purple-400">
                Priorité moyenne
              </strong>{" "}
              - Pour les opérations importantes mais moins urgentes.
            </li>
            <li>
              <strong className="text-zinc-600 dark:text-zinc-400">
                Priorité basse
              </strong>{" "}
              - Pour les tâches en arrière-plan qui peuvent attendre.
            </li>
          </ul>

          <p>
            Cette démonstration permet d&apos;ajouter différents types de tâches
            avec différentes priorités à la file d&apos;attente, puis de les
            traiter toutes en respectant l&apos;ordre de priorité. Vous pouvez
            également exécuter une tâche directement.
          </p>
        </div>

        <PriorityProvider>
          <PriorityExample />
        </PriorityProvider>

        <div className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          <h3 className="font-medium mb-2">Cas d&apos;utilisation typiques</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Priorité haute</strong>: Calculs de panier, validation de
              paiement, traitement d&apos;images critiques
            </li>
            <li>
              <strong>Priorité moyenne</strong>: Recommandations produits,
              recherche, mise à jour des filtres
            </li>
            <li>
              <strong>Priorité basse</strong>: Préchargement de données, analyse
              de comportement, synchronisation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
