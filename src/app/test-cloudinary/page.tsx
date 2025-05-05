'use client';

import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';
import { useState } from 'react';
import { uploadImage, CloudinaryUploadResult } from '@/lib/cloudinary';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Info } from 'lucide-react';
import { DirectCloudinaryTest } from './direct-test';
import Image from 'next/image';

export const viewport: Viewport = defaultViewport;

export default function TestCloudinaryPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      console.log('Début de l&apos;upload de', files.length, 'image(s)');
      
      const uploadPromises = files.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.url);
      
      console.log('Images uploadées avec succès:', urls);
      setUploadedImages(prev => [...prev, ...urls]);
    } catch (err) {
      console.error('Erreur lors de l&apos;upload:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l&apos;upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ClientPageWrapper>
      <div className="container mx-auto py-10 space-y-8">
        <h1 className="text-3xl font-bold">Test d&apos;upload Cloudinary</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload d&apos;images</h2>
          
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
              className="max-w-md"
            />
            
            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Upload en cours...</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
        
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Images uploadées ({uploadedImages.length})</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                {showDebug ? 'Masquer le débogage' : 'Afficher le débogage'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square rounded-md overflow-hidden border border-muted">
                    <CloudinaryImage
                      src={url}
                      alt={`Image uploadée ${index + 1}`}
                      fill={true}
                      className="object-cover"
                    />
                  </div>
                  <div className="text-sm truncate">{url}</div>
                  
                  {showDebug && (
                    <div className="p-2 bg-muted text-xs rounded-md space-y-1">
                      <div><strong>URL:</strong> {url}</div>
                      <div><strong>Cloud Name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</div>
                      <div>
                        <strong>Public ID:</strong> {url.includes('cloudinary.com') ? 
                          url.split('/upload/')[1]?.split('/').slice(1).join('/').split('.')[0] || 'Non extrait' 
                          : 'Non applicable'}
                      </div>
                      <div>
                        <strong>Test direct:</strong>
                        <div className="relative mt-1 w-full h-20">
                          <Image 
                            src={url} 
                            alt="Test direct" 
                            fill
                            className="object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                              target.title = 'Erreur de chargement';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setUploadedImages([])}
            >
              Effacer la liste
            </Button>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-muted rounded-md">
          <h2 className="text-xl font-semibold mb-2">Informations de configuration</h2>
          <pre className="text-xs overflow-auto p-2 bg-muted-foreground/10 rounded">
            {JSON.stringify({
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
              nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
            }, null, 2)}
          </pre>
        </div>
        
        <DirectCloudinaryTest />
      </div>
    </ClientPageWrapper>
  );
} 