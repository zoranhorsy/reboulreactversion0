"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImagePreview } from "@/components/ImagePreview";
import { VariantManager } from "@/components/admin/VariantManager";
import { TagManager } from "@/components/admin/TagManager";
import {
  type Product as MainProduct,
  type Review,
  type Question,
  type FAQ,
  type SizeChart,
  type Variant,
} from "@/lib/types/product";
import { type Category } from "@/lib/types/category";
import { type Brand } from "@/lib/types/brand";
import { type ProductImage } from "@/lib/types/product-image";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { cn, convertToCloudinaryUrl } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cloudinaryUploadImages } from "@/lib/cloudinary";
import { getCloudinaryUrl } from "@/config/cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import config from "@/config";
import { TagsInput } from "@/components/admin/TagsInput";

// Étendre l'interface Product principale pour ajouter les propriétés spécifiques au formulaire
interface Product extends MainProduct {
  imagesText?: string; // Texte des images pour le textarea
  showTechnicalDetails?: boolean;
}

const initialProduct: Product = {
  id: "",
  name: "",
  description: "",
  price: 0,
  category_id: 0,
  brand_id: 0,
  category: "",
  brand: "",
  image_url: "",
  image: "",
  images: [],
  imagesText: "",
  variants: [],
  tags: [],
  details: [],
  reviews: [],
  questions: [],
  faqs: [],
  size_chart: [],
  store_type: "adult",
  featured: false,
  active: true,
  new: false,
  sku: null,
  store_reference: null,
  weight: null,
  dimensions: null,
  material: null,
  rating: 0,
  reviews_count: 0,
  created_at: new Date().toISOString(),
  _actiontype: "",
  showTechnicalDetails: false,
};

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onSubmit: (product: Product) => Promise<void>;
}

// Liste des matériaux courants
const MATERIALS = [
  "Coton",
  "Polyester",
  "Laine",
  "Lin",
  "Soie",
  "Cuir",
  "Daim",
  "Nylon",
  "Viscose",
  "Cachemire",
  "Denim",
  "Velours",
  "Satin",
  "Tweed",
  "Acrylique",
  "Élasthanne",
  "Mohair",
  "Lyocell",
  "Bambou",
  "Modal",
  "Polyamide",
  "Toile",
  "Tricot",
  "Jersey",
  "Polaire",
  "Gore-Tex",
  "Néoprène",
  "Microfibre",
  "Feutre",
  "Jacquard",
];

