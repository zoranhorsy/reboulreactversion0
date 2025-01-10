'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { api } from '@/lib/api'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Brand {
  id: number;
  name: string;
}

export function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [newBrandName, setNewBrandName] = useState('')
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const fetchedBrands = await api.fetchBrands()
      setBrands(fetchedBrands)
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les marques. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return
    try {
      const newBrand = await api.createBrand(newBrandName)
      setBrands([...brands, newBrand])
      setNewBrandName('')
      toast({
        title: "Succès",
        description: "La marque a été ajoutée avec succès.",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la marque. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBrand = async () => {
    if (!editingBrand) return
    try {
      const updatedBrand = await api.updateBrand(editingBrand.id, editingBrand.name)
      setBrands(brands.map(b => b.id === updatedBrand.id ? updatedBrand : b))
      setEditingBrand(null)
      toast({
        title: "Succès",
        description: "La marque a été mise à jour avec succès.",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la marque. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBrand = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette marque ?")) {
      try {
        await api.deleteBrand(id)
        setBrands(brands.filter(b => b.id !== id))
        toast({
          title: "Succès",
          description: "La marque a été supprimée avec succès.",
        })
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la marque. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gestion des Marques</h2>
      <div className="flex space-x-2">
        <Input
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          placeholder="Nouvelle marque"
        />
        <Button onClick={handleAddBrand}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>
      <ul className="space-y-2">
        {brands.map((brand) => (
          <li key={brand.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
            {editingBrand?.id === brand.id ? (
              <Input
                value={editingBrand.name}
                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
              />
            ) : (
              <span>{brand.name}</span>
            )}
            <div>
              {editingBrand?.id === brand.id ? (
                <Button onClick={handleUpdateBrand}>Sauvegarder</Button>
              ) : (
                <Button variant="ghost" onClick={() => setEditingBrand(brand)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" onClick={() => handleDeleteBrand(brand.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
