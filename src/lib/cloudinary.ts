import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  },
  url: {
    secure: true
  }
});

// Fonction pour uploader une image
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Convertir le fichier en base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // Upload vers Cloudinary
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: base64Data,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      }),
    });

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw error;
  }
};

// Fonction pour transformer une URL d'image
export const getImageUrl = (path: string) => {
  if (!path) return '';
  
  // Si c'est déjà une URL complète, la retourner
  if (path.startsWith('http')) {
    return path;
  }

  // Si c'est un chemin Cloudinary, construire l'URL
  if (path.includes('cloudinary')) {
    return path;
  }

  // Construire l'URL Cloudinary
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${path}`;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error deleting image');
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cld; 