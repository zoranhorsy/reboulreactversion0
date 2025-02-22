'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash2, Plus, Loader2, ImagePlus, Calendar, Grid, List, AlertCircle } from 'lucide-react'
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
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api } from '@/lib/api'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"

interface Archive {
    id: number
    title: string
    description: string
    category: 'store' | 'shooting' | 'event'
    image_path: string
    date: string
    active: boolean
}

interface ArchiveFormData {
    title: string
    description: string
    category: 'store' | 'shooting' | 'event'
    date: string
    image: File | null
    active: boolean
}

const CATEGORIES = [
    { value: 'store', label: 'Boutique' },
    { value: 'shooting', label: 'Shooting' },
    { value: 'event', label: 'Événement' }
] as const

const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png'
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`
}

export function ArchiveManager() {
    const [archives, setArchives] = useState<Archive[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingArchive, setEditingArchive] = useState<Archive | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const { toast } = useToast()

    const [formData, setFormData] = useState<ArchiveFormData>({
        title: '',
        description: '',
        category: 'store',
        date: format(new Date(), 'yyyy-MM-dd'),
        image: null,
        active: true
    })

    const loadArchives = useCallback(async () => {
        try {
            const archives = await api.fetchArchives()
            if (archives && Array.isArray(archives.data)) {
                setArchives(archives.data)
            } else {
                setArchives([])
            }
        } catch (error) {
            console.error('Erreur lors du chargement des archives:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les archives.",
                variant: "destructive",
            })
            setArchives([])
        }
    }, [toast])

    useEffect(() => {
        loadArchives()
    }, [loadArchives])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('title', formData.title)
            formDataToSend.append('description', formData.description)
            if (formData.image) {
                formDataToSend.append('file', formData.image)
            }

            if (editingArchive) {
                await api.updateArchive(editingArchive.id.toString(), formDataToSend)
                toast({
                    title: "Succès",
                    description: "L'archive a été mise à jour avec succès.",
                })
            } else {
                await api.createArchive(formDataToSend)
                toast({
                    title: "Succès",
                    description: "L'archive a été créée avec succès.",
                })
            }

            setFormData({
                title: '',
                description: '',
                category: 'store',
                date: format(new Date(), 'yyyy-MM-dd'),
                image: null,
                active: true
            })
            setEditingArchive(null)
            setIsDialogOpen(false)
            loadArchives()
        } catch (error) {
            console.error('Erreur lors de la soumission:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await api.deleteArchive(id.toString())
            toast({
                title: "Succès",
                description: "L'archive a été supprimée avec succès.",
            })
            loadArchives()
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la suppression.",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (archive: Archive) => {
        setEditingArchive(archive)
        setFormData({
            title: archive.title,
            description: archive.description,
            category: archive.category,
            date: archive.date,
            image: null,
            active: archive.active
        })
        setIsDialogOpen(true)
    }

    const handleAdd = () => {
        setEditingArchive(null)
        setFormData({
            title: '',
            description: '',
            category: 'store',
            date: format(new Date(), 'yyyy-MM-dd'),
            image: null,
            active: true
        })
        setIsDialogOpen(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }))
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Archives</h2>
                    <p className="text-muted-foreground">
                        Gérez les photos d&apos;archives de votre boutique
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-8 w-8 p-0"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-8 w-8 p-0"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une archive
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {archives.map((archive) => (
                                <Card key={archive.id} className="overflow-hidden">
                                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-accent/5">
                                        <Image
                                            src={getImageUrl(archive.image_path)}
                                            alt={archive.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleEdit(archive)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(archive.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1">{archive.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{archive.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(archive.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {archives.map((archive) => (
                                        <TableRow key={archive.id}>
                                            <TableCell>
                                                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-accent/5">
                                                    <Image
                                                        src={getImageUrl(archive.image_path)}
                                                        alt={archive.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{archive.title}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="line-clamp-2">{archive.description}</span>
                                            </TableCell>
                                            <TableCell>{new Date(archive.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(archive)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(archive.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;archive</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations de l&apos;archive ici.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: 'store' | 'shooting' | 'event') => 
                                        setFormData(prev => ({ ...prev, category: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image</Label>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('image')?.click()}
                                >
                                    <ImagePlus className="w-4 h-4 mr-2" />
                                    {formData.image ? "Changer l&apos;image" : "Ajouter une image"}
                                </Button>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    required={!editingArchive}
                                />
                                {formData.image && (
                                    <span className="text-sm text-muted-foreground">
                                        {formData.image.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="active"
                                checked={formData.active}
                                onCheckedChange={(checked) => 
                                    setFormData(prev => ({ ...prev, active: checked }))
                                }
                            />
                            <Label htmlFor="active">Archive active</Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingArchive ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Besoin d&apos;aide ?
            </h4>
        </div>
    )
} 