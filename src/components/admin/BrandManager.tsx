'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { api } from '@/lib/api'
import { Edit, Trash2, Plus, Loader2, ImagePlus } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface Brand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  products_count?: number;
}

interface BrandManagerProps {
    onUpdate: () => void
}

export function BrandManager({ onUpdate }: BrandManagerProps) {
    const [brands, setBrands] = useState<Brand[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        logo: null as File | null,
        description: "",
    })
    const { toast } = useToast()

    const loadBrands = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await api.fetchBrands()
            setBrands(response)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les marques.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        loadBrands()
    }, [loadBrands])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingBrand) {
                await api.updateBrand(editingBrand.id, formData)
                toast({
                    title: "Succès",
                    description: "La marque a été mise à jour.",
                })
            } else {
                await api.createBrand(formData)
                toast({
                    title: "Succès",
                    description: "La marque a été créée.",
                })
            }
            loadBrands()
            onUpdate()
            setIsDialogOpen(false)
            setFormData({
                name: "",
                logo: null,
                description: "",
            })
            setEditingBrand(null)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (brandId: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette marque ?")) return

        try {
            await api.deleteBrand(brandId)
            toast({
                title: "Succès",
                description: "La marque a été supprimée.",
            })
            loadBrands()
            onUpdate()
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer la marque.",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand)
        setFormData({
            name: brand.name,
            logo: null,
            description: brand.description || "",
        })
        setIsDialogOpen(true)
    }

    const handleAdd = () => {
        setEditingBrand(null)
        setFormData({
            name: "",
            logo: null,
            description: "",
        })
        setIsDialogOpen(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                logo: file
            }))
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Marques</h2>
                    <p className="text-muted-foreground">
                        Gérez les marques de produits de votre boutique
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une marque
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingBrand ? "Modifier la marque" : "Ajouter une marque"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de la marque</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Entrez le nom de la marque"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Description de la marque"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('logo')?.click()}
                                    >
                                        <ImagePlus className="h-4 w-4 mr-2" />
                                        {formData.logo ? "Changer le logo" : "Ajouter un logo"}
                                    </Button>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {formData.logo && (
                                        <span className="text-sm text-muted-foreground">
                                            {formData.logo.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.name.trim()}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingBrand ? "Mettre à jour" : "Ajouter"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <ScrollArea className="h-[calc(100vh-400px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Logo</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Nombre de produits</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : brands.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Aucune marque trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands.map((brand) => (
                                    <TableRow key={brand.id} className="group">
                                        <TableCell>
                                            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted">
                                                {brand.logo ? (
                                                    <Image
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{brand.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground line-clamp-1">
                                                {brand.description || "Aucune description"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                {brand.products_count || 0} produit(s)
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(brand)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(brand.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    )
}

export default BrandManager
