'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { api } from '@/lib/api'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Category {
  id: number;
  name: string;
}

interface CategoryManagerProps {
  onCategoryChange?: () => Promise<void>;
}

export function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await api.fetchCategories()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories. Utilisation des catégories par défaut.",
          variant: "destructive",
        })
        // Set default categories
        setCategories([
          { id: 1, name: 'Vêtements' },
          { id: 2, name: 'Chaussures' },
          { id: 3, name: 'Accessoires' },
        ])
      }
    }
    loadCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const newCategory = await api.createCategory(newCategoryName)
      setCategories([...categories, newCategory])
      setNewCategoryName('')
      toast({
        title: "Succès",
        description: "La catégorie a été ajoutée avec succès.",
      })
      if (onCategoryChange) await onCategoryChange()
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la catégorie. Ajout local uniquement.",
        variant: "destructive",
      })
      // Add category locally
      const newCategory = { id: Date.now(), name: newCategoryName }
      setCategories([...categories, newCategory])
      setNewCategoryName('')
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
    try {
      const updatedCategory = await api.updateCategory(editingCategory.id, editingCategory.name)
      setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c))
      setEditingCategory(null)
      toast({
        title: "Succès",
        description: "La catégorie a été mise à jour avec succès.",
      })
      if (onCategoryChange) await onCategoryChange()
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie sur le serveur. Mise à jour locale uniquement.",
        variant: "destructive",
      })
      // Update category locally
      setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c))
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await api.deleteCategory(id)
        setCategories(categories.filter(c => c.id !== id))
        toast({
          title: "Succès",
          description: "La catégorie a été supprimée avec succès.",
        })
      } catch (error) {
        console.error('Error deleting category:', error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la catégorie sur le serveur. Suppression locale uniquement.",
          variant: "destructive",
        })
        // Delete category locally
        setCategories(categories.filter(c => c.id !== id))
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gestion des Catégories</h2>
      <div className="flex space-x-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nouvelle catégorie"
        />
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
            {editingCategory?.id === category.id ? (
              <Input
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              />
            ) : (
              <span>{category.name}</span>
            )}
            <div>
              {editingCategory?.id === category.id ? (
                <Button onClick={handleUpdateCategory}>Sauvegarder</Button>
              ) : (
                <Button variant="ghost" onClick={() => setEditingCategory(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

