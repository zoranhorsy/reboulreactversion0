/**
 * Configuration globale pour les options de rendu des pages
 * 
 * Ce fichier contient les configurations pour forcer le rendu dynamique des pages
 * et définir les stratégies de mise en cache et de revalidation
 */

// Configuration pour forcer le rendu dynamique des pages
export const dynamic = 'force-dynamic';

// Temps de revalidation en secondes (0 = à chaque requête)
export const revalidate = 0;

// Stratégie de mise en cache des fetch
export const fetchCache = 'force-no-store'; 