"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from "@/components/ImagePreview"
import { VariantManager } from "@/components/admin/VariantManager"
import { type Product, type Review, type Question, type FAQ, type SizeChart, type Variant } from "@/lib/types/product"
import { type Category } from "@/lib/types/category"
import { type Brand } from "@/lib/types/brand"
import { type ProductImage } from "@/lib/types/product-image"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, ImagePlus, AlertCircle, X, ImageIcon } from "lucide-react"
import { cn, convertToCloudinaryUrl } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cloudinaryUploadImages } from "@/lib/cloudinary"
import { getCloudinaryUrl } from "@/config/cloudinary"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand_id: number;
  stock: number;
  images: string[];
  variants: Variant[];
  tags: string[];
  details: string[];
  size_chart: SizeChart[];
  featured: boolean;
  active: boolean;
  new: boolean;
  sku?: string;
  store_type?: "adult" | "kids" | "sneakers" | "cpcompany";
}

const initialProduct: Product = {
  name: "",
  description: "",
  price: 0,
  category_id: 0,
  brand_id: 0,
  stock: 0,
  images: [],
  variants: [],
  tags: [],
  details: [],
  size_chart: [],
  featured: false,
  active: true,
  new: true,
  sku: "",
  store_type: "adult"
};

interface ProductFormProps {
  product: Product | null
  categories: Category[]
  brands: Brand[]
  onSubmit: (product: Product) => Promise<void>
}

