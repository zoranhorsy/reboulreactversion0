import { NextResponse } from 'next/server';
import { cloudinaryConfig } from '@/config/cloudinary';

export async function GET() {
  // Ne pas exposer les clés API secrètes
  const safeConfig = {
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    folder: cloudinaryConfig.folder,
    defaultTransformations: cloudinaryConfig.defaultTransformations,
    imageSizes: cloudinaryConfig.imageSizes,
    env: {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    }
  };

  return NextResponse.json(safeConfig);
} 