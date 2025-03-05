/**
 * Interface pour les images de produit
 * Cette interface est utilisée pour stocker à la fois l'URL et le publicId d'une image Cloudinary
 */
export interface ProductImage {
  /**
   * URL complète de l'image
   */
  url: string;
  
  /**
   * PublicId de l'image sur Cloudinary
   * Utilisé pour les transformations d'image et autres fonctionnalités Cloudinary
   */
  publicId: string;
} 