export function ProductForm({ 
  product, 
  categories, 
  brands, 
  onSubmit
}: ProductFormProps) {
  // Fonction pour nettoyer les images du produit et les convertir en URLs
  const cleanProductImages = (productImages: (string | File | Blob | ProductImage)[] | undefined): string[] => {
    if (!productImages || !Array.isArray(productImages)) {
      console.log("Pas d'images à nettoyer");
      return [];
    }
    
    console.log("Images à nettoyer:", productImages);
    
    const cleanedImageUrls = productImages
      .map(img => {
        // Si c'est une chaîne de caractères (URL)
        if (typeof img === 'string') {
          console.log("Image de type string:", img);
          return img;
        }
        
        // Si c'est un objet ProductImage
        if (typeof img === 'object' && img !== null && 'url' in img && typeof img.url === 'string') {
          console.log("Image de type ProductImage, extraction de l'URL:", img.url);
          return img.url;
        }
        
        // Si c'est un autre type d'objet
        console.warn("Image de type non reconnu:", img);
        return null;
      })
      .filter((url): url is string => url !== null);
    
    console.log("URLs d'images nettoyées:", cleanedImageUrls);
    return cleanedImageUrls;
  };
  
  // Initialiser le formulaire avec les données du produit
  const initialImages = cleanProductImages(product?.images);
  console.log("Images initiales nettoyées:", initialImages);
  
  const [formData, setFormData] = useState<Product>({
    id: product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category_id: product?.category_id || 0,
    brand_id: product?.brand_id || 0,
    images: initialImages,
    variants: product?.variants || [],
    tags: product?.tags || [],
    details: product?.details || [],
    size_chart: product?.size_chart || [],
    store_type: product?.store_type || "adult",
    featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
    sku: product?.sku || '',
    new: product?.new || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [testImageDisplay, setTestImageDisplay] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const defaultFormData = useCallback((): Product => {
    if (!product) return {
      id: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: 0,
      brand_id: 0,
      images: [],
      variants: [],
      tags: [],
      details: [],
      size_chart: [],
      store_type: 'adult' as "adult" | "kids" | "sneakers" | "cpcompany",
      featured: false,
      active: true,
      sku: '',
      new: false
    };

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      brand_id: product.brand_id,
      images: product.images,
      variants: product.variants,
      tags: product.tags,
      details: product.details,
      size_chart: product.size_chart,
      store_type: product.store_type,
      featured: product.featured,
      active: product.active !== undefined ? product.active : true,
      sku: product.sku || '',
      new: product.new || false
    };
  }, [product]);

  useEffect(() => {
    if (product) {
      setFormData(defaultFormData());
    }
  }, [product, defaultFormData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Le nom du produit est requis";
    }
    if (!formData.description?.trim()) {
      newErrors.description = "La description est requise";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0";
    }
    if (!formData.category_id) {
      newErrors.category_id = "La catégorie est requise";
    }
    if (!formData.brand_id) {
      newErrors.brand_id = "La marque est requise";
    }
    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "Le stock doit être supérieur ou égal à 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    field: keyof Product,
    value: string | number | boolean | (string | File | Blob | ProductImage)[] | Variant[] | Review[] | Question[] | FAQ[] | SizeChart[] | string[]
  ): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fonction pour nettoyer les images et s'assurer qu'elles sont au bon format
  const cleanImages = (images: (string | File | Blob | ProductImage)[]): ProductImage[] => {
    if (!images || !Array.isArray(images)) return [];
    
    return images.map(img => {
      // Si c'est déjà un objet ProductImage valide
      if (typeof img === 'object' && img !== null && 'url' in img && typeof img.url === 'string' && img.url.trim() !== '') {
        return {
          url: img.url,
          publicId: 'publicId' in img && typeof img.publicId === 'string' ? img.publicId : ''
        };
      }
      
      // Si c'est une chaîne (URL)
      if (typeof img === 'string' && img.trim() !== '') {
        return {
          url: img,
          publicId: ''
        };
      }
      
      // Si c'est un File ou Blob, on retourne un objet vide qui sera filtré
      return {
        url: '',
        publicId: ''
      };
    }).filter(img => img.url && img.url.trim() !== '');
  };

  const handleImageUpload = async (files: FileList | File[] | null): Promise<void> => {
    if (!files?.length) {
      toast({
        title: "Erreur",
        description: "Aucun fichier sélectionné",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url);

      if (validUrls.length) {
        const existingImages = formData.images || [];
        const updatedImages = [...existingImages, ...validUrls];
        
        setFormData(prev => ({
          ...prev,
          images: updatedImages,
        }));
        
        setIsDirty(true);
        toast({
          title: "Succès",
          description: "Images téléchargées avec succès",
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement des images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = (index: number): void => {
    if (!formData.images) return;

    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);

    const firstImage = updatedImages[0];
    const imageUrl = typeof firstImage === 'string' 
      ? firstImage 
      : firstImage instanceof File || firstImage instanceof Blob 
        ? URL.createObjectURL(firstImage)
        : firstImage?.url || '';

    setFormData(prev => ({
      ...prev,
      images: updatedImages,
    }));

    setIsDirty(true);
    toast({
      title: "Succès",
      description: "Image supprimée avec succès",
    });
  };

  const handleImagePreview = (image: string | File | Blob | ProductImage): string => {
    if (typeof image === 'string') {
      return image;
    }
    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    if ('url' in image) {
      return image.url;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erreur",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Clean image URLs before submission
      const cleanedFormData = {
        ...formData,
        images: formData.images?.filter(img => typeof img === 'string' || 'url' in img).map(img => {
          if (typeof img === 'string') return img;
          return (img as ProductImage).url;
        }) || []
      };

      // S'assurer que les valeurs numériques sont bien des nombres
      cleanedFormData.price = Number(cleanedFormData.price);
      cleanedFormData.stock = Number(cleanedFormData.stock);
      cleanedFormData.category_id = Number(cleanedFormData.category_id);
      cleanedFormData.brand_id = Number(cleanedFormData.brand_id);

      // S'assurer que les chaînes de caractères sont bien formatées
      cleanedFormData.name = cleanedFormData.name?.trim() || '';
      cleanedFormData.description = cleanedFormData.description?.trim() || '';
      cleanedFormData.sku = cleanedFormData.sku?.trim() || '';

      // S'assurer que les tableaux sont bien définis
      cleanedFormData.variants = cleanedFormData.variants || [];
      cleanedFormData.tags = cleanedFormData.tags || [];
      cleanedFormData.details = cleanedFormData.details || [];

      // Supprimer les champs non nécessaires
      delete (cleanedFormData as any).colors;
      delete (cleanedFormData as any).image_url;
      delete (cleanedFormData as any).image;
      delete (cleanedFormData as any).category;
      delete (cleanedFormData as any).brand;
      delete (cleanedFormData as any).created_at;
      delete (cleanedFormData as any).updated_at;
      delete (cleanedFormData as any).size_chart;
      delete (cleanedFormData as any).active;
      delete (cleanedFormData as any).weight;
      delete (cleanedFormData as any).new;

      // Utiliser la prop onSubmit au lieu de l'appel API direct
      await onSubmit(cleanedFormData);

      toast({
        title: "Succès",
        description: product ? "Produit mis à jour avec succès" : "Produit créé avec succès",
      });
      
      // Rediriger vers /admin au lieu de /admin/products
      router.push('/admin');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement du produit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVariantChange = (variants: Variant[]): void => {
    handleChange("variants", variants);
  };

  const handleTagsChange = (tags: string[]): void => {
    handleChange("tags", tags);
  };

  const handleDetailsChange = (details: string[]): void => {
    handleChange("details", details);
  };

  const handleSizeChartChange = (sizeChart: SizeChart[]): void => {
    handleChange("size_chart", sizeChart);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await handleImageUpload(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    await handleImageUpload(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleStoreTypeChange = (value: "adult" | "kids" | "sneakers" | "cpcompany"): void => {
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
    const selectedCategory = categories.find(c => c.id === categoryId);
    handleChange("category_id", categoryId);
  };

  const handleBrandChange = (value: string): void => {
    const brandId = parseInt(value, 10);
    const selectedBrand = brands.find(b => b.id === brandId);
    handleChange("brand_id", brandId);
  };

  const handleTextChange = (field: keyof Pick<Product, "name" | "description" | "sku">) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    handleChange(field, e.target.value);
  };

  const handleNumberChange = (field: keyof Pick<Product, "price" | "stock">) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      handleChange(field, value);
    }
  };

  const handleCheckboxChange = (field: keyof Pick<Product, "featured" | "active" | "new">) => (
    checked: string | boolean
  ): void => {
    handleChange(field, Boolean(checked));
  };

  const handleSelectChange = (field: keyof Pick<Product, "category_id" | "brand_id" | "store_type">) => (
    value: string
  ): void => {
    if (field === "category_id") {
      handleCategoryChange(value);
    } else if (field === "brand_id") {
      handleBrandChange(value);
    } else if (field === "store_type") {
      handleStoreTypeChange(value as "adult" | "kids" | "sneakers" | "cpcompany");
    }
  };

  const handleArrayChange = (field: keyof Pick<Product, "tags" | "details">) => (
    value: string[]
  ): void => {
    handleChange(field, value);
  };

  const handleComplexArrayChange = (field: keyof Pick<Product, "variants" | "reviews" | "questions" | "faqs" | "size_chart">) => (
    value: Variant[] | Review[] | Question[] | FAQ[] | SizeChart[]
  ): void => {
    handleChange(field, value);
  };

  const handleImageChange = (field: keyof Pick<Product, "images">) => (
    value: string
  ): void => {
    handleChange(field, value);
  };

  const handleImagesChange = (value: (string | File | Blob | ProductImage)[]): void => {
    handleChange("images", value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-4">
      <div className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleTextChange("name")}
              required
              className={cn(
                "border-muted-foreground/20",
                errors.name && "border-red-500"
              )}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku || ''}
              onChange={handleTextChange("sku")}
              placeholder="Code unique du produit"
              className="border-muted-foreground/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Prix</Label>
            <Input
              id="price"
              value={formData.price.toString()}
              onChange={handleNumberChange("price")}
              required
              className={cn(
                "border-muted-foreground/20",
                errors.price && "border-red-500"
              )}
            />
            {errors.price && (
              <span className="text-xs text-red-500">{errors.price}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              value={formData.stock.toString()}
              onChange={handleNumberChange("stock")}
              required
              className={cn(
                "border-muted-foreground/20",
                errors.stock && "border-red-500"
              )}
            />
            {errors.stock && (
              <span className="text-xs text-red-500">{errors.stock}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleTextChange("description")}
            required
            className={cn(
              "min-h-[100px] border-muted-foreground/20 resize-none",
              errors.description && "border-red-500"
            )}
          />
          {errors.description && (
            <span className="text-xs text-red-500">{errors.description}</span>
          )}
        </div>

        {/* Catégorie et Marque */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-sm font-medium">Catégorie</Label>
            <Select
              value={formData.category_id?.toString() || ""}
              onValueChange={(value) => handleSelectChange("category_id")(value)}
            >
              <SelectTrigger className={cn(
                "border-muted-foreground/20",
                errors.category_id && "border-red-500"
              )}>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <span className="text-xs text-red-500">{errors.category_id}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_id" className="text-sm font-medium">Marque</Label>
            <Select
              value={formData.brand_id?.toString() || ""}
              onValueChange={(value) => handleSelectChange("brand_id")(value)}
            >
              <SelectTrigger className={cn(
                "border-muted-foreground/20",
                errors.brand_id && "border-red-500"
              )}>
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
              <span className="text-xs text-red-500">{errors.brand_id}</span>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Images du produit</Label>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTestImageDisplay(!testImageDisplay)}
                className="text-xs"
              >
                {testImageDisplay ? "Affichage normal" : "Tester affichage direct"}
              </Button>
            )}
          </div>
          <div className="border border-dashed border-muted-foreground/20 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="images"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32",
                  "border-2 border-dashed rounded-lg cursor-pointer",
                  "hover:bg-muted/50 transition-colors",
                  "border-muted-foreground/20"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour ajouter des images
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous pouvez sélectionner plusieurs images à la fois
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
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Upload en cours...</span>
              </div>
            )}
            
            {/* Affichage des images sélectionnées */}
            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Images sélectionnées ({formData.images.length})</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {formData.images.map((img, idx) => {
                    // Obtenir l'URL de l'image
                    const imgUrl = typeof img === 'string' 
                      ? img 
                      : (typeof img === 'object' && img !== null && 'url' in img && typeof img.url === 'string')
                        ? img.url
                        : '';
                        
                    console.log(`Image ${idx + 1} - URL:`, imgUrl);
                    
                    return (
                      <div key={idx} className="relative group">
                        <div className="aspect-square bg-muted rounded-md overflow-hidden border border-border">
                          {imgUrl ? (
                            <div 
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url('${imgUrl}')` }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-1 truncate">
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
        <div className="space-y-4">
          <Label className="text-sm font-medium">Variants</Label>
          <div className="border border-dashed border-muted-foreground/20 rounded-lg p-4">
            <VariantManager
              variants={formData.variants || []}
              onChange={(newVariants) => handleVariantChange(newVariants)}
            />
          </div>
        </div>

        {/* Type de magasin */}
        <div className="space-y-2">
          <Label htmlFor="store_type" className="text-sm font-medium">Type de magasin</Label>
          <Select
            value={formData.store_type}
            onValueChange={(value) => handleSelectChange("store_type")(value)}
          >
            <SelectTrigger className="border-muted-foreground/20">
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
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleCheckboxChange("featured")(checked)}
            />
            <Label htmlFor="featured" className="text-sm font-medium">Produit en vedette</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleCheckboxChange("active")(checked)}
            />
            <Label htmlFor="active" className="text-sm font-medium">Produit actif</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={formData.new}
              onCheckedChange={(checked) => handleCheckboxChange("new")(checked)}
            />
            <Label htmlFor="new" className="text-sm font-medium">Nouveau produit</Label>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="sticky bottom-0 flex items-center justify-between py-4 border-t bg-background">
        <div className="flex items-center text-sm text-muted-foreground">
          {isDirty && !isSubmitting && (
            <Alert variant="destructive" className="w-auto border-none p-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Modifications non enregistrées
              </AlertDescription>
            </Alert>
          )}
          {isSubmitting && (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </span>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading || !isDirty}
          className={cn(
            "transition-all duration-200",
            isDirty && !isSubmitting && "animate-pulse"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm

