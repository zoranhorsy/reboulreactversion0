import { useState, useEffect } from 'react';

interface Collection {
  id: number;
  name: string;
  description: string;
  image_url: string;
  link_url: string;
  badge?: string;
  sort_order: number;
}

interface CollectionsResponse {
  success: boolean;
  data: Collection[];
}

export const useCollectionsCarousel = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections-carousel`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des collections');
      }
      
      const data: CollectionsResponse = await response.json();
      
      if (data.success) {
        setCollections(data.data);
      } else {
        throw new Error('Erreur lors de la récupération des collections');
      }
    } catch (err) {
      console.error('Erreur useCollectionsCarousel:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // Fallback avec les données statiques en cas d'erreur
      setCollections([
        {
          id: 1,
          name: "Collection CP Company",
          description: "Design italien - Les essentiels CP Company",
          image_url: "/images/collections/cp-company.jpg",
          link_url: "/catalogue?brand=cp-company",
          badge: "Tendance",
          sort_order: 1
        },
        {
          id: 2,
          name: "Collection Sneakers",
          description: "Les dernières nouveautés en sneakers",
          image_url: "/images/collections/sneakers-collection.jpg",
          link_url: "/catalogue?category=sneakers",
          badge: "Nouveau",
          sort_order: 2
        },
        {
          id: 3,
          name: "Collection Adultes",
          description: "Élégance contemporaine pour adultes",
          image_url: "/images/collections/adult-collection.jpg",
          link_url: "/catalogue?category=adult",
          badge: "Populaire",
          sort_order: 3
        },
        {
          id: 4,
          name: "Collection Kids",
          description: "Style et confort pour les plus jeunes",
          image_url: "/images/collections/kids-collection.jpg",
          link_url: "/catalogue?category=kids",
          badge: "Exclusif",
          sort_order: 4
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections
  };
};
