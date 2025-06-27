"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { uploadImage } from "@/lib/cloudinary";
import { CldImage } from "next-cloudinary";

interface Archive {
  id: number;
  title: string;
  description: string;
  category: "store" | "shooting" | "event";
  image_paths: string[];
  date: string;
  active: boolean;
}

interface ArchiveFormData {
  title: string;
  description: string;
  category: "store" | "shooting" | "event";
  date: string;
  images: File[];
  active: boolean;
}

const CATEGORIES = [
  { value: "store", label: "Boutique" },
  { value: "shooting", label: "Shooting" },
  { value: "event", label: "Événement" },
] as const;

export function ArchiveManager() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const [formData, setFormData] = useState<ArchiveFormData>({
    title: "",
    description: "",
    category: "store",
    date: format(new Date(), "yyyy-MM-dd"),
    images: [],
    active: true,
  });

  const loadArchives = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.fetchArchives();
      console.log("Archives reçues:", response);
      setArchives(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Erreur lors du chargement des archives:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les archives.",
        variant: "destructive",
      });
      setArchives([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        const uploadPromises = formData.images.map((image) =>
          uploadImage(image),
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((result) => result.url);
      } else if (editingArchive) {
        imageUrls = editingArchive.image_paths;
      }

      if (imageUrls.length === 0) {
        toast({
          title: "Erreur",
          description: "Au moins une image est requise.",
          variant: "destructive",
        });
        return;
      }

      const archiveData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        active: formData.active,
        image_paths: imageUrls,
      };

      console.log("Données à envoyer:", archiveData);

      if (editingArchive) {
        await api.updateArchive(editingArchive.id.toString(), archiveData);
        toast({
          title: "Succès",
          description: "L'archive a été mise à jour avec succès.",
        });
      } else {
        await api.createArchive(archiveData);
        toast({
          title: "Succès",
          description: "L'archive a été créée avec succès.",
        });
      }

      setFormData({
        title: "",
        description: "",
        category: "store",
        date: format(new Date(), "yyyy-MM-dd"),
        images: [],
        active: true,
      });
      setEditingArchive(null);
      setIsDialogOpen(false);
      loadArchives();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteArchive(id.toString());
      toast({
        title: "Succès",
        description: "L'archive a été supprimée avec succès.",
      });
      loadArchives();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (archive: Archive) => {
    setEditingArchive(archive);
    setFormData({
      title: archive.title,
      description: archive.description,
      category: archive.category,
      date: format(new Date(archive.date), "yyyy-MM-dd"),
      images: [],
      active: archive.active,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingArchive(null);
    setFormData({
      title: "",
      description: "",
      category: "store",
      date: format(new Date(), "yyyy-MM-dd"),
      images: [],
      active: true,
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...Array.from(files)],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span>⏳</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête avec titre et boutons d'action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Archives
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Gérez les photos d&apos;archives de votre boutique
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center justify-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex-1 sm:flex-initial h-8"
            >
              <span>🔲</span>
              Grille
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1 sm:flex-initial h-8"
            >
              <span>📋</span>
              Liste
            </Button>
          </div>
          <Button onClick={handleAdd} className="w-full sm:w-auto">
            <span>+</span>
            Ajouter une archive
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span>⏳</span>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {archives.map((archive) => (
                <Card key={archive.id} className="overflow-hidden group">
                  <div className="relative aspect-[4/3] w-full bg-accent/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(archive)}
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(archive.id)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg line-clamp-1">
                      {archive.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {archive.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(archive.date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archives.map((archive) => (
                    <TableRow key={archive.id}>
                      <TableCell>
                        <div className="relative aspect-square w-[60px] sm:w-[80px] rounded-lg overflow-hidden bg-accent/5"></div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2 sm:line-clamp-1">
                          {archive.title}
                        </div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {new Date(archive.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="line-clamp-2">
                          {archive.description}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(archive.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(archive)}
                          >
                            <span>✏️</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(archive.id)}
                          >
                            <span>🗑️</span>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArchive ? "Modifier l'archive" : "Nouvelle archive"}
            </DialogTitle>
            <DialogDescription>
              {editingArchive
                ? "Modifiez les informations de l'archive ici."
                : "Créez une nouvelle archive."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "store" | "shooting" | "event") =>
                    setFormData((prev) => ({ ...prev, category: value }))
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="active">Archive active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Images</Label>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <span>ImagePlus</span>
                    Ajouter des images
                  </Button>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    required={!editingArchive && formData.images.length === 0}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {editingArchive && !formData.images.length && (
                    <>
                      {editingArchive.image_paths.map((imagePath, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden bg-accent/5"
                        >
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const newImagePaths =
                                  editingArchive.image_paths.filter(
                                    (_, i) => i !== index,
                                  );
                                setEditingArchive({
                                  ...editingArchive,
                                  image_paths: newImagePaths,
                                });
                              }}
                            >
                              <span>🗑️</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {formData.images.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-accent/5"
                    >
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={500}
                        height={500}
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                        <p className="text-white text-xs truncate">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting && <span>⏳</span>}
                  {editingArchive ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <h4 className="font-medium flex items-center gap-2">
        <span>⚠️</span>
        Besoin d&apos;aide ?
      </h4>
    </div>
  );
}
