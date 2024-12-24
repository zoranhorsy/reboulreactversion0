import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from '@/components/ImagePreview'
import { VariantManager } from './VariantManager'
import { uploadImages } from '@/lib/uploadImage'
import { toast } from "@/components/ui/use-toast"
import { Product } from '@/lib/api'

const categories = ['Electronics', 'Clothing', 'Books', 'Home Goods'];
const brands = ['Brand A', 'Brand B', 'Brand C'];

interface ProductFormProps {
    product: Partial<Product>;
    onSubmit: (product: Partial<Product>) => void;
    isEditing: boolean;
}

export function ProductForm({ product, onSubmit, isEditing }: ProductFormProps) {
    const [formData, setFormData] = useState<Partial<Product>>(product);
    const [uploadedImages, setUploadedImages] = useState<string[]>(product.images || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string) => (checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            try {
                const newImagePaths = await uploadImages(files);
                const updatedImages = [...uploadedImages, ...newImagePaths];
                setUploadedImages(updatedImages);
                setFormData(prev => ({ ...prev, images: updatedImages }));
                toast({
                    title: "Succès",
                    description: "Les images ont été uploadées avec succès.",
                });
            } catch (error) {
                console.error('Erreur lors de l\'upload des images:', error);
                toast({
                    title: "Erreur",
                    description: error instanceof Error ? error.message : "Impossible d'uploader les images. Veuillez réessayer.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updatedImages);
        setFormData(prev => ({ ...prev, images: updatedImages }));
    };

    const handleVariantsChange = (variants: Product['variants']) => {
        setFormData(prev => ({ ...prev, variants }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <Label htmlFor="price">Prix</Label>
                <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                    value={formData.category}
                    onValueChange={handleSelectChange('category')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="brand">Marque</Label>
                <Select
                    value={formData.brand}
                    onValueChange={handleSelectChange('brand')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                    <SelectContent>
                        {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                                {brand}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="storeType">Type de magasin</Label>
                <Select
                    value={formData.storeType}
                    onValueChange={handleSelectChange('storeType')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de magasin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="adult">Adulte</SelectItem>
                        <SelectItem value="kids">Enfant</SelectItem>
                        <SelectItem value="Sneakers">Sneakers</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="images">Images du produit</Label>
                <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                />
                <ImagePreview images={uploadedImages} onRemove={handleRemoveImage} />
            </div>
            <VariantManager
                variants={formData.variants || []}
                onChange={handleVariantsChange}
            />
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={handleCheckboxChange('featured')}
                />
                <Label htmlFor="featured">Produit en vedette</Label>
            </div>
            {/* Supprimer ou commenter cette ligne */}
            {/* <Button type="submit" className="w-full">
                {isEditing ? "Mettre à jour le produit" : "Ajouter le produit"}
            </Button> */}
        </form>
    );
}

