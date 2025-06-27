"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchBrands } from "@/lib/api";
import { type Brand } from "@/lib/api";
import { toast } from "./ui/use-toast";
import { useInView } from "react-intersection-observer";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
// SimpleSlider supprimé - on utilise une grille simple à la place
import { ReboulButton } from "@/components/ui/reboul-button";

// Interface simplifiée pour les marques
interface SimpleBrand extends Brand {}

export default function LatestCollections() {
  const { theme } = useTheme();
  
  // ✅ ÉTAPE 1: Hooks et états de base
  const [brands, setBrands] = useState<SimpleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // ✅ ÉTAPE 3: Utilisation du système RÉEL comme dans BrandsCarousel
  const getBrandLogo = useCallback((brand: SimpleBrand) => {
    const defaultLogo = "/placeholder.png";
    if (!brand) return defaultLogo;

    // Utiliser les champs logo_light/logo_dark déjà en base !
    let selectedLogo = theme === "dark" ? brand.logo_light : brand.logo_dark;

    if (!selectedLogo) {
      console.log(`❌ Pas de logo pour ${brand.name}, utilisation du placeholder`);
      return defaultLogo;
    }

    // Utiliser l'URL de Railway comme dans BrandsCarousel
    const apiUrl = "https://reboul-store-api-production.up.railway.app";
    
    // Nettoyer le chemin
    let cleanPath = selectedLogo;
    cleanPath = cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath;
    cleanPath = cleanPath.startsWith("api/") ? cleanPath.slice(4) : cleanPath;

    const finalUrl = `${apiUrl}/${cleanPath}`;
    console.log(`✅ ÉTAPE 3: Logo pour ${brand.name} -> ${finalUrl}`);
    return finalUrl;
  }, [theme]);

  // ✅ ÉTAPE 2: Réintégration de l'appel API fetchBrands()
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchBrands();
        setBrands(data);
        
        console.log('✅ ÉTAPE 2: Marques chargées:', data.length);
        console.log('🔍 ÉTAPE 3: Premières marques:', data.slice(0, 5).map(b => `"${b.name}" -> "${b.name.replace(/\s+/g, '').toUpperCase()}"`));
      } catch (err) {
        console.error('❌ ÉTAPE 2: Erreur chargement marques:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (inView) {
      loadBrands();
    }
  }, [inView]);

  return (
    <section 
      ref={ref}
      className="w-full relative py-16 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* ✅ ÉTAPE 5: Layout complet final */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nos Dernières Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les marques les plus prestigieuses de la mode contemporaine. 
            Une sélection exclusive de créateurs qui définissent les tendances d'aujourd'hui.
          </p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement des marques...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Erreur lors du chargement: {error}</p>
          </div>
        )}
        
        {brands.length > 0 && (
          <div className="space-y-8">
            {/* Grille de logos */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 max-w-6xl mx-auto">
              {brands.map((brand) => {
                 const logoUrl = getBrandLogo(brand);
                 
                 return (
                   <div 
                     key={brand.id} 
                     className="group w-20 h-20 bg-card rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-border"
                   >
                     <Image
                       src={logoUrl}
                       alt={brand.name}
                       width={60}
                       height={60}
                       className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                       onError={(e) => {
                         console.error(`❌ Erreur image pour ${brand.name}:`, e.currentTarget.src);
                         e.currentTarget.src = "/placeholder.png";
                       }}
                     />
                   </div>
                 );
               })}
            </div>
            
            {/* Bouton d'action */}
            <div className="text-center">
              <ReboulButton 
                variant="primary" 
                size="lg"
                className="px-8 py-4"
              >
                Découvrir toutes les marques
              </ReboulButton>
              <p className="text-sm text-muted-foreground mt-3">
                {brands.length} marques exclusives disponibles
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
