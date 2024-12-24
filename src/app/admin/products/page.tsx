'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from '@/lib/api'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadImages } from '@/lib/uploadImage'
import Image from 'next/image'
import { ImagePreview } from '@/components/ImagePreview'
import { Search, Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VariantManager } from '@/components/admin/VariantManager'

const categories = ['Electronics', 'Clothing', 'Books', 'Home Goods'];
const brands = ['Brand A', 'Brand B', 'Brand C'];
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White'];

const ProductForm = ({
                         product,
                         isEditing,
                         onSubmit,
                         setEditingProduct,
                         setNewProduct
                     }: {
    product: Product,
    isEditing: boolean,
    onSubmit: (e: React.FormEvent) => void,
    setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>,
    setNewProduct: React.Dispatch<React.SetStateAction<Product>>
}) => {
    const [uploadedImages, setUploadedImages] = useState<string[]>(product.images || []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            try {
                const newImagePaths = await uploadImages(files);
                const updatedImages = [...uploadedImages, ...newImagePaths];
                setUploadedImages(updatedImages);
                handleChange("images", updatedImages);
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
        handleChange("images", updatedImages);
    };

    const handleChange = useCallback((field: string, value: any) => {
        if (isEditing) {
            setEditingProduct((prev) => prev ? ({ ...prev, [field]: value }) : null);
        } else {
            setNewProduct((prev) => ({ ...prev, [field]: value }));
        }
    }, [isEditing, setEditingProduct, setNewProduct]);

    const handleArrayChange = useCallback((field: string, index: number, value: any) => {
        if (isEditing) {
            setEditingProduct((prev) => {
                if (!prev) return null;
                const updatedArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
                updatedArray[index] = { ...updatedArray[index], ...value };
                return { ...prev, [field]: updatedArray };
            });
        } else {
            setNewProduct((prev) => {
                const updatedArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
                updatedArray[index] = { ...updatedArray[index], ...value };
                return { ...prev, [field]: updatedArray };
            });
        }
    }, [isEditing, setEditingProduct, setNewProduct]);

    const handleAddArrayItem = useCallback((field: string, item: any) => {
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

    const handleRemoveArrayItem = useCallback((field: string, index: number) => {
        handleChange(field, (prev: any[]) => prev.filter((_, i) => i !== index));
    }, [handleChange]);

    return (
        <form onSubmit={onSubmit} className="space-y-8" id="productForm">
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
                        value={product.category}
                        onValueChange={(value) => handleChange("category", value)}
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
                        value={product.brand}
                        onValueChange={(value) => handleChange("brand", value)}
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
                                <Trash2 className="h-4 w-4" />
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
                {Array.isArray(product.reviews) && product.reviews.length > 0 ? (
                    product.reviews.map((review, index) => (
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
                    ))
                ) : (
                    <p>Aucune review pour le moment.</p>
                )}
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

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [newProduct, setNewProduct] = useState<Product>({
        id: '',
        name: '',
        price: 0,
        description: '',
        category: '',
        brand: '',
        images: [],
        storeType: 'adult',
        featured: false,
        colors: [],
        variants: [],
        tags: [],
        reviews: [],
        questions: [],
        faqs: [],
        sizeChart: [],
    })
    const [isEditing, setIsEditing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'ascending' | 'descending' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { reset } = useForm<Partial<Product>>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            brand: '',
            storeType: 'adult',
            featured: false,
            images: [],
            colors: [],
            variants: [],
            tags: [],
            reviews: [],
            questions: [],
            faqs: [],
            sizeChart: [],
        },
    })

    useEffect(() => {
        loadProducts()
    }, [])

    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            console.log("Début du chargement des produits");
            const { products } = await fetchProducts({})
            console.log("Produits récupérés:", products);
            setProducts(products)
            setFilteredProducts(products)
            console.log("Produits chargés avec succès");
        } catch (error) {
            console.error("Erreur détaillée lors du chargement des produits:", error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les produits. Veuillez réessayer.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const productToAdd = {
                ...newProduct,
                price: parseFloat(newProduct.price.toString()) || 0,
                featured: newProduct.featured || false,
                variants: Array.isArray(newProduct.variants) ? newProduct.variants : [],
                tags: Array.isArray(newProduct.tags) ? newProduct.tags : [],
                reviews: Array.isArray(newProduct.reviews) ? newProduct.reviews : [],
                questions: Array.isArray(newProduct.questions) ? newProduct.questions : [],
                faqs: Array.isArray(newProduct.faqs) ? newProduct.faqs : [],
                sizeChart: Array.isArray(newProduct.sizeChart) ? newProduct.sizeChart : [],
                colors: Array.isArray(newProduct.colors) ? newProduct.colors : [],
                storeType: newProduct.storeType || 'adult',
            };
            const createdProduct = await createProduct(productToAdd)
            setProducts([...products, createdProduct])
            setFilteredProducts([...filteredProducts, createdProduct])
            setNewProduct({
                id: '',
                name: '',
                price: 0,
                description: '',
                category: '',
                brand: '',
                images: [],
                storeType: 'adult',
                featured: false,
                colors: [],
                variants: [],
                tags: [],
                reviews: [],
                questions: [],
                faqs: [],
                sizeChart: [],
            })
            toast({
                title: "Succès",
                description: "Le produit a été ajouté avec succès.",
            })
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error)
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible d'ajouter le produit.",
                variant: "destructive",
            })
        }
    }

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        try {
            const productToUpdate = {
                ...editingProduct,
                price: parseFloat(editingProduct.price.toString()),
                featured: editingProduct.featured || false,
                variants: editingProduct.variants || [],
                tags: editingProduct.tags || [],
                reviews: editingProduct.reviews || [],
                questions: editingProduct.questions || [],
                faqs: editingProduct.faqs || [],
                sizeChart: editingProduct.sizeChart || [],
                colors: editingProduct.colors || [],
            };
            const updatedProduct = await updateProduct(editingProduct.id, productToUpdate);
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            setFilteredProducts(filteredProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            setEditingProduct(null);
            setIsEditing(false);
            toast({
                title: "Succès",
                description: "Le produit a été mis à jour avec succès.",
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible de mettre à jour le produit.",
                variant: "destructive",
            });
        }
    };

    const handleEditProduct2 = useCallback((product: Product) => {
        setEditingProduct({
            ...product,
            reviews: Array.isArray(product.reviews) ? product.reviews : [],
            questions: Array.isArray(product.questions) ? product.questions : [],
            faqs: Array.isArray(product.faqs) ? product.faqs : [],
            sizeChart: Array.isArray(product.sizeChart) ? product.sizeChart : [],
            variants: Array.isArray(product.variants) ? product.variants : [],
            tags: Array.isArray(product.tags) ? product.tags : [],
            colors: Array.isArray(product.colors) ? product.colors : [],
        });
        setIsEditing(true);
        setIsDialogOpen(true);
    }, []);

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            try {
                await deleteProduct(id)
                setProducts(products.filter(p => p.id !== id))
                setFilteredProducts(filteredProducts.filter(p => p.id !== id))
                toast({
                    title: "Succès",
                    description: "Le produit a été supprimé avec succès.",
                })
            } catch (error) {
                console.error("Erreur lors de la suppression du produit:", error)
                toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors de la suppression du produit.",
                    variant: "destructive",
                })
            }
        }
    };

    const handleCloseDialog = useCallback(() => {
        setEditingProduct(null);
        setIsEditing(false);
        setIsDialogOpen(false);
        reset();
    }, [reset]);

    const handleSort = (key: keyof Product) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedProducts = [...filteredProducts].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setFilteredProducts(sortedProducts);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestion des Produits</h1>

            {isLoading ? (
                <div>Chargement des produits...</div>
            ) : filteredProducts.length === 0 ? (
                <div>Aucun produit trouvé.</div>
            ) : (
                <div className="flex space-x-4 mb-4">
                    <Input
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
                    </Button>
                </div>
            )}

            {isLoading ? null : (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="adult">Adulte</TabsTrigger>
                        <TabsTrigger value="kids">Enfant</TabsTrigger>
                        <TabsTrigger value="sneakers">Sneakers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tous les produits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr>
                                            <th className="text-left p-2">Image</th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                                                Nom {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('price')}>
                                                Prix {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2">Catégorie</th>
                                            <th className="text-left p-2">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="p-2">
                                                    {product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={50}
                                                            height={50}
                                                            className="rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                                                    )}
                                                </td>
                                                <td className="p-2">{product.name}</td>
                                                <td className="p-2">{product.price.toFixed(2)} €</td>
                                                <td className="p-2">{product.category}</td>
                                                <td className="p-2">
                                                    <Button variant="ghost" onClick={() => handleEditProduct2(product)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                    </Button>
                                                    <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="adult">
                        <Card>
                            <CardHeader>
                                <CardTitle>Produits Adulte</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr>
                                            <th className="text-left p-2">Image</th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                                                Nom {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('price')}>
                                                Prix {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2">Catégorie</th>
                                            <th className="text-left p-2">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredProducts.filter(product => product.storeType === 'adult').map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="p-2">
                                                    {product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={50}
                                                            height={50}
                                                            className="rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                                                    )}
                                                </td>
                                                <td className="p-2">{product.name}</td>
                                                <td className="p-2">{product.price.toFixed(2)} €</td>
                                                <td className="p-2">{product.category}</td>
                                                <td className="p-2">
                                                    <Button variant="ghost" onClick={() => handleEditProduct2(product)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                    </Button>
                                                    <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="kids">
                        <Card>
                            <CardHeader>
                                <CardTitle>Produits Enfant</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr>
                                            <th className="text-left p-2">Image</th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                                                Nom {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('price')}>
                                                Prix {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2">Catégorie</th>
                                            <th className="text-left p-2">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredProducts.filter(product => product.storeType === 'kids').map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="p-2">
                                                    {product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={50}
                                                            height={50}
                                                            className="rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                                                    )}
                                                </td>
                                                <td className="p-2">{product.name}</td>
                                                <td className="p-2">{product.price.toFixed(2)} €</td>
                                                <td className="p-2">{product.category}</td>
                                                <td className="p-2">
                                                    <Button variant="ghost" onClick={() => handleEditProduct2(product)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                    </Button>
                                                    <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="sneakers">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sneakers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr>
                                            <th className="text-left p-2">Image</th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                                                Nom {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('price')}>
                                                Prix {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                                            </th>
                                            <th className="text-left p-2">Catégorie</th>
                                            <th className="text-left p-2">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredProducts.filter(product => product.storeType === 'sneakers').map((product) => (
                                            <tr key={product.id} className="border-t">
                                                <td className="p-2">
                                                    {product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={50}
                                                            height={50}
                                                            className="rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                                                    )}
                                                </td>
                                                <td className="p-2">{product.name}</td>
                                                <td className="p-2">{product.price.toFixed(2)} €</td>
                                                <td className="p-2">{product.category}</td>
                                                <td className="p-2">
                                                    <Button variant="ghost" onClick={() => handleEditProduct2(product)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                    </Button>
                                                    <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-4">
                        <ProductForm
                            product={isEditing ? editingProduct! : newProduct}
                            isEditing={isEditing}
                            onSubmit={isEditing ? handleEditProduct : handleAddProduct}
                            setEditingProduct={setEditingProduct}
                            setNewProduct={setNewProduct}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 p-4">
                        <Button variant="outline" onClick={handleCloseDialog}>Annuler</Button>
                        <Button type="submit" form="productForm">
                            {isEditing ? "Mettre à jour" : "Ajouter"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

