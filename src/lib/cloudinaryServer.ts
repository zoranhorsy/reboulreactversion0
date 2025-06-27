import { v2 as cloudinary } from "cloudinary";

// Configuration de Cloudinary côté serveur
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: any) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "reboul-store/products",
    });
    return result;
  } catch (error) {
    console.error("Erreur lors de l'upload sur Cloudinary:", error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Erreur lors de la suppression sur Cloudinary:", error);
    throw error;
  }
};

export default cloudinary;