export function ProductForm({
  product,
  categories,
  brands,
  onSubmit,
}: ProductFormProps) {
  // Fonction pour nettoyer les images du produit et les convertir en URLs
  const cleanProductImages = (
    productImages: (string | File | Blob | ProductImage)[] | undefined,
  ): string[] => {
    // Si pas d'images, retourner un tableau vide
    if (!productImages) {
      return [];
    }

    // Si c'est une chaîne JSON, essayer de la parser
    if (typeof productImages === "string") {
      try {
        const parsed = JSON.parse(productImages);
        return cleanProductImages(parsed);
      } catch (error) {
        // Si c'est une URL simple, la retourner
        const imageString = productImages as string;
        if (imageString.trim() !== "") {
          return [imageString];
        }
        return [];
      }
    }

    // Si ce n'est pas un tableau, essayer de le convertir
    if (!Array.isArray(productImages)) {
      return cleanProductImages([productImages]);
    }

    const cleanedImageUrls = productImages
      .map((img, index) => {
        // Si c'est une chaîne de caractères (URL)
        if (typeof img === "string") {
          return img.trim() !== "" ? img : null;
        }

        // Si c'est un objet ProductImage
        if (
          typeof img === "object" &&
          img !== null &&
          "url" in img &&
          typeof img.url === "string"
        ) {
          return img.url.trim() !== "" ? img.url : null;
        }

        // Si c'est un objet avec d'autres propriétés
        if (typeof img === "object" && img !== null) {
          // Chercher une propriété qui pourrait être une URL
          const possibleUrl = (img as any).url || (img as any).image_url || (img as any).src;
          if (typeof possibleUrl === "string" && possibleUrl.trim() !== "") {
            return possibleUrl;
          }
        }

        return null;
      })
      .filter((url): url is string => url !== null);

    return cleanedImageUrls;
  };

  // Initialiser le formulaire avec les données du produit
  const initialImages = cleanProductImages(product?.images);
  
  // Fallback : si pas d'images dans le tableau mais qu'il y a une image_url, l'ajouter
  const finalImages = initialImages.length > 0 
    ? initialImages 
    : (product?.image_url ? [product.image_url] : []);

  const [formData, setFormData] = useState<Product>({
    id: product?.id || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category_id: product?.category_id || 0,
    brand_id: product?.brand_id || 0,
    category: product?.category || "",
    brand: product?.brand || "",
    image_url: product?.image_url || "",
    image: product?.image || "",
    images: finalImages, // Utiliser les images finales avec fallback
    imagesText: product?.imagesText || "",
    variants: product?.variants || [],
    tags: product?.tags || [],
    details: product?.details || [],
    reviews: product?.reviews || [],
    questions: product?.questions || [],
    faqs: product?.faqs || [],
    size_chart: product?.size_chart || [],
    store_type: product?.store_type || "adult",
    featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
    sku: product?.sku || null,
    new: product?.new || false,
    store_reference: product?.store_reference || null,
    weight: product?.weight || null,
    dimensions: product?.dimensions || null,
    material: product?.material || null,
    rating: product?.rating || 0,
    reviews_count: product?.reviews_count || 0,
    created_at: product?.created_at || new Date().toISOString(),
    _actiontype: product?._actiontype || "",
    showTechnicalDetails:
      product?.weight || product?.dimensions || product?.material
        ? true
        : false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [testImageDisplay, setTestImageDisplay] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const defaultFormData = useCallback((): Product => {
    if (!product)
      return {
        id: "",
        name: "",
        description: "",
        price: 0,
        category_id: 0,
        brand_id: 0,
        category: "",
        brand: "",
        image_url: "",
        image: "",
        images: [],
        imagesText: "",
        variants: [],
        tags: [],
        details: [],
        reviews: [],
        questions: [],
        faqs: [],
        size_chart: [],
        store_type: "adult" as "adult" | "kids" | "sneakers" | "cpcompany",
        featured: false,
        active: true,
        sku: null,
        new: false,
        store_reference: null,
        weight: null,
        dimensions: null,
        material: null,
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
        _actiontype: "",
        showTechnicalDetails: false,
      };

    // Nettoyer les images du produit
    const cleanedImages = cleanProductImages(product.images);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      brand_id: product.brand_id,
      category: product.category || "",
      brand: product.brand || "",
      image_url: product.image_url || "",
      image: product.image || "",
      images: cleanedImages, // Utiliser les images nettoyées
      imagesText: product.imagesText || "",
      variants: product.variants,
      tags: product.tags,
      details: product.details,
      reviews: product.reviews || [],
      questions: product.questions || [],
      faqs: product.faqs || [],
      size_chart: product.size_chart,
      store_type: product.store_type,
      featured: product.featured,
      active: product.active !== undefined ? product.active : true,
      sku: product.sku || null,
      new: product.new || false,
      store_reference: product.store_reference || null,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      material: product.material || null,
      rating: product.rating || 0,
      reviews_count: product.reviews_count || 0,
      created_at: product.created_at || new Date().toISOString(),
      _actiontype: product._actiontype || "",
      showTechnicalDetails: false,
    };
  }, [product]);

  useEffect(() => {
    if (product) {
      setFormData(defaultFormData());
      // Assurons-nous que la section techniques est ouverte si le produit a des données techniques
      if (product.weight || product.dimensions || product.material) {
        setFormData((prev) => ({ ...prev, showTechnicalDetails: true }));
      }
    }
    // Définir isDirty à true au chargement initial pour permettre la soumission
    setIsDirty(true);
  }, [product, defaultFormData]);

  const validateForm = (): boolean => {
    // Désactiver toutes les validations en retournant toujours true
    return true;
  };

  const handleChange = (
    field: keyof Product,
    value:
      | string
      | number
      | boolean
      | (string | File | Blob | ProductImage)[]
      | Variant[]
      | Review[]
      | Question[]
      | FAQ[]
      | SizeChart[]
      | string[],
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Toujours définir isDirty à true pour permettre la soumission
    setIsDirty(true);
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fonction pour nettoyer les images et s'assurer qu'elles sont au bon format
  const cleanImages = (
    images: (string | File | Blob | ProductImage)[],
  ): ProductImage[] => {
    if (!images || !Array.isArray(images)) return [];

    return images
      .map((img) => {
        // Si c'est déjà un objet ProductImage valide
        if (
          typeof img === "object" &&
          img !== null &&
          "url" in img &&
          typeof img.url === "string" &&
          img.url.trim() !== ""
        ) {
          return {
            url: img.url,
            publicId:
              "publicId" in img && typeof img.publicId === "string"
                ? img.publicId
                : "",
          };
        }

        // Si c'est une chaîne (URL)
        if (typeof img === "string" && img.trim() !== "") {
          return {
            url: img,
            publicId: "",
          };
        }

        // Si c'est un File ou Blob, on retourne un objet vide qui sera filtré
        return {
          url: "",
          publicId: "",
        };
      })
      .filter((img) => img.url && img.url.trim() !== "");
  };

  const handleImageUpload = async (
    files: FileList | File[] | null,
  ): Promise<void> => {
    if (!files?.length) {
      toast({
        title: "Erreur",
        description: "Aucun fichier sélectionné",
        variant: "destructive",
      });
      return;
    }

    console.log("🚀 Début upload - Fichiers sélectionnés:", files.length);

    // Vérifier la taille et le type des fichiers
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    const invalidFiles = Array.from(files).filter(
      (file) => file.size > maxSize || !validTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      toast({
        title: "Erreur",
        description:
          "Certains fichiers sont trop volumineux ou dans un format non supporté",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log("⏳ Upload en cours...");

      // Obtenir la signature du serveur
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp,
          folder: "reboul-store",
        }),
      });

      if (!signatureResponse.ok) {
        throw new Error("Impossible d'obtenir la signature pour l'upload");
      }

      const { signature } = await signatureResponse.json();
      console.log("✅ Signature obtenue");

      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          console.log(`📤 Upload fichier ${index + 1}/${files.length}:`, file.name);
          
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", "699182784731453");
          formData.append("timestamp", timestamp.toString());
          formData.append("folder", "reboul-store");
          formData.append("signature", signature);

          const response = await fetch(
            "https://api.cloudinary.com/v1_1/dxen69pdo/image/upload",
            {
              method: "POST",
              body: formData,
            },
          );

          if (!response.ok) {
            const errorData = await response.text();
            console.error("❌ Erreur Cloudinary:", errorData);
            throw new Error(`Upload failed: ${errorData}`);
          }

          const data = await response.json();
          console.log(`✅ Fichier ${index + 1} uploadé:`, data.secure_url);
          return data.secure_url;
        } catch (error) {
          console.error(`❌ Erreur lors de l'upload du fichier ${index + 1}:`, error);
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url);

      console.log("🎯 URLs uploadées:", validUrls);

      if (validUrls.length) {
        const existingImages = formData.images || [];
        // S'assurer que toutes les images sont des URLs simples
        const updatedImages = [
          ...existingImages
            .map((img) =>
              typeof img === "string"
                ? img
                : img && "url" in img
                  ? img.url
                  : "",
            )
            .filter((url) => url),
          ...validUrls,
        ];

        console.log("📝 Images mises à jour dans le formulaire:", updatedImages);

        setFormData((prev) => ({
          ...prev,
          images: updatedImages,
        }));

        setIsDirty(true);
        toast({
          title: "Succès",
          description: `${validUrls.length} image(s) téléchargée(s) avec succès`,
        });
      }
    } catch (error) {
      console.error(
        "❌ Erreur upload:",
        error instanceof Error ? error.message : String(error),
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'upload des images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      console.log("🏁 Upload terminé");
    }
  };

  const handleImageRemove = (index: number): void => {
    if (!formData.images) return;

    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);

    const firstImage = updatedImages[0];
    const imageUrl =
      typeof firstImage === "string"
        ? firstImage
        : firstImage instanceof File || firstImage instanceof Blob
          ? URL.createObjectURL(firstImage)
          : firstImage?.url || "";

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));

    setIsDirty(true);
    toast({
      title: "Succès",
      description: "Image supprimée avec succès",
    });
  };

  const handleImagePreview = (
    image: string | File | Blob | ProductImage,
  ): string => {
    if (typeof image === "string") {
      return image;
    }
    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    if ("url" in image) {
      return image.url;
    }
    return "";
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      console.log("🚀 Début soumission du formulaire");

      // Nettoyer et formater les images pour n'avoir que des URLs simples
      const cleanedImages = (formData.images || [])
        .map((img) => {
          if (typeof img === "string") return img;
          if (img && typeof img === "object" && "url" in img) return img.url;
          return null;
        })
        .filter(
          (url): url is string => typeof url === "string" && url.trim() !== "",
        );

      console.log("📸 Images nettoyées pour envoi:", cleanedImages);
      console.log("📸 Nombre d'images:", cleanedImages.length);

      // Créer une copie de formData sans la propriété showTechnicalDetails
      const { showTechnicalDetails, ...productData } = formData;

      // Nettoyer les variants pour s'assurer qu'ils ont des valeurs correctes
      const cleanedVariants: Variant[] = Array.isArray(productData.variants)
        ? productData.variants.filter(
            (v) =>
              v.size &&
              v.size.trim() !== "" &&
              v.color &&
              v.color.trim() !== "" &&
              v.stock >= 0,
          )
        : [];

      // Préparer les données du produit avec seulement les champs nécessaires
      const tempProductData = {
        name: productData.name?.trim() || "",
        description: productData.description?.trim() || "",
        price: Number(productData.price) || 0,
        category_id: Number(productData.category_id) || 0,
        brand_id: Number(productData.brand_id) || 0,
        store_type: productData.store_type || "adult",
        featured: Boolean(productData.featured),
        active: Boolean(productData.active),
        new: Boolean(productData.new),
        images: cleanedImages, // Utiliser les images nettoyées
        variants: cleanedVariants, // Utiliser les variants nettoyés
        tags: Array.isArray(productData.tags) ? productData.tags : [],
        details: Array.isArray(productData.details) ? productData.details : [],
      };

      console.log("📦 Données du produit préparées:", {
        name: tempProductData.name,
        images: tempProductData.images,
        imageCount: tempProductData.images.length
      });

      // Ajouter les champs optionnels uniquement s'ils ont une valeur
      if (productData.sku) {
        (tempProductData as any).sku = productData.sku.trim();
      }

      if (productData.store_reference) {
        (tempProductData as any).store_reference =
          productData.store_reference.trim();
      }

      if (productData.weight) {
        (tempProductData as any).weight = productData.weight;
      }

      if (productData.dimensions) {
        (tempProductData as any).dimensions = productData.dimensions.trim();
      }

      if (productData.material) {
        (tempProductData as any).material = productData.material.trim();
      }

      // Ajouter l'id si présent
      const cleanedProductData: Partial<Product> = formData.id
        ? { ...tempProductData, id: formData.id }
        : tempProductData;

      console.log("🎯 Données finales envoyées:", {
        id: cleanedProductData.id,
        images: cleanedProductData.images,
        imageCount: cleanedProductData.images?.length || 0
      });

      // Appeler la fonction onSubmit avec les données préparées
      try {
        await onSubmit(cleanedProductData as Product);

        console.log("✅ Produit sauvegardé avec succès");

        toast({
          title: "Succès",
          description: formData.id
            ? "Produit mis à jour avec succès"
            : "Produit créé avec succès",
        });

        // Rediriger uniquement si la soumission a réussi
        if (router) {
          router.push("/admin");
        }
      } catch (submitError) {
        console.error("❌ Error in form submission:", submitError);
        toast({
          title: "Erreur lors de la soumission",
          description:
            submitError instanceof Error
              ? submitError.message
              : "Erreur lors de l'enregistrement du produit",
          variant: "destructive",
        });
        // Ne pas rediriger en cas d'erreur
      }
    } catch (error) {
      console.error(
        "❌ Erreur traitement formulaire:",
        error instanceof Error ? error.message : String(error),
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du traitement du formulaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("🏁 Soumission terminée");
    }
  };

  const handleVariantChange = (variants: Variant[]): void => {
    // Valider et nettoyer les variants avant de les ajouter
    const validVariants: Variant[] = variants
      .map((variant) => ({
        id: variant.id || 0,
        size: variant.size?.trim() || "",
        color: variant.color?.trim() || "",
        stock: Math.max(0, Number(variant.stock) || 0), // Assurer que le stock est positif
        price: variant.price,
      }))
      .filter((v) => v.size !== "" && v.color !== "");

    handleChange("variants", validVariants);
  };

  const handleTagsChange = (tags: string[]): void => {
    handleChange("tags", tags);
  };

  const handleDetailsChange = (details: string[]): void => {
    // Ensure details is always an array
    const safeDetails = Array.isArray(details) ? details : [];
    handleChange("details", safeDetails);
  };

  const handleSizeChartChange = (sizeChart: SizeChart[]): void => {
    handleChange("size_chart", sizeChart);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await handleImageUpload(files);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
  ): Promise<void> => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    await handleImageUpload(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleStoreTypeChange = (
    value: "adult" | "kids" | "sneakers" | "cpcompany",
  ): void => {
    handleChange("store_type", value);
  };

  const handleFeaturedChange = (checked: boolean): void => {
    handleChange("featured", checked);
  };

  const handleActiveChange = (checked: boolean): void => {
    handleChange("active", checked);
  };

  const handleNewChange = (checked: boolean): void => {
    handleChange("new", checked);
  };

  const handleCategoryChange = (value: string): void => {
    const categoryId = parseInt(value, 10);
    const selectedCategory = categories.find((c) => c.id === categoryId);
    handleChange("category_id", categoryId);
  };

  const handleBrandChange = (value: string): void => {
    const brandId = parseInt(value, 10);
    const selectedBrand = brands.find((b) => b.id === brandId);
    handleChange("brand_id", brandId);
  };

  const handleTextChange =
    (
      field: keyof Pick<
        Product,
        | "name"
        | "description"
        | "sku"
        | "store_reference"
        | "material"
        | "dimensions"
      >,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      handleChange(field, e.target.value);
    };

  const handleNumberChange =
    (field: keyof Pick<Product, "price">) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        handleChange(field, value);
      }
    };

  const handleCheckboxChange =
    (field: keyof Pick<Product, "featured" | "active" | "new">) =>
    (checked: string | boolean): void => {
      handleChange(field, Boolean(checked));
    };

  const handleSelectChange =
    (field: keyof Pick<Product, "category_id" | "brand_id" | "store_type">) =>
    (value: string): void => {
      if (field === "category_id") {
        handleCategoryChange(value);
      } else if (field === "brand_id") {
        handleBrandChange(value);
      } else if (field === "store_type") {
        handleStoreTypeChange(
          value as "adult" | "kids" | "sneakers" | "cpcompany",
        );
      }
    };

  const handleArrayChange =
    (field: keyof Pick<Product, "tags" | "details">) =>
    (value: string[]): void => {
      handleChange(field, value);
    };

  const handleComplexArrayChange =
    (
      field: keyof Pick<
        Product,
        "variants" | "reviews" | "questions" | "faqs" | "size_chart"
      >,
    ) =>
    (value: Variant[] | Review[] | Question[] | FAQ[] | SizeChart[]): void => {
      handleChange(field, value);
    };

  const handleImageChange =
    (field: keyof Pick<Product, "images">) =>
    (value: string): void => {
      handleChange(field, value);
    };

  const handleImagesChange = (
    value: (string | File | Blob | ProductImage)[],
  ): void => {
    handleChange("images", value);
  };

  return (
    <div className="relative h-[calc(100vh-14rem)] flex flex-col overflow-hidden bg-background/50">
      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto overflow-x-hidden pb-20 px-2 sm:px-4 pt-1"
      >
        <div className="space-y-3.5">
          {/* En-tête et informations principales */}
          <div className="space-y-3">
            <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Nom du produit
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleTextChange("name")}
                    className={cn(
                      "border-input/40 w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-9 bg-white/50",
                      errors.name &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500",
                    )}
                    placeholder="Nom complet du produit"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                      <span>⚠️</span> {errors.name}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="sku"
                    className="text-sm font-semibold text-foreground"
                  >
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku || ""}
                    onChange={handleTextChange("sku")}
                    placeholder="Code unique du produit"
                    className="border-input/40 w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-9 bg-white/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="store_reference"
                    className="text-sm font-semibold text-foreground"
                  >
                    Référence Magasin
                  </Label>
                  <Input
                    id="store_reference"
                    value={formData.store_reference || ""}
                    onChange={handleTextChange("store_reference")}
                    placeholder="Référence magasin pour la gestion des stocks"
                    className="border-input/40 w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-9 bg-white/50"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40">
              <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Informations de prix
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="price"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Prix
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      value={formData.price.toString()}
                      onChange={handleNumberChange("price")}
                      type="number"
                      step="0.01"
                      min="0"
                      className={cn(
                        "border-input/40 w-full pl-7 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-9 bg-white/50",
                        errors.price &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500",
                      )}
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
                    </span>
                    {errors.price && (
                      <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                        <span>⚠️</span> {errors.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40">
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-foreground flex items-center gap-1.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleTextChange("description")}
                placeholder="Description détaillée du produit"
                className={cn(
                  "min-h-[60px] sm:min-h-[100px] border-input/40 resize-none w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary bg-white/50",
                  errors.description &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500",
                )}
              />
              {errors.description && (
                <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <span>⚠️</span> {errors.description}
                </span>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Caractéristiques du produit
            </h3>
            <div className="border border-dashed border-border/60 rounded-lg p-2 bg-white/20">
              <div className="space-y-4">
                {formData.details && formData.details.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.details.map((detail, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-1 bg-white/60 text-xs flex items-center gap-1"
                      >
                        {detail}
                        <button
                          onClick={() => {
                            const updatedDetails = formData.details.filter(
                              (_, i) => i !== index,
                            );
                            handleDetailsChange(updatedDetails);
                          }}
                          className="ml-1 rounded-full hover:bg-white/40 h-4 w-4 inline-flex items-center justify-center"
                          type="button"
                        >
                          <span>×</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Sélecteur de caractéristiques prédéfinies */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="predefined-details"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Caractéristiques courantes
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      if (value && value !== "none") {
                        // Vérifier si la caractéristique existe déjà
                        if (!formData.details.includes(value)) {
                          handleDetailsChange([...formData.details, value]);
                        }
                      }
                    }}
                    value="none"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une caractéristique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sélectionner...</SelectItem>

                      <SelectSeparator className="my-1" />
                      <SelectGroup>
                        <SelectLabel>Matières</SelectLabel>
                        <SelectItem value="100% Coton">100% Coton</SelectItem>
                        <SelectItem value="Coton biologique">
                          Coton biologique
                        </SelectItem>
                        <SelectItem value="100% Polyester">
                          100% Polyester
                        </SelectItem>
                        <SelectItem value="Mélange coton/polyester">
                          Mélange coton/polyester
                        </SelectItem>
                        <SelectItem value="Laine">Laine</SelectItem>
                        <SelectItem value="Cachemire">Cachemire</SelectItem>
                        <SelectItem value="Cuir véritable">
                          Cuir véritable
                        </SelectItem>
                        <SelectItem value="Cuir synthétique">
                          Cuir synthétique
                        </SelectItem>
                        <SelectItem value="Nylon">Nylon</SelectItem>
                        <SelectItem value="Lin">Lin</SelectItem>
                        <SelectItem value="Denim">Denim</SelectItem>
                      </SelectGroup>

                      <SelectSeparator className="my-1" />
                      <SelectGroup>
                        <SelectLabel>Fabrication</SelectLabel>
                        <SelectItem value="Fabriqué en France">
                          Fabriqué en France
                        </SelectItem>
                        <SelectItem value="Fabriqué en Italie">
                          Fabriqué en Italie
                        </SelectItem>
                        <SelectItem value="Fabriqué en Europe">
                          Fabriqué en Europe
                        </SelectItem>
                        <SelectItem value="Production éthique">
                          Production éthique
                        </SelectItem>
                        <SelectItem value="Commerce équitable">
                          Commerce équitable
                        </SelectItem>
                      </SelectGroup>

                      <SelectSeparator className="my-1" />
                      <SelectGroup>
                        <SelectLabel>Entretien</SelectLabel>
                        <SelectItem value="Lavable en machine">
                          Lavable en machine
                        </SelectItem>
                        <SelectItem value="Lavage à 30°C">
                          Lavage à 30°C
                        </SelectItem>
                        <SelectItem value="Lavage à la main recommandé">
                          Lavage à la main recommandé
                        </SelectItem>
                        <SelectItem value="Nettoyage à sec uniquement">
                          Nettoyage à sec uniquement
                        </SelectItem>
                        <SelectItem value="Ne pas repasser">
                          Ne pas repasser
                        </SelectItem>
                        <SelectItem value="Ne pas sécher en machine">
                          Ne pas sécher en machine
                        </SelectItem>
                      </SelectGroup>

                      <SelectSeparator className="my-1" />
                      <SelectGroup>
                        <SelectLabel>Coupe & Style</SelectLabel>
                        <SelectItem value="Coupe slim">Coupe slim</SelectItem>
                        <SelectItem value="Coupe regular">
                          Coupe regular
                        </SelectItem>
                        <SelectItem value="Coupe oversize">
                          Coupe oversize
                        </SelectItem>
                        <SelectItem value="Coupe droite">
                          Coupe droite
                        </SelectItem>
                        <SelectItem value="Taille haute">
                          Taille haute
                        </SelectItem>
                        <SelectItem value="Taille mi-haute">
                          Taille mi-haute
                        </SelectItem>
                      </SelectGroup>

                      <SelectSeparator className="my-1" />
                      <SelectGroup>
                        <SelectLabel>Tailles Chaussures (EU)</SelectLabel>
                        <SelectItem value="EU 35">EU 35</SelectItem>
                        <SelectItem value="EU 35.5">EU 35.5</SelectItem>
                        <SelectItem value="EU 36">EU 36</SelectItem>
                        <SelectItem value="EU 36.5">EU 36.5</SelectItem>
                        <SelectItem value="EU 37">EU 37</SelectItem>
                        <SelectItem value="EU 37.5">EU 37.5</SelectItem>
                        <SelectItem value="EU 38">EU 38</SelectItem>
                        <SelectItem value="EU 38.5">EU 38.5</SelectItem>
                        <SelectItem value="EU 39">EU 39</SelectItem>
                        <SelectItem value="EU 39.5">EU 39.5</SelectItem>
                        <SelectItem value="EU 40">EU 40</SelectItem>
                        <SelectItem value="EU 40.5">EU 40.5</SelectItem>
                        <SelectItem value="EU 41">EU 41</SelectItem>
                        <SelectItem value="EU 41.5">EU 41.5</SelectItem>
                        <SelectItem value="EU 42">EU 42</SelectItem>
                        <SelectItem value="EU 42.5">EU 42.5</SelectItem>
                        <SelectItem value="EU 43">EU 43</SelectItem>
                        <SelectItem value="EU 43.5">EU 43.5</SelectItem>
                        <SelectItem value="EU 44">EU 44</SelectItem>
                        <SelectItem value="EU 44.5">EU 44.5</SelectItem>
                        <SelectItem value="EU 45">EU 45</SelectItem>
                        <SelectItem value="EU 45.5">EU 45.5</SelectItem>
                        <SelectItem value="EU 46">EU 46</SelectItem>
                        <SelectItem value="EU 46.5">EU 46.5</SelectItem>
                        <SelectItem value="EU 47">EU 47</SelectItem>
                      </SelectGroup>

                      <SelectSeparator className="my-1" />
                      <SelectGroup>
                        <SelectLabel>Caractéristiques</SelectLabel>
                        <SelectItem value="Déperlant">Déperlant</SelectItem>
                        <SelectItem value="Imperméable">Imperméable</SelectItem>
                        <SelectItem value="Respirant">Respirant</SelectItem>
                        <SelectItem value="Anti-UV">Anti-UV</SelectItem>
                        <SelectItem value="Sans couture">
                          Sans couture
                        </SelectItem>
                        <SelectItem value="Stretch">Stretch</SelectItem>
                        <SelectItem value="Réfléchissant">
                          Réfléchissant
                        </SelectItem>
                        <SelectItem value="Thermorégulateur">
                          Thermorégulateur
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Saisie de caractéristique personnalisée */}
                <div className="bg-white/40 rounded-lg border border-border/40 p-2 sm:p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        id="detail-input"
                        placeholder="Ajouter une caractéristique personnalisée"
                        className="border-input/40 h-8 sm:h-9 text-sm bg-white/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              // Ensure we're working with an array, even if formData.details is null/undefined
                              const currentDetails = Array.isArray(
                                formData.details,
                              )
                                ? formData.details
                                : [];
                              if (!currentDetails.includes(value)) {
                                handleDetailsChange([...currentDetails, value]);
                                e.currentTarget.value = "";
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-8 sm:h-9 rounded-full bg-primary/90 hover:bg-primary"
                      onClick={() => {
                        const input = document.getElementById(
                          "detail-input",
                        ) as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          // Ensure we're working with an array, even if formData.details is null/undefined
                          const currentDetails = Array.isArray(formData.details)
                            ? formData.details
                            : [];
                          if (!currentDetails.includes(value)) {
                            handleDetailsChange([...currentDetails, value]);
                            input.value = "";
                          }
                        }
                      }}
                    >
                      <span>+</span> Ajouter
                    </Button>
                  </div>
                </div>

                {(!formData.details || formData.details.length === 0) && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    Aucune caractéristique ajoutée
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-1 mx-1">
              Ajoutez les caractéristiques techniques du produit comme le
              matériau, le poids, les tailles, etc.
              <br />
              Chaque caractéristique sera affichée sous forme de puce sur la
              page produit.
            </div>
          </div>

          {/* Tags (SEO) - placé après les détails techniques */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-2">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Tags (SEO)
            </Label>
            <div className="border border-dashed border-border/60 rounded-lg p-2 bg-white/20">
              <TagsInput
                value={formData.tags || []}
                onChange={(newTags) => handleTagsChange(newTags)}
              />
            </div>
          </div>

          {/* Catégorie et Marque */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="category_id"
                className="text-sm font-semibold text-foreground flex items-center gap-1.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M3 3h18v18H3zM12 8v8m-4-4h8" />
                </svg>
                Catégorie
              </Label>
              <Select
                value={formData.category_id?.toString() || ""}
                onValueChange={(value) =>
                  handleSelectChange("category_id")(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <span>⚠️</span> {errors.category_id}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="brand_id"
                className="text-sm font-semibold text-foreground flex items-center gap-1.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                  <polyline points="7.5 19.79 7.5 14.6 3 12" />
                  <polyline points="21 12 16.5 14.6 16.5 19.79" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Marque
              </Label>
              <Select
                value={formData.brand_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("brand_id")(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand_id && (
                <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <span>⚠️</span> {errors.brand_id}
                </span>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Images du produit
              </Label>
              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTestImageDisplay(!testImageDisplay)}
                  className="text-xs h-6 px-2 rounded-full"
                >
                  {testImageDisplay ? "Affichage normal" : "Tester affichage"}
                </Button>
              )}
            </div>
            <div className="border border-dashed border-border/60 rounded-lg p-2 sm:p-3 space-y-2 bg-white/20">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="images"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-16 sm:h-24",
                    "border-2 border-dashed rounded-lg cursor-pointer",
                    "hover:bg-primary/5 transition-colors",
                    "border-primary/40 bg-white/40",
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-2 pb-2 sm:pt-3 sm:pb-4">
                    <span>📷</span>
                    <p className="text-xs sm:text-sm text-foreground font-medium">
                      Ajouter des images
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      Sélectionner plusieurs images à la fois
                    </p>
                  </div>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground rounded-md bg-background/80 p-1.5">
                  <span>⏳</span>
                  <span className="text-[11px] sm:text-xs">
                    Upload en cours...
                  </span>
                </div>
              )}

              {/* Affichage des images sélectionnées */}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                      Images ({formData.images.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {formData.images.map((img, idx) => {
                      const imgUrl =
                        typeof img === "string"
                          ? img
                          : typeof img === "object" &&
                              img !== null &&
                              "url" in img &&
                              typeof img.url === "string"
                            ? img.url
                            : "";

                      return (
                        <div key={idx} className="relative group">
                          <div className="aspect-square bg-white rounded-md overflow-hidden border border-border/40 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-border/60">
                            {imgUrl ? (
                              <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${imgUrl}')` }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span>🖼️</span>
                              </div>
                            )}

                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md"
                              onClick={() => handleImageRemove(idx)}
                            >
                              <span>×</span>
                            </Button>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-center mt-0.5 truncate text-muted-foreground">
                            Image {idx + 1}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-2">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <rect x="7" y="7" width="3" height="9" />
                <rect x="14" y="7" width="3" height="5" />
              </svg>
              Variants
            </Label>
            <div className="border border-dashed border-border/60 rounded-lg p-2 bg-white/20">
              <VariantManager
                variants={formData.variants || []}
                onChange={(newVariants) =>
                  handleVariantChange(newVariants)
                }
              />
            </div>
          </div>

          {/* Type de magasin */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-2">
            <Label
              htmlFor="store_type"
              className="text-sm font-semibold text-foreground flex items-center gap-1.5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Type de magasin
            </Label>
            <Select
              value={formData.store_type}
              onValueChange={(value) => handleSelectChange("store_type")(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de magasin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adult">Adulte</SelectItem>
                <SelectItem value="kids">Enfant</SelectItem>
                <SelectItem value="sneakers">Sneakers</SelectItem>
                <SelectItem value="cpcompany">C.P COMPANY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Options du produit
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-white/30 p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("featured")(checked)
                  }
                  className="border-input/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                />
                <Label
                  htmlFor="featured"
                  className="text-xs sm:text-sm font-medium text-foreground cursor-pointer"
                >
                  Produit en vedette
                </Label>
              </div>

              <div className="flex items-center space-x-2 bg-white/30 p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("active")(checked)
                  }
                  className="border-input/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                />
                <Label
                  htmlFor="active"
                  className="text-xs sm:text-sm font-medium text-foreground cursor-pointer"
                >
                  Produit actif
                </Label>
              </div>

              <div className="flex items-center space-x-2 bg-white/30 p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                <Checkbox
                  id="new"
                  checked={formData.new}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("new")(checked)
                  }
                  className="border-input/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                />
                <Label
                  htmlFor="new"
                  className="text-xs sm:text-sm font-medium text-foreground cursor-pointer"
                >
                  Nouveau produit
                </Label>
              </div>
            </div>
          </div>

          {/* Type d'action - placé en bas du formulaire */}
          <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 space-y-2">
            <Label
              htmlFor="_actiontype"
              className="text-sm font-semibold text-foreground flex items-center gap-1.5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Type d&apos;action
            </Label>
            <Select
              value={formData._actiontype || "none"}
              onValueChange={(value) =>
                handleChange("_actiontype", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Normal</SelectItem>
                <SelectItem value="delete">Supprimé</SelectItem>
                <SelectItem value="archive">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>

      {/* Barre d'actions */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between py-2.5 px-3 sm:px-4 border-t bg-card/95 backdrop-blur-md shadow-lg z-10">
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          {isDirty && !isSubmitting && (
            <Alert variant="destructive" className="w-auto border-none p-0">
              <span>⚠️</span>
              <AlertDescription className="text-xs ml-1">
                Non enregistré
              </AlertDescription>
            </Alert>
          )}
          {isSubmitting && (
            <span className="flex items-center gap-1.5">
              <span>⏳</span>
              <span className="text-[11px] sm:text-xs">Enregistrement...</span>
            </span>
          )}
        </div>
        <Button
          type="submit"
          form="product-form"
          disabled={isSubmitting || isUploading}
          className={cn(
            "transition-all duration-200 rounded-full h-8 sm:h-9 px-4 sm:px-5 font-medium",
            isDirty &&
              !isSubmitting &&
              "animate-pulse bg-primary hover:bg-primary/90 shadow-md",
            !isDirty && "bg-muted text-muted-foreground",
          )}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <span>⏳</span>
              <span className="text-[11px] sm:text-xs">Enregistrement...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span className="text-[11px] sm:text-xs">Enregistrer</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ProductForm;
