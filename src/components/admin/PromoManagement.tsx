"use client"

import { useState } from 'react'
import { usePromo } from '@/app/contexts/PromoContext'
import { PromoCode, PromoCodeType } from '@/types/promo'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Plus, Edit2, Check, X, Calendar, Users, Package } from "lucide-react"
import { format } from 'date-fns/format'
import { fr } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Mock des catégories et produits pour l'exemple
const MOCK_CATEGORIES = [
  { id: "vetements", name: "Vêtements" },
  { id: "accessoires", name: "Accessoires" },
  { id: "chaussures", name: "Chaussures" },
]

const MOCK_PRODUCTS = [
  { id: "tshirt", name: "T-shirt" },
  { id: "jean", name: "Jean" },
  { id: "sneakers", name: "Sneakers" },
]

interface Promo {
    id?: number;
    code: string;
    discount: number;
    startDate: Date | null;
    endDate: Date | null;
    usageLimit: number | null;
    status: 'active' | 'inactive';
    applicableCategories: string[];
    applicableProducts: string[];
}

export function PromoManagement() {
  const { promoCodes, addPromoCode, removePromoCodeFromList } = usePromo()
  const { toast } = useToast()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [newPromo, setNewPromo] = useState<Promo>({
    code: '',
    discount: 0,
    startDate: null,
    endDate: null,
    usageLimit: null,
    status: 'active',
    applicableCategories: [],
    applicableProducts: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPromo.code || !newPromo.discount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const promo: PromoCode = {
      code: newPromo.code.toUpperCase(),
      type: 'percentage',
      value: newPromo.discount,
      description: `Réduction de ${newPromo.discount}%`,
      isActive: newPromo.status === 'active',
      usageLimit: newPromo.usageLimit || 0,
      currentUsage: 0,
      applicableCategories: newPromo.applicableCategories || [],
      applicableProducts: newPromo.applicableProducts || []
    }

    if (editingCode) {
      removePromoCodeFromList(editingCode)
      addPromoCode(promo)
      toast({
        title: "Code promo mis à jour",
        description: "Le code promo a été modifié avec succès",
      })
    } else {
      addPromoCode(promo)
      toast({
        title: "Code promo ajouté",
        description: "Le nouveau code promo a été ajouté avec succès",
      })
    }

    setIsAddingNew(false)
    setEditingCode(null)
    setNewPromo({
      code: '',
      discount: 0,
      startDate: null,
      endDate: null,
      usageLimit: null,
      status: 'active',
      applicableCategories: [],
      applicableProducts: []
    })
  }

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code.code)
    setNewPromo({
      code: code.code,
      discount: code.value,
      startDate: null,
      endDate: null,
      usageLimit: code.usageLimit ?? null,
      status: code.isActive ? 'active' : 'inactive',
      applicableCategories: code.applicableCategories || [],
      applicableProducts: code.applicableProducts || []
    })
    setIsAddingNew(true)
  }

  const handleDelete = (code: string) => {
    removePromoCodeFromList(code)
    toast({
      title: "Code promo supprimé",
      description: "Le code promo a été supprimé avec succès",
    })
  }

  const toggleCategory = (categoryId: string) => {
    setNewPromo(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(categoryId)
        ? prev.applicableCategories.filter(id => id !== categoryId)
        : [...prev.applicableCategories, categoryId]
    }))
  }

  const toggleProduct = (productId: string) => {
    setNewPromo(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter(id => id !== productId)
        : [...prev.applicableProducts, productId]
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <CardTitle className="text-base sm:text-lg">Gestion des codes promos</CardTitle>
        <Button 
          size="sm" 
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau code
        </Button>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {isAddingNew && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6 border-b sm:border sm:rounded-lg mb-4 sm:mb-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code promo</Label>
                <Input
                  id="code"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                  placeholder="WELCOME10"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Montant de la réduction</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newPromo.discount}
                  onChange={(e) => setNewPromo({ ...newPromo, discount: Number(e.target.value) })}
                  placeholder="10"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newPromo.startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newPromo.startDate ? format(new Date(newPromo.startDate), "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newPromo.startDate || undefined}
                    onSelect={(date) => setNewPromo({ ...newPromo, startDate: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newPromo.endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newPromo.endDate ? format(new Date(newPromo.endDate), "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newPromo.endDate || undefined}
                    onSelect={(date) => setNewPromo({ ...newPromo, endDate: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Limite d&apos;utilisation</Label>
              <Input
                id="usageLimit"
                type="number"
                value={newPromo.usageLimit || ''}
                onChange={(e) => setNewPromo({ ...newPromo, usageLimit: Number(e.target.value) })}
                placeholder="0 pour illimité"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Catégories applicables</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_CATEGORIES.map((category) => (
                  <Badge
                    key={category.id}
                    variant={newPromo.applicableCategories?.includes(category.id) ? "default" : "outline"}
                    className="cursor-pointer text-xs sm:text-sm"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Produits applicables</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_PRODUCTS.map((product) => (
                  <Badge
                    key={product.id}
                    variant={newPromo.applicableProducts?.includes(product.id) ? "default" : "outline"}
                    className="cursor-pointer text-xs sm:text-sm"
                    onClick={() => toggleProduct(product.id)}
                  >
                    {product.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={newPromo.status === 'active'}
                onCheckedChange={(checked) => setNewPromo({ ...newPromo, status: checked ? 'active' : 'inactive' })}
              />
              <Label htmlFor="status" className="text-sm">Code promo actif</Label>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false)
                  setEditingCode(null)
                  setNewPromo({
                    code: '',
                    discount: 0,
                    startDate: null,
                    endDate: null,
                    usageLimit: null,
                    status: 'active',
                    applicableCategories: [],
                    applicableProducts: []
                  })
                }}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Check className="h-4 w-4 mr-2" />
                {editingCode ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-0">
          {promoCodes.map((promo) => (
            <Card key={promo.code} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">{promo.code}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {promo.value}% de réduction
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    promo.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {promo.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">Période</p>
                  <p className="font-medium">
                    {promo.startDate && format(new Date(promo.startDate), "d MMM", { locale: fr })}
                    {promo.endDate && ` - ${format(new Date(promo.endDate), "d MMM", { locale: fr })}`}
                  </p>
                </div>

                {(promo.applicableCategories || []).length > 0 && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Catégories</p>
                    <div className="flex flex-wrap gap-1">
                      {(promo.applicableCategories || []).map(categoryId => {
                        const category = MOCK_CATEGORIES.find(c => c.id === categoryId)
                        return category && (
                          <Badge key={category.id} variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {(promo.applicableProducts || []).length > 0 && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Produits</p>
                    <div className="flex flex-wrap gap-1">
                      {(promo.applicableProducts || []).map(productId => {
                        const product = MOCK_PRODUCTS.find(p => p.id === productId)
                        return product && (
                          <Badge key={product.id} variant="secondary" className="text-xs">
                            {product.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(promo)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(promo.code)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 