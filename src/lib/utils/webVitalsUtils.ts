/**
 * Utilitaires pour le traitement et l'analyse des métriques Web Vitals
 */

// Seuils de performance pour chaque métrique Web Vitals
export const WEBVITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift (score)
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTI: { good: 3800, poor: 7300 }, // Time to Interactive (ms)
};

// Types
export type WebVitalName = keyof typeof WEBVITALS_THRESHOLDS;
export type WebVitalRating = "good" | "needs-improvement" | "poor";

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: WebVitalRating;
  delta?: number;
}

/**
 * Évalue une métrique Web Vital selon les seuils définis
 * @param name Nom de la métrique
 * @param value Valeur de la métrique
 * @returns Catégorie de performance (good, needs-improvement, poor)
 */
export function rateWebVital(
  name: WebVitalName,
  value: number,
): WebVitalRating {
  const threshold = WEBVITALS_THRESHOLDS[name];

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Formate une valeur de métrique pour l'affichage
 * @param name Nom de la métrique
 * @param value Valeur de la métrique
 * @returns Valeur formatée avec unité
 */
export function formatWebVitalValue(name: WebVitalName, value: number): string {
  // CLS est un score sans unité, les autres sont en ms
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

/**
 * Calcule un score global basé sur plusieurs métriques Web Vitals
 * @param metrics Tableau de métriques Web Vitals
 * @returns Score de 0 à 100
 */
export function calculateOverallScore(metrics: WebVitalMetric[]): number {
  if (metrics.length === 0) return 0;

  const scores = {
    good: 100,
    "needs-improvement": 60,
    poor: 30,
  };

  let totalScore = 0;
  metrics.forEach((metric) => {
    totalScore += scores[metric.rating];
  });

  return Math.round(totalScore / metrics.length);
}

/**
 * Convertit un timestamp en format lisible par l'homme
 * @param timestamp Timestamp en millisecondes
 * @returns Date formatée (ex: "15 sept. 2024, 14:30")
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calcule les statistiques d'un ensemble de valeurs (médiane, percentiles)
 * @param values Tableau de valeurs numériques
 * @returns Objet contenant les statistiques calculées
 */
export function calculateStatistics(values: number[]) {
  if (values.length === 0) {
    return { median: 0, p75: 0, p95: 0, min: 0, max: 0, avg: 0 };
  }

  // Trier les valeurs pour calculer les percentiles
  const sortedValues = [...values].sort((a, b) => a - b);
  const count = sortedValues.length;

  // Calculer les différentes statistiques
  return {
    median: sortedValues[Math.floor(count / 2)],
    p75: sortedValues[Math.floor(count * 0.75)],
    p95: sortedValues[Math.floor(count * 0.95)],
    min: sortedValues[0],
    max: sortedValues[count - 1],
    avg: sortedValues.reduce((sum, val) => sum + val, 0) / count,
  };
}

/**
 * Identifie les problèmes potentiels dans un ensemble de métriques
 * @param metrics Tableau de métriques Web Vitals
 * @returns Liste des problèmes identifiés
 */
export function identifyPerformanceIssues(
  metrics: Array<WebVitalMetric & { pagePath?: string }>,
): Array<{
  metric: WebVitalName;
  value: number;
  threshold: number;
  pagePath?: string;
}> {
  const issues = [];

  for (const metric of metrics) {
    if (metric.rating === "poor") {
      issues.push({
        metric: metric.name,
        value: metric.value,
        threshold: WEBVITALS_THRESHOLDS[metric.name].poor,
        pagePath: metric.pagePath,
      });
    }
  }

  return issues;
}

/**
 * Génère des recommandations basées sur les problèmes identifiés
 * @param issues Liste des problèmes identifiés
 * @returns Liste de recommandations pour améliorer les performances
 */
export function generateRecommendations(
  issues: Array<{
    metric: WebVitalName;
    value: number;
    threshold: number;
    pagePath?: string;
  }>,
): string[] {
  const recommendations = new Set<string>();

  for (const issue of issues) {
    switch (issue.metric) {
      case "LCP":
        recommendations.add(
          "Optimiser les images principales avec préchargement prioritaire",
        );
        recommendations.add(
          "Améliorer le temps de réponse du serveur ou utiliser un CDN",
        );
        recommendations.add("Minimiser le CSS bloquant le rendu");
        break;

      case "CLS":
        recommendations.add("Spécifier les dimensions des images et médias");
        recommendations.add(
          "Réserver l'espace pour les éléments dynamiques (publicités, embeds)",
        );
        recommendations.add(
          "Éviter d'insérer du contenu au-dessus du contenu existant",
        );
        break;

      case "FID":
      case "INP":
        recommendations.add("Réduire le temps d'exécution JavaScript");
        recommendations.add(
          "Décomposer les tâches longues en tâches plus courtes",
        );
        recommendations.add(
          "Différer ou supprimer le JavaScript non essentiel",
        );
        recommendations.add(
          "Optimiser les gestionnaires d'événements pour réduire la latence",
        );
        break;

      case "TTFB":
        recommendations.add(
          "Optimiser le serveur (mise en cache, optimisation des requêtes)",
        );
        recommendations.add("Utiliser un CDN pour les ressources statiques");
        recommendations.add(
          "Optimiser le temps de génération des pages côté serveur",
        );
        break;

      case "FCP":
        recommendations.add("Réduire le CSS critique et le rendre inline");
        recommendations.add("Éliminer les ressources bloquant le rendu");
        recommendations.add("Optimiser les temps de chargement des polices");
        break;
    }
  }

  return Array.from(recommendations);
}
