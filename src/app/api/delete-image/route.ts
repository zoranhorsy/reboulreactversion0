import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 },
      );
    }

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      result,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
