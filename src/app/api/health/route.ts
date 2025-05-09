/**
 * API de santé pour vérifier si le serveur est en cours d'exécution
 * Utilisée notamment par les scripts de test
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
} 