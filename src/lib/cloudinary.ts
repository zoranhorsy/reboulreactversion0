import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  },
  url: {
    secure: true
  }
});

// Interface pour les résultats d'upload d'image
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

// Fonction pour uploader une image
export const uploadImage = async (file: File): Promise<CloudinaryUploadResult> => {
  try {
    // Convertir le fichier en base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    console.log('Début upload vers Cloudinary...');

    // Upload vers Cloudinary
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: base64Data,
        upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'upload');
    }

    const data = await response.json();
    console.log('Image uploadée avec succès:', data.url);
    
    // Extraire le publicId de l'URL ou utiliser celui fourni par l'API
    const publicId = data.public_id || getPublicIdFromUrl(data.url);
    
    return {
      url: data.url,
      publicId: publicId
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw error;
  }
};

// Fonction pour uploader plusieurs images
export const uploadImages = async (files: File[]): Promise<CloudinaryUploadResult[]> => {
  try {
    console.log('Début upload multiple vers Cloudinary...', files.length, 'fichiers');
    
    // Méthode 1: Upload via FormData (plus efficace pour plusieurs fichiers)
    if (files.length > 1) {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload multiple');
      }
      
      const data = await response.json();
      console.log('Images uploadées avec succès (méthode FormData):', data.urls);
      
      // Transformer les URLs en objets avec URL et publicId
      const results = data.urls.map((url: string) => {
        const publicId = data.public_ids?.[data.urls.indexOf(url)] || getPublicIdFromUrl(url);
        return { url, publicId };
      });
      
      return results;
    } 
    // Méthode 2: Upload individuel (pour un seul fichier)
    else {
      const uploadPromises = files.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      console.log('Images uploadées avec succès (méthode individuelle):', results);
      return results;
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    throw error;
  }
};

// Fonction pour extraire l'ID public d'une URL Cloudinary
export const getPublicIdFromUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  
  // Format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.jpg
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  
  // Retourner le format folder/filename sans l'extension
  return `${folder}/${filename.split('.')[0]}`;
};

// Fonction pour transformer une URL d'image
export const getImageUrl = (path: string) => {
  if (!path) {
    console.log('getImageUrl: path vide');
    // Retourner une URL d'image par défaut
    return 'https://res.cloudinary.com/dxen69pdo/image/upload/v1741125649/reboul-store/products/gytbe7ismmfoy7concah.png';
  }
  
  console.log('getImageUrl - Input:', path);
  
  // Si c'est déjà une URL complète, la retourner
  if (path.startsWith('http')) {
    console.log('getImageUrl - URL complète détectée:', path);
    return path;
  }

  // Si c'est un chemin Cloudinary, construire l'URL
  if (path.includes('cloudinary')) {
    console.log('getImageUrl - Chemin Cloudinary détecté:', path);
    return path;
  }

  // Construire l'URL Cloudinary
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.log('getImageUrl - Nom du cloud non défini');
    return path;
  }
  
  const url = `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
  console.log('getImageUrl - URL construite:', url);
  return url;
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

// Fonction pour vérifier si une URL d'image est accessible
export const checkImageUrl = async (url: string): Promise<boolean> => {
  try {
    // Utiliser l'API fetch pour vérifier si l'URL est accessible
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'URL:', error);
    return false;
  }
};

// Fonction pour corriger les URLs Cloudinary problématiques
export const fixCloudinaryUrl = (url: string): string => {
  if (!url) return '';
  
  // Si l'URL contient déjà cloudinary.com, vérifier si elle est correctement formatée
  if (url.includes('cloudinary.com')) {
    console.log('fixCloudinaryUrl - URL Cloudinary détectée:', url);
    
    // Vérifier si l'URL contient des paramètres de transformation
    if (!url.includes('/upload/')) {
      // Ajouter le chemin /upload/ si nécessaire
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxen69pdo';
      const parts = url.split(`res.cloudinary.com/${cloudName}/`);
      if (parts.length === 2) {
        const fixedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${parts[1]}`;
        console.log('fixCloudinaryUrl - URL corrigée:', fixedUrl);
        return fixedUrl;
      }
    }
    
    // Si l'URL contient des espaces ou des caractères spéciaux, les encoder
    if (url.includes(' ') || url.includes('(') || url.includes(')')) {
      const fixedUrl = encodeURI(url);
      console.log('fixCloudinaryUrl - URL encodée:', fixedUrl);
      return fixedUrl;
    }
    
    return url;
  }
  
  // Si c'est un publicId Cloudinary (sans http/https)
  if (!url.startsWith('http') && (url.includes('/') || url.includes('reboul-store'))) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxen69pdo';
    const fixedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${url}`;
    console.log('fixCloudinaryUrl - PublicId converti en URL:', fixedUrl);
    return fixedUrl;
  }
  
  return url;
};

export default cld; 