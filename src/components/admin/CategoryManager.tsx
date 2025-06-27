"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: number;
  name: string;
  products_count?: number;
}

interface CategoryManagerProps {
  onUpdate: () => void;
}

export function CategoryManager({ onUpdate }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.fetchCategories();
      setCategories(response);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, newCategoryName);
        toast({
          title: "Succès",
          description: "La catégorie a été mise à jour.",
        });
      } else {
        await api.createCategory(newCategoryName);
        toast({
          title: "Succès",
          description: "La catégorie a été créée.",
        });
      }
      loadCategories();
      onUpdate();
      setIsDialogOpen(false);
      setNewCategoryName("");
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?"))
      return;

    try {
      await api.deleteCategory(categoryId);
      toast({
        title: "Succès",
        description: "La catégorie a été supprimée.",
      });
      loadCategories();
      onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-end">
        <div className="w-full sm:w-auto space-y-1 sm:space-y-2 flex-1">
          <Label htmlFor="newCategoryName" className="text-xs sm:text-sm">
            Nom de la catégorie
          </Label>
          <Input
            id="newCategoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nom de la catégorie"
            className="text-xs sm:text-sm h-8 sm:h-9"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!newCategoryName.trim() || isLoading}
          className="w-full sm:w-auto mt-1 h-8 sm:h-9 text-xs sm:text-sm"
        >
          {isLoading ? <span>⏳</span> : "Ajouter"}
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                {editingCategory?.id === category.id ? (
                  <TableCell>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full text-xs sm:text-sm h-7 sm:h-8"
                      disabled={isLoading}
                    />
                  </TableCell>
                ) : (
                  <TableCell>{category.name}</TableCell>
                )}
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {editingCategory?.id === category.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isLoading || !newCategoryName.trim()}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          {isLoading ? <span>⏳</span> : "Enregistrer"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(null)}
                          disabled={isLoading}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          disabled={isLoading}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={isLoading}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          <span>🗑️</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>Aucune catégorie trouvée</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default CategoryManager;
