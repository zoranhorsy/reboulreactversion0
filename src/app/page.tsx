import dynamic from 'next/dynamic';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';

// Export de la configuration viewport recommandée
export const viewport: Viewport = defaultViewport;

// Import dynamique pour éviter le chargement inutile du composant
// si l'utilisateur navigue ailleurs avant le rendu complet
const OptimizedHomeContent = dynamic(
  () => import('@/components/optimized/OptimizedHomeContent'),
  {
    loading: () => <LoadingIndicator />,
    ssr: true, // Activer le rendu côté serveur
  }
);

export default function Home() {
  return (
    <ClientPageWrapper>
      <OptimizedHomeContent />
    </ClientPageWrapper>
  );
}

