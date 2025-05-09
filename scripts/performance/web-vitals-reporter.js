/**
 * Reporter Web Vitals pour Reboul
 *
 * Ce script permet de collecter et d'envoyer les métriques Web Vitals
 * des utilisateurs réels vers notre API analytique
 */

const { onCLS, onFID, onLCP, onINP, onTTFB } = require('web-vitals');

// Reporter principal pour envoyer les métriques
function reportWebVitals(metric) {
  const { name, value, delta, id, entries, navigationType } = metric;
  
  // Adapter le nom pour la cohérence avec notre notation
  const metricName = name.toUpperCase();
  
  // Préparer les données à envoyer
  const data = {
    metricName,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
    id,
    entryType: entries && entries.length > 0 ? entries[0].entryType : '',
    navigationType,
    page: window.location.pathname,
    // Ajouter des informations contextuelles
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    } : null,
    device: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio
    },
    sessionId: getOrCreateSessionId()
  };
  
  // Envoyer les données via un beacon (ne bloque pas la navigation)
  sendToAnalytics(data);
  
  // Également afficher dans la console en développement
  if (process.env.NODE_ENV === 'development') {
    console.log(`[WebVitals] ${metricName}: ${Math.round(value)} (Δ${Math.round(delta)})`);
  }
}

// Obtenir ou créer un ID de session pour suivre les métriques d'un même utilisateur
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('reboul_session_id');
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    sessionStorage.setItem('reboul_session_id', sessionId);
  }
  
  return sessionId;
}

// Envoyer les données à notre backend
function sendToAnalytics(data) {
  // Utiliser la Beacon API pour ne pas bloquer la navigation
  // Fonctionne même lors des événements unload/beforeunload
  if (navigator.sendBeacon) {
    try {
      const endpoint = '/api/analytics/web-vitals';
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    } catch (e) {
      console.error('[WebVitals] Erreur avec sendBeacon:', e);
    }
  }
  
  // Fallback utilisant fetch avec keepalive
  try {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(e => console.error('[WebVitals] Erreur avec fetch:', e));
  } catch (e) {
    console.error('[WebVitals] Erreur lors de l\'envoi des métriques:', e);
  }
}

// Initialiser la collecte des métriques
function initWebVitalsReporting() {
  try {
    // Collecter toutes les métriques Web Vitals principales
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onLCP(reportWebVitals);
    onINP(reportWebVitals);
    onTTFB(reportWebVitals);
  } catch (e) {
    console.error('[WebVitals] Erreur lors de l\'initialisation:', e);
  }
}

// Exporter la fonction d'initialisation pour l'utiliser dans app/layout.tsx
module.exports = {
  initWebVitalsReporting
}; 