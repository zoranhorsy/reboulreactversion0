"use client";

import { useEffect, useState } from "react";

// Moniteur d'hydratation - surveille les problèmes d'hydratation React
// Ne s'exécute qu'en mode développement pour éviter d'alourdir la production

interface HydrationIssue {
  component: string;
  element: string;
  mismatch: string;
  timestamp: number;
}

// État global pour stocker les problèmes d'hydratation
const hydrationIssues: HydrationIssue[] = [];
let isMonitoringActive = false;

// Fonction pour démarrer la surveillance
export function startHydrationMonitoring() {
  // Désactivé temporairement pour résoudre les problèmes de performance
  return;

  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV === "production" ||
    isMonitoringActive
  ) {
    return;
  }

  isMonitoringActive = true;

  // Écouter les avertissements d'hydratation de React
  const originalConsoleError = console.error;

  console.error = function (...args) {
    // Capturer les erreurs d'hydratation
    const errorString = args.join(" ");
    if (errorString.includes("Hydration") || errorString.includes("mismatch")) {
      // Obtenir la trace de la pile pour identifier le composant problématique
      const stack = new Error().stack || "";
      const componentMatch = stack.match(/at ([A-Z][a-zA-Z0-9]+) /);
      const component = componentMatch ? componentMatch[1] : "Unknown";

      hydrationIssues.push({
        component,
        element: errorString.includes("on <")
          ? errorString.match(/on <([^>]+)>/)?.[1] || "Unknown"
          : "Unknown",
        mismatch: errorString,
        timestamp: Date.now(),
      });

      // Afficher un avertissement dans la console avec une couleur différente
      console.warn(
        "%c[Moniteur d'hydratation] Problème détecté:",
        "color: #ff9800; font-weight: bold",
        {
          component,
          message: errorString,
        },
      );
    }

    // Appeler la fonction d'origine
    originalConsoleError.apply(console, args);
  };

  // Observer les modifications du DOM après l'hydratation pour détecter les problèmes visuels
  setTimeout(() => {
    if (typeof window !== "undefined" && window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "childList" &&
            mutation.addedNodes.length > 0 &&
            document.readyState === "complete"
          ) {
            // Vérifier si les mutations se produisent juste après l'hydratation
            const timeSinceHydration =
              performance.now() - (window.__NEXT_HYDRATION_END_TIME || 0);
            if (timeSinceHydration > 1000 && timeSinceHydration < 5000) {
              console.warn(
                "%c[Moniteur d'hydratation] Modifications DOM suspectes après hydratation:",
                "color: #ff9800; font-weight: bold",
                {
                  target: mutation.target.nodeName,
                  timeSinceHydration: `${Math.round(timeSinceHydration)}ms`,
                },
              );
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
  }, 1000);
}

// Composant qui peut être ajouté à l'application pour diagnostiquer les problèmes
export function HydrationMonitor() {
  // Désactivé temporairement pour résoudre les problèmes de performance
  return null;

  const [issues, setIssues] = useState<HydrationIssue[]>([]);

  useEffect(() => {
    // Ne s'exécute qu'en développement
    if (process.env.NODE_ENV !== "production") {
      startHydrationMonitoring();

      // Vérifier périodiquement s'il y a de nouveaux problèmes
      const intervalId = setInterval(() => {
        setIssues([...hydrationIssues]);
      }, 1000);

      // Défini une variable globale pour le diagnostic
      window.__REBOUL_HYDRATION_ISSUES = hydrationIssues;

      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  // Ne rien afficher en production
  if (process.env.NODE_ENV === "production" || issues.length === 0) {
    return null;
  }

  // Interface minimaliste pour afficher les problèmes
  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: 9999,
        background: "#ffebee",
        padding: "8px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        fontSize: "12px",
        maxWidth: "300px",
        maxHeight: "200px",
        overflow: "auto",
      }}
    >
      <h4 style={{ margin: "0 0 8px", color: "#d32f2f" }}>
        Problèmes d&apos;hydratation ({issues.length})
      </h4>
      <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
        {issues.map((issue, index) => (
          <li key={index} style={{ marginBottom: "4px" }}>
            <strong>{issue.component}</strong>: {issue.element}
          </li>
        ))}
      </ul>
    </div>
  );
}
