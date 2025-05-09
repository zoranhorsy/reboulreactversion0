"use client"

import React, { useState } from 'react'
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuLabel,
  MenuShortcut
} from '@/components/ui/menu'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  Copy,
  Download,
  Edit,
  Trash,
  Share,
  ShoppingBag,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  CreditCard,
  Mail,
} from 'lucide-react'

export function SimpleMenu() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu Simple</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              Actions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Télécharger
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Créer une copie
              <MenuShortcut>⌘C</MenuShortcut>
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Renommer
              <MenuShortcut>⌘R</MenuShortcut>
            </MenuItem>
            <MenuSeparator />
            <MenuItem className="flex items-center gap-2 text-red-500">
              <Trash className="h-4 w-4" />
              Supprimer
              <MenuShortcut>⌘⌫</MenuShortcut>
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  )
}

export function NestedMenu() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu avec Sous-menus</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              Catalogue
              <ChevronDown className="h-4 w-4" />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Nouveautés
            </MenuItem>
            <MenuSeparator />
            
            <MenuSub>
              <MenuSubTrigger className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Vêtements
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Homme</MenuItem>
                <MenuItem>Femme</MenuItem>
                <MenuItem>Enfant</MenuItem>
              </MenuSubContent>
            </MenuSub>
            
            <MenuSub>
              <MenuSubTrigger className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Accessoires
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Sacs</MenuItem>
                <MenuItem>Bijoux</MenuItem>
                <MenuItem>Chapeaux</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </div>
    </div>
  )
}

export function CheckboxMenu() {
  const [selections, setSelections] = useState({
    homme: false,
    femme: true,
    enfant: false,
  })
  
  const handleCheckedChange = (category) => {
    setSelections(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }
  
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu avec Cases à Cocher</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              Filtres
              <ChevronDown className="h-4 w-4" />
            </Button>
          </MenuTrigger>
          <MenuContent className="min-w-[200px]">
            <MenuLabel>Catégories</MenuLabel>
            <MenuCheckboxItem 
              checked={selections.homme}
              onCheckedChange={() => handleCheckedChange('homme')}
            >
              Homme
            </MenuCheckboxItem>
            <MenuCheckboxItem 
              checked={selections.femme}
              onCheckedChange={() => handleCheckedChange('femme')}
            >
              Femme
            </MenuCheckboxItem>
            <MenuCheckboxItem 
              checked={selections.enfant}
              onCheckedChange={() => handleCheckedChange('enfant')}
            >
              Enfant
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  )
}

export function RadioMenu() {
  const [paymentType, setPaymentType] = useState("card")
  
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu avec Options Radio</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger asChild>
            <Button variant="default" className="flex items-center gap-1">
              Paiement
              <ChevronDown className="h-4 w-4" />
            </Button>
          </MenuTrigger>
          <MenuContent className="min-w-[200px]">
            <MenuLabel>Type de paiement</MenuLabel>
            <MenuRadioGroup value={paymentType} onValueChange={setPaymentType}>
              <MenuRadioItem value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Carte bancaire
              </MenuRadioItem>
              <MenuRadioItem value="paypal" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                PayPal
              </MenuRadioItem>
              <MenuRadioItem value="bank" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Virement bancaire
              </MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  )
}

export function ProfileMenu() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu de Profil</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full border">
              <span className="sr-only">Menu de profil</span>
              <span className="font-semibold">RB</span>
            </Button>
          </MenuTrigger>
          <MenuContent align="end">
            <MenuLabel>Mon profil</MenuLabel>
            <MenuItem className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mon compte
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Mes commandes
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </MenuItem>
            <MenuSeparator />
            <MenuItem className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Support
            </MenuItem>
            <MenuSeparator />
            <MenuItem className="flex items-center gap-2 text-red-500">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  )
}

export default function RadixMenuExample() {
  return (
    <div className="space-y-12 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Exemples de Menus avec Radix UI + Tailwind</h1>
        <p className="text-muted-foreground">
          Démonstration des différents types de menus utilisant Radix UI et Tailwind CSS.
          Ces composants remplacent les menus de Chakra UI dans l&apos;application Reboul.
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <SimpleMenu />
        <NestedMenu />
        <CheckboxMenu />
        <RadioMenu />
        <ProfileMenu />
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Pour en savoir plus sur la migration des menus, consultez le guide
          <code className="px-1 py-0.5 bg-muted rounded text-xs ml-1">
            src/scripts/performance/menu-migration-guide.md
          </code>
        </p>
      </div>
    </div>
  )
} 