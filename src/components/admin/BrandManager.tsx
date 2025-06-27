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
import Image from "next/image";

interface Brand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  products_count?: number;
}

interface BrandManagerProps {
  onUpdate: () => void;
}

export function BrandManager({ onUpdate }: BrandManagerProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo: null as File | null,
    description: "",
  });
  const { toast } = useToast();

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.fetchBrands();
      setBrands(response);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les marques.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingBrand) {
        await api.updateBrand(editingBrand.id, formData);
        toast({
          title: "Succès",
          description: "La marque a été mise à jour.",
        });
      } else {
        await api.createBrand(formData);
        toast({
          title: "Succès",
          description: "La marque a été créée.",
        });
      }
      loadBrands();
      onUpdate();
      setIsDialogOpen(false);
      setFormData({
        name: "",
        logo: null,
        description: "",
      });
      setEditingBrand(null);
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

  const handleDelete = async (brandId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette marque ?")) return;

    try {
      await api.deleteBrand(brandId);
      toast({
        title: "Succès",
        description: "La marque a été supprimée.",
      });
      loadBrands();
      onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la marque.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: null,
      description: brand.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      logo: null,
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-end">
        <div className="w-full sm:w-auto space-y-1 sm:space-y-2 flex-1">
          <Label htmlFor="newBrandName" className="text-xs sm:text-sm">
            Nom de la marque
          </Label>
          <Input
            id="newBrandName"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nom de la marque"
            className="text-xs sm:text-sm h-8 sm:h-9"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!formData.name.trim() || isLoading}
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
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                {editingBrand && editingBrand.id === brand.id ? (
                  <TableCell>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full text-xs sm:text-sm h-7 sm:h-8"
                      disabled={isLoading}
                    />
                  </TableCell>
                ) : (
                  <TableCell>{brand.name}</TableCell>
                )}
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {editingBrand && editingBrand.id === brand.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isLoading || !formData.name.trim()}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          {isLoading ? <span>⏳</span> : "Enregistrer"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBrand(null)}
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
                          onClick={() => handleEdit(brand)}
                          disabled={isLoading}
                          className="h-7 sm:h-8 text-[10px] sm:text-xs"
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
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
            {brands.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>Aucune marque trouvée</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default BrandManager;
