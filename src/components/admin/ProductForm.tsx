'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from '@/components/ImagePreview'
import { VariantManager } from '@/components/admin/VariantManager'
import { Product, Category, api, Brand } from '@/lib/api'
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White'];

interface ProductFormProps {
    product: Product;
    isEditing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
    setNewProduct: React.Dispatch<React.SetStateAction<Product>>;
    categories: Category[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
    product,
    isEditing,
    onSubmit,
    setEditingProduct,
    setNewProduct,
    categories
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        const loadBrands = async () => {
            const fetchedBrands = await api.fetchBrands();
            setBrands(fetchedBrands);
        };
        loadBrands();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setIsUploading(true);
            setUploadProgress(0);
            try {
                // Upload directly to server
                const uploadedUrls = await api.uploadImages(files);

                // Update the product with the new permanent URLs
                const updatedImages = [...(product.images || []), ...uploadedUrls];
                handleChange("images", updatedImages);

                toast({
                    title: "Succès",
                    description: `${files.length} image(s) uploadée(s) avec succès.`,
                });

                setUploadProgress(100);
            } catch (error) {
                console.error('Erreur lors de l\'upload des images:', error);
                toast({
                    title: "Erreur",
                    description: "Impossible d'uploader les images. Veuillez réessayer.",
                    variant: "destructive",
                });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRemoveImage = async (index: number) => {
        const updatedImages = [...product.images];
        updatedImages.splice(index, 1);
        handleChange("images", updatedImages);
    };

    const handleChange = useCallback((field: keyof Product, value: Product[keyof Product]) => {
        if (isEditing) {
            setEditingProduct((prev) => prev ? ({ ...prev, [field]: value }) : null);
        } else {
            setNewProduct((prev) => ({ ...prev, [field]: value }));
        }
    }, [isEditing, setEditingProduct, setNewProduct]);

    const handleArrayChange = useCallback((field: keyof Product, index: number, value: unknown) => {
        if (isEditing) {
            setEditingProduct((prev) => {
                if (!prev) return null;
                const updatedArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
                if (field === "tags") {
                    updatedArray[index] = value as string;
                } else {
                    updatedArray[index] = { ...updatedArray[index], ...value };
                }
                return { ...prev, [field]: updatedArray };
            });
        } else {
            setNewProduct((prev) => {
                const updatedArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
                if (field === "tags") {
                    updatedArray[index] = value as string;
                } else {
                    updatedArray[index] = { ...updatedArray[index], ...value };
                }
                return { ...prev, [field]: updatedArray };
            });
        }
    }, [isEditing, setEditingProduct, setNewProduct]);

    const handleAddArrayItem = useCallback((field: keyof Product, item: unknown) => {
        if (isEditing) {
            setEditingProduct((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    [field]: Array.isArray(prev[field]) ? [...prev[field], item] : [item]
                };
            });
        } else {
            setNewProduct((prev) => ({
                ...prev,
                [field]: Array.isArray(prev[field]) ? [...prev[field], item] : [item]
            }));
        }
    }, [isEditing, setEditingProduct, setNewProduct]);

    const handleRemoveArrayItem = useCallback((field: keyof Product, index: number) => {
        handleChange(field, (prev: unknown[]) => prev.filter((_, i) => i !== index));
    }, [handleChange]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8" id="productForm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                        id="name"
                        value={product.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="price">Prix</Label>
                    <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                        value={product.category?.toString()}
                        onValueChange={(value) => handleChange("category", parseInt(value, 10))}
                    >
                        <SelectTrigger>
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
                </div>
                <div>
                    <Label htmlFor="brand">Marque</Label>
                    <Select
                        value={product.brand}
                        onValueChange={(value) => handleChange("brand", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une marque" />
                        </SelectTrigger>
                        <SelectContent>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.name}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <Label htmlFor="images">Images du produit</Label>
                <div className="grid gap-4">
                    <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isUploading}
                    />
                    {isUploading && (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                                Upload en cours... {uploadProgress}%
                            </span>
                        </div>
                    )}
                    <ImagePreview
                        images={product.images || []}
                        onRemove={handleRemoveImage}
                    />
                </div>
            </div>

            <div>
                <Label>Variants</Label>
                <VariantManager
                    variants={product.variants || []}
                    onChange={(newVariants) => handleChange("variants", newVariants)}
                />
            </div>

            <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray(product.tags) && product.tags.map((tag, index) => (
                        <div key={index} className="flex items-center">
                            <Input
                                value={tag}
                                onChange={(e) => handleArrayChange("tags", index, e.target.value)}
                                className="w-auto"
                            />
                            <Button type="button" variant="ghost" onClick={() => handleRemoveArrayItem("tags", index)}>
                                Supprimer
                            </Button>
                        </div>
                    ))}
                    <Button type="button" onClick={() => handleAddArrayItem("tags", "")}>
                        Ajouter un tag
                    </Button>
                </div>
            </div>

            <div>
                <Label>Reviews</Label>
                {Array.isArray(product.reviews) && product.reviews.map((review, index) => (
                    <div key={index} className="border p-4 mb-4 rounded">
                        <Input
                            value={review.rating}
                            onChange={(e) => handleArrayChange("reviews", index, { rating: parseInt(e.target.value) })}
                            type="number"
                            min="1"
                            max="5"
                            placeholder="Note"
                            className="mb-2"
                        />
                        <Textarea
                            value={review.comment}
                            onChange={(e) => handleArrayChange("reviews", index, { comment: e.target.value })}
                            placeholder="Commentaire"
                            className="mb-2"
                        />
                        <Input
                            value={review.userName}
                            onChange={(e) => handleArrayChange("reviews", index, { userName: e.target.value })}
                            placeholder="Nom d'utilisateur"
                            className="mb-2"
                        />
                        <Input
                            value={review.date}
                            onChange={(e) => handleArrayChange("reviews", index, { date: e.target.value })}
                            type="date"
                            className="mb-2"
                        />
                        <Button type="button" variant="destructive" onClick={() => handleRemoveArrayItem("reviews", index)}>
                            Supprimer
                        </Button>
                    </div>
                ))}
                <Button type="button" onClick={() => handleAddArrayItem("reviews", { id: Date.now(), rating: 5, comment: "", userName: "", date: new Date().toISOString().split('T')[0] })}>
                    Ajouter une review
                </Button>
            </div>

            <div>
                <Label>Questions</Label>
                {Array.isArray(product.questions) && product.questions.map((question, index) => (
                    <div key={index} className="border p-4 mb-4 rounded">
                        <Input
                            value={question.question}
                            onChange={(e) => handleArrayChange("questions", index, { question: e.target.value })}
                            placeholder="Question"
                            className="mb-2"
                        />
                        <Input
                            value={question.answer}
                            onChange={(e) => handleArrayChange("questions", index, { answer: e.target.value })}
                            placeholder="Réponse (optionnelle)"
                            className="mb-2"
                        />
                        <Button type="button" variant="destructive" onClick={() => handleRemoveArrayItem("questions", index)}>
                            Supprimer
                        </Button>
                    </div>
                ))}
                <Button type="button" onClick={() => handleAddArrayItem("questions", { id: Date.now(), question: "", answer: "" })}>
                    Ajouter une question
                </Button>
            </div>

            <div>
                <Label>FAQs</Label>
                {Array.isArray(product.faqs) && product.faqs.map((faq, index) => (
                    <div key={index} className="border p-4 mb-4 rounded">
                        <Input
                            value={faq.question}
                            onChange={(e) => handleArrayChange("faqs", index, { question: e.target.value })}
                            placeholder="Question"
                            className="mb-2"
                        />
                        <Textarea
                            value={faq.answer}
                            onChange={(e) => handleArrayChange("faqs", index, { answer: e.target.value })}
                            placeholder="Réponse"
                            className="mb-2"
                        />
                        <Button type="button" variant="destructive" onClick={() => handleRemoveArrayItem("faqs", index)}>
                            Supprimer
                        </Button>
                    </div>
                ))}
                <Button type="button" onClick={() => handleAddArrayItem("faqs", { question: "", answer: "" })}>
                    Ajouter une FAQ
                </Button>
            </div>

            <div>
                <Label>Tableau des tailles</Label>
                {Array.isArray(product.sizeChart) && product.sizeChart.map((size, index) => (
                    <div key={index} className="border p-4 mb-4 rounded grid grid-cols-4 gap-2">
                        <Input
                            value={size.size}
                            onChange={(e) => handleArrayChange("sizeChart", index, { size: e.target.value })}
                            placeholder="Taille"
                        />
                        <Input
                            value={size.chest}
                            onChange={(e) => handleArrayChange("sizeChart", index, { chest: parseFloat(e.target.value) })}
                            type="number"
                            step="0.1"
                            placeholder="Poitrine"
                        />
                        <Input
                            value={size.waist}
                            onChange={(e) => handleArrayChange("sizeChart", index, { waist: parseFloat(e.target.value) })}
                            type="number"
                            step="0.1"
                            placeholder="Taille"
                        />
                        <Input
                            value={size.hips}
                            onChange={(e) => handleArrayChange("sizeChart", index, { hips: parseFloat(e.target.value) })}
                            type="number"
                            step="0.1"
                            placeholder="Hanches"
                        />
                        <Button type="button" variant="destructive" onClick={() => handleRemoveArrayItem("sizeChart", index)}>
                            Supprimer
                        </Button>
                    </div>
                ))}
                <Button type="button" onClick={() => handleAddArrayItem("sizeChart", { size: "", chest: 0, waist: 0, hips: 0 })}>
                    Ajouter une taille
                </Button>
            </div>

            <div>
                <Label htmlFor="storeType">Type de magasin</Label>
                <Select
                    value={product.storeType}
                    onValueChange={(value) => handleChange("storeType", value as 'adult' | 'kids' | 'sneakers')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de magasin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="adult">Adulte</SelectItem>
                        <SelectItem value="kids">Enfant</SelectItem>
                        <SelectItem value="sneakers">Sneakers</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="featured"
                    checked={product.featured}
                    onCheckedChange={(checked: boolean) => handleChange("featured", checked)}
                />
                <Label htmlFor="featured">Produit en vedette</Label>
            </div>

            <div>
                <Label>Couleurs</Label>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <div key={color} className="flex items-center">
                            <Checkbox
                                id={`color-${color}`}
                                checked={Array.isArray(product.colors) && product.colors.includes(color)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        handleChange("colors", [...(Array.isArray(product.colors) ? product.colors : []), color]);
                                    } else {
                                        handleChange("colors", (Array.isArray(product.colors) ? product.colors : []).filter(c => c !== color));
                                    }
                                }}
                            />
                            <Label htmlFor={`color-${color}`} className="ml-2">{color}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button type="submit" className="w-full">
                {isEditing ? "Mettre à jour le produit" : "Ajouter le produit"}
            </Button>
        </form>
    );
};

export default ProductForm;

