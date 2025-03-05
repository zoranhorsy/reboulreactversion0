'use client';

import { ReactNode, useEffect } from 'react';
import { cloudinaryConfig } from '@/config/cloudinary';

interface CloudinaryProviderProps {
  children: ReactNode;
}

export function CloudinaryProvider({ children }: CloudinaryProviderProps) {
  useEffect(() => {
    // Vérifier que la configuration Cloudinary est correcte
    if (!cloudinaryConfig.cloudName) {
      console.warn('Cloudinary cloud name is not set. Please check your environment variables.');
    }
    
    // Afficher la configuration pour le débogage
    console.log('Cloudinary configuration:', {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
    });
    
    // Définir la variable globale pour next-cloudinary
    if (typeof window !== 'undefined') {
      (window as any).cloudinaryConfig = {
        cloudName: cloudinaryConfig.cloudName,
      };
    }
  }, []);
  
  return <>{children}</>;
} 