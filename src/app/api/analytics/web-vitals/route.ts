import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Type pour les métriques Web Vitals
interface WebVitalMetric {
  metricName: string;
  value: number;
  delta: number;
  id: string;
  entryType: string;
  navigationType: string | null;
  page: string;
  userAgent: string;
  timestamp: number;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null;
  device: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  sessionId: string;
}

// Fonction pour enregistrer les métriques dans un fichier
function saveMetricsToFile(metric: WebVitalMetric) {
  try {
    // Créer le répertoire si nécessaire
    const dir = path.join(process.cwd(), 'data', 'web-vitals');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Générer un nom de fichier basé sur la date
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const filePath = path.join(dir, `web-vitals-${dateStr}.ndjson`);
    
    // Ajouter la métrique au fichier (format ndjson - chaque ligne est un objet JSON)
    fs.appendFileSync(filePath, JSON.stringify(metric) + '\n');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des métriques:', error);
    return false;
  }
}

// Définir le handler de la route POST
export async function POST(request: Request) {
  try {
    // Traiter la requête
    const metric = await request.json() as WebVitalMetric;
    
    // Valider la métrique
    if (!metric || !metric.metricName) {
      return NextResponse.json({ error: 'Données de métrique invalides' }, { status: 400 });
    }
    
    // Enregistrer la métrique dans un fichier
    const success = saveMetricsToFile(metric);
    
    // Répondre
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur dans le traitement de la requête web-vitals:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Définir le handler de la route GET pour debug en développement seulement
export async function GET() {
  // En production, ne pas exposer cette route
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  
  try {
    // Lire les dernières métriques pour debug
    const dir = path.join(process.cwd(), 'data', 'web-vitals');
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ metrics: [] });
    }
    
    // Obtenir le fichier le plus récent
    const files = fs.readdirSync(dir).filter(f => f.startsWith('web-vitals-'));
    if (files.length === 0) {
      return NextResponse.json({ metrics: [] });
    }
    
    const latestFile = files.sort().pop();
    const filePath = path.join(dir, latestFile!);
    
    // Lire les 10 dernières lignes
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const lastLines = lines.slice(-10);
    
    const metrics = lastLines.map(line => JSON.parse(line));
    
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Erreur lors de la lecture des métriques:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 