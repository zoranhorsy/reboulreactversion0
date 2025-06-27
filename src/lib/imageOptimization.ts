import { ImageLoaderProps } from "next/image";

// Types d'images supportés
export type ImageFormat = "webp" | "avif" | "jpg" | "png" | "auto";

// Interface pour les options d'optimisation d'image
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  imageType?: string; // Nouveau: type d'image (logo, hero, etc.)
}

/**
 * Déterminer si l'URL est externe (http/https)
 */
export function isExternalUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  );
}

/**
 * Determine le meilleur format d'image en fonction du navigateur
 * (sera utilisé côté client)
 */
export function getBestImageFormat(): ImageFormat {
  if (typeof window === "undefined") return "webp"; // Par défaut sur le serveur

  // Vérifier le support AVIF
  const avifSupported = (): boolean => {
    try {
      return (
        document
          .createElement("canvas")
          .toDataURL("image/avif")
          .indexOf("data:image/avif") === 0
      );
    } catch (e) {
      return false;
    }
  };

  // Vérifier le support WebP
  const webpSupported = (): boolean => {
    try {
      return (
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .indexOf("data:image/webp") === 0
      );
    } catch (e) {
      return false;
    }
  };

  if (avifSupported()) return "avif";
  if (webpSupported()) return "webp";

  return "jpg"; // Format de repli
}

/**
 * Optimise une URL pour être servie par le CDN Vercel
 * Ajoute les paramètres d'optimisation nécessaires pour Next.js Image
 */
export function getVercelOptimizedUrl(
  src: string,
  options: ImageOptimizationOptions = {},
): string {
  // Pour les images externes, on les laisse telles quelles
  if (isExternalUrl(src)) return src;

  // Gestion spéciale pour les logos et autres images qui nécessitent un traitement direct
  if (options.imageType === "logo") {
    // Pour les logos, on préfère utiliser l'URL directe plutôt que l'API d'optimisation
    // car ils sont souvent plus petits et nécessitent une qualité maximale
    return src;
  }

  // Paramètres de base pour Next.js Image Optimization
  const params = new URLSearchParams();

  // Largeur (obligatoire pour Next.js Image Optimization)
  if (options.width) {
    params.append("w", options.width.toString());
  }

  // Qualité (optionnel)
  if (options.quality) {
    params.append("q", options.quality.toString());
  }

  // Le format sera géré automatiquement par Next.js qui sert WebP par défaut
  // ou AVIF si le navigateur le supporte

  // Si l'URL source ne commence pas par /, on l'ajoute
  const normalizedSrc = src.startsWith("/") ? src : `/${src}`;

  // Construire l'URL optimisée pour le CDN Vercel (via le chemin /_next/image)
  if (params.toString()) {
    return `/_next/image?url=${encodeURIComponent(normalizedSrc)}&${params.toString()}`;
  }

  return normalizedSrc;
}

/**
 * Convertir une URL d'image en URL optimisée (WebP/AVIF)
 * Pour les images hébergées sur Cloudinary
 */
export function getCloudinaryOptimizedUrl(
  src: string,
  options: ImageOptimizationOptions = {},
): string {
  if (!src || !src.includes("res.cloudinary.com")) return src;

  // Extraire les composants de l'URL Cloudinary
  const urlParts = src.split("/upload/");
  if (urlParts.length !== 2) return src;

  const [baseUrl, imagePath] = urlParts;

  // Construire les transformations Cloudinary
  const transformations: string[] = [];

  // Format (WebP ou AVIF)
  if (options.format && options.format !== "auto") {
    transformations.push(`f_${options.format}`);
  } else {
    transformations.push("f_auto"); // Laisser Cloudinary choisir le meilleur format
  }

  // Qualité
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  } else {
    transformations.push("q_auto"); // Qualité automatique
  }

  // Redimensionnement
  if (options.width && options.height) {
    transformations.push(`c_fill,w_${options.width},h_${options.height}`);
  } else if (options.width) {
    transformations.push(`w_${options.width}`);
  } else if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Construire l'URL optimisée
  return `${baseUrl}/upload/${transformations.join(",")}/${imagePath}`;
}

/**
 * Convertir une URL d'image en URL optimisée (WebP/AVIF)
 * Pour les images locales (via le dossier public)
 */
export function getLocalOptimizedUrl(
  src: string,
  options: ImageOptimizationOptions = {},
): string {
  if (!src || isExternalUrl(src)) return src;

  // Si l'image est déjà dans le dossier optimized, la retourner telle quelle
  if (src.includes("/optimized/")) return src;

  // Utiliser le CDN Vercel pour les images locales
  return getVercelOptimizedUrl(src, options);
}

/**
 * Loader d'image personnalisé pour Next.js
 * Utilisable avec le composant Image de Next.js
 */
export function optimizedImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Détecter le type d'image à partir du chemin
  const isLogo = src.includes("logotype") || src.includes("logo");
  const imageType = isLogo ? "logo" : undefined;

  if (isExternalUrl(src)) {
    // Pour les images externes, utiliser Cloudinary si possible
    if (src.includes("res.cloudinary.com")) {
      return getCloudinaryOptimizedUrl(src, {
        width,
        quality,
        format: "auto",
        imageType,
      });
    }
    return src; // Images externes non Cloudinary restent inchangées
  }

  // Pour les images locales, utiliser le CDN Vercel
  return getVercelOptimizedUrl(src, {
    width,
    quality,
    format: "auto",
    imageType,
  });
}

/**
 * Récupérer les sources d'image pour l'élément <picture>
 */
export function getImageSources(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
): {
  webpSrcSet: string;
  avifSrcSet: string;
  defaultSrc: string;
} {
  // Détecter si c'est un logo
  const isLogo = src.includes("logotype") || src.includes("logo");
  const imageType = isLogo ? "logo" : undefined;

  // Pour les logos, on ne crée pas de srcset
  if (isLogo) {
    return {
      webpSrcSet: "",
      avifSrcSet: "",
      defaultSrc: src,
    };
  }

  // Pour les images externes, pas de srcset
  if (isExternalUrl(src)) {
    if (src.includes("res.cloudinary.com")) {
      return {
        webpSrcSet: widths
          .map(
            (w) =>
              `${getCloudinaryOptimizedUrl(src, { width: w, format: "webp", imageType })} ${w}w`,
          )
          .join(", "),
        avifSrcSet: widths
          .map(
            (w) =>
              `${getCloudinaryOptimizedUrl(src, { width: w, format: "avif", imageType })} ${w}w`,
          )
          .join(", "),
        defaultSrc: getCloudinaryOptimizedUrl(src, {
          format: "auto",
          imageType,
        }),
      };
    }

    return {
      webpSrcSet: "",
      avifSrcSet: "",
      defaultSrc: src,
    };
  }

  // Pour les images locales, utiliser le CDN Vercel
  return {
    webpSrcSet: widths
      .map(
        (w) =>
          `${getVercelOptimizedUrl(src, { width: w, format: "webp", imageType })} ${w}w`,
      )
      .join(", "),
    avifSrcSet: widths
      .map(
        (w) =>
          `${getVercelOptimizedUrl(src, { width: w, format: "avif", imageType })} ${w}w`,
      )
      .join(", "),
    defaultSrc: getVercelOptimizedUrl(src, { format: "auto", imageType }),
  };
}
