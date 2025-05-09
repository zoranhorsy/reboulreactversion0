// Types pour les messages du worker
interface ImageProcessMessage {
  type: 'process';
  imageData: ImageData;
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg';
  };
}

interface ImageProcessResponse {
  type: 'process';
  processedImage: ImageData;
  error?: string;
}

// Fonction pour traiter une image
async function processImage(imageData: ImageData, options: ImageProcessMessage['options']): Promise<ImageData> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas');
  }
  
  // Dessiner l'image sur le canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Appliquer les transformations
  if (options.width || options.height) {
    const newWidth = options.width || imageData.width;
    const newHeight = options.height || imageData.height;
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  }
  
  // Récupérer les données traitées
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Gestionnaire de messages
self.onmessage = async (e: MessageEvent<ImageProcessMessage>) => {
  const { type, imageData, options } = e.data;
  
  try {
    switch (type) {
      case 'process':
        const processedImage = await processImage(imageData, options);
        self.postMessage({
          type: 'process',
          processedImage
        });
        break;
        
      default:
        throw new Error(`Type de message non supporté: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'process',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}; 