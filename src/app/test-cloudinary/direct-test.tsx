'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import Image from 'next/image'

export function DirectCloudinaryTest() {
  const [error, setError] = useState<string | null>(null);
  
  // ID de test fixe pour vérifier que la configuration fonctionne
  const testPublicId = 'reboul-store/products/ii0hmm8djmibphbwmsse';
  
  const handleError = () => {
    setError('Erreur lors du chargement de l&apos;image de test');
  };
  
  return (
    <div className="p-4 border rounded-md mt-4">
      <h3 className="text-lg font-medium mb-2">Test direct CldImage</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm">Test avec CldImage et public ID fixe:</p>
          <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
            <CldImage
              src={testPublicId}
              alt="Test direct Cloudinary"
              width={300}
              height={300}
              onError={handleError}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Public ID: {testPublicId}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">Test avec balise img standard:</p>
          <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${testPublicId}`}
              alt="Test direct avec img"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            URL: https://res.cloudinary.com/{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/{testPublicId}
          </p>
        </div>
      </div>
    </div>
  );
} 