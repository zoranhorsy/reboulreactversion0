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
    // Vérifier le type de contenu
    const contentType = request.headers.get("content-type") || "";

    // Si c'est un JSON (base64)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { data, upload_preset, folder } = body;

      if (!data) {
        return NextResponse.json(
          { error: "No image data provided" },
          { status: 400 },
        );
      }

      console.log("Uploading base64 image to Cloudinary...", { folder });

      // Upload l'image vers Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(data, {
        upload_preset:
          upload_preset ||
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
          "ml_default",
        folder: folder || "reboul-store/products",
      });

      console.log("Image uploadée sur Cloudinary:", uploadResponse.secure_url);

      return NextResponse.json({
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      });
    }
    // Si c'est un formulaire multipart
    else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files = formData.getAll("images") as File[];
      const folder = formData.get("folder") as string;

      if (files.length === 0) {
        return NextResponse.json(
          { error: "No files provided" },
          { status: 400 },
        );
      }

      console.log(`Uploading ${files.length} files to Cloudinary...`, {
        folder,
      });

      const uploadPromises = files.map(async (file) => {
        // Convertir le fichier en ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload vers Cloudinary
        const uploadResponse = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                upload_preset:
                  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
                  "ml_default",
                folder: folder || "reboul-store/products",
                filename_override: file.name,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              },
            )
            .end(buffer);
        });

        return {
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
        };
      });

      const results = await Promise.all(uploadPromises);
      console.log(
        "Images uploadées sur Cloudinary:",
        results.map((r) => r.url),
      );

      return NextResponse.json({
        success: true,
        urls: results.map((r) => r.url),
        public_ids: results.map((r) => r.public_id),
      });
    }

    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Erreur lors de l'upload vers Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
