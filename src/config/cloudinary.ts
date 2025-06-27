/**
 * Configuration Cloudinary pour l'application
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dxen69pdo",
  apiKey: process.env.CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  uploadPreset:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default",
  folder: "reboul-store/products",

  // Options par défaut pour les transformations d'images
  defaultTransformations: {
    quality: "auto:good",
    fetchFormat: "auto",
    crop: "fill",
    gravity: "auto",
  },

  // Tailles d'images prédéfinies
  imageSizes: {
    thumbnail: { width: 100, height: 100 },
    small: { width: 300, height: 400 },
    medium: { width: 600, height: 800 },
    large: { width: 1200, height: 1600 },
  },
};

/**
 * Vérifie si une URL est une URL Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  if (!url) return false;

  // Vérifier si l'URL contient cloudinary.com
  if (url.includes("cloudinary.com")) return true;

  // Vérifier si l'URL correspond au format de nos URLs Cloudinary
  const cloudName = cloudinaryConfig.cloudName;
  if (url.includes(`res.cloudinary.com/${cloudName}`)) return true;

  return false;
};

/**
 * Extrait l'ID public d'une URL Cloudinary
 */
export const getPublicIdFromCloudinaryUrl = (url: string): string => {
  if (!url) {
    console.log("getPublicIdFromCloudinaryUrl: URL vide");
    return "";
  }

  // Journalisation pour le débogage
  console.log("getPublicIdFromCloudinaryUrl - URL d'entrée:", url);

  // Si l'URL ne contient pas cloudinary.com, vérifier si c'est directement un publicId
  if (!isCloudinaryUrl(url)) {
    // Si l'URL ressemble à un chemin de dossier Cloudinary (ex: "reboul-store/products/image123")
    if (url.includes("/") && !url.startsWith("http")) {
      console.log("URL considérée comme un publicId direct:", url);
      return url;
    }
    console.log("URL non reconnue comme Cloudinary:", url);
    return "";
  }

  // Si l'URL est une URL Cloudinary complète, la retourner telle quelle
  // Cela permettra à CldImage de l'utiliser directement
  if (url.includes("cloudinary.com")) {
    console.log(
      "URL Cloudinary complète détectée, retournée telle quelle:",
      url,
    );
    return url;
  }

  try {
    // Format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    console.log("Analyse de l'URL Cloudinary:", {
      url,
      pathname: urlObj.pathname,
      pathParts,
    });

    // Trouver l'index de "upload" dans le chemin
    const uploadIndex = pathParts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) {
      console.log('Mot-clé "upload" non trouvé dans le chemin');

      // Essayer une approche alternative - prendre les dernières parties du chemin
      // Format possible: https://res.cloudinary.com/cloud-name/reboul-store/products/image123.jpg
      const lastParts = pathParts.slice(-2); // Prendre les 2 dernières parties
      if (lastParts.length === 2) {
        let publicId = lastParts.join("/");
        // Supprimer l'extension de fichier si elle existe
        if (publicId.includes(".")) {
          publicId = publicId.split(".").slice(0, -1).join(".");
        }
        console.log("Extraction alternative de l'ID public:", publicId);
        return publicId;
      }

      return "";
    }

    // Extraire les parties du chemin après "upload" et la version (v1234567890)
    const relevantParts = pathParts.slice(uploadIndex + 1);

    // Supprimer la partie de version si elle existe
    if (relevantParts.length > 0 && relevantParts[0].startsWith("v")) {
      relevantParts.shift();
    }

    // Supprimer les transformations éventuelles
    const transformationIndex = relevantParts.findIndex((part) =>
      part.includes(","),
    );
    if (transformationIndex !== -1) {
      relevantParts.splice(0, transformationIndex + 1);
    }

    // Joindre les parties restantes pour former l'ID public
    let publicId = relevantParts.join("/");

    // Supprimer l'extension de fichier si elle existe
    if (publicId.includes(".")) {
      publicId = publicId.split(".").slice(0, -1).join(".");
    }

    console.log("Extraction de l'ID public réussie:", {
      url,
      pathParts,
      uploadIndex,
      relevantParts,
      publicId,
    });

    return publicId;
  } catch (error) {
    console.error("Erreur lors de l'extraction de l'ID public:", error);

    // En cas d'erreur, essayer de voir si l'URL est directement un publicId
    if (!url.startsWith("http") && url.includes("/")) {
      console.log(
        "Après erreur, URL considérée comme un publicId direct:",
        url,
      );
      return url;
    }

    // Dernière tentative: extraire le chemin après le nom de domaine
    try {
      if (url.includes("cloudinary.com")) {
        const parts = url.split("cloudinary.com/")[1].split("/");
        // Ignorer le premier élément (nom du cloud)
        const relevantParts = parts.slice(1);
        let publicId = relevantParts.join("/");

        // Supprimer l'extension de fichier si elle existe
        if (publicId.includes(".")) {
          publicId = publicId.split(".").slice(0, -1).join(".");
        }

        console.log("Extraction de secours de l'ID public:", publicId);
        return publicId;
      }
    } catch (secondError) {
      console.error("Échec de l'extraction de secours:", secondError);
    }

    // Si toutes les tentatives échouent, retourner l'URL complète
    console.log(
      "Toutes les tentatives d'extraction ont échoué, retour de l'URL complète",
    );
    return url;
  }
};

/**
 * Génère une URL Cloudinary avec des transformations
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: string;
    gravity?: string;
  } = {},
) => {
  if (!publicId) {
    console.log("getCloudinaryUrl: publicId vide");
    return "";
  }

  const { cloudName } = cloudinaryConfig;
  if (!cloudName) {
    console.log("getCloudinaryUrl: cloudName non défini");
    return publicId; // Retourne l'URL d'origine si pas de configuration
  }

  // Si c'est déjà une URL Cloudinary complète, la retourner
  if (publicId.includes("cloudinary.com")) {
    console.log("getCloudinaryUrl: URL Cloudinary déjà complète");
    return publicId;
  }

  // Construire les transformations
  const transformations = [
    options.width ? `w_${options.width}` : "",
    options.height ? `h_${options.height}` : "",
    options.quality ? `q_${options.quality}` : "q_auto:good",
    options.crop ? `c_${options.crop}` : "c_fill",
    options.gravity ? `g_${options.gravity}` : "g_auto",
    "f_auto", // Format automatique
  ]
    .filter(Boolean)
    .join(",");

  // Construire l'URL
  const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  console.log("getCloudinaryUrl: URL générée:", url);
  return url;
};
