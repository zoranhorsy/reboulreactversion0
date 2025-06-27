"use client";

import React, { useState } from "react";
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
  MenuShortcut,
} from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

export function SimpleMenu() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu Simple</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger>
            <Button variant="default" className="flex items-center gap-1">
              Actions
              <span>↓</span>
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem className="flex items-center gap-2">
              <span>Download</span>
              Télécharger
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <span>Copy</span>
              Créer une copie
              <MenuShortcut>⌘C</MenuShortcut>
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <span>✏️</span>
              Renommer
              <MenuShortcut>⌘R</MenuShortcut>
            </MenuItem>
            <MenuSeparator />
            <MenuItem className="flex items-center gap-2 text-red-500">
              <span>Trash</span>
              Supprimer
              <MenuShortcut>⌘⌫</MenuShortcut>
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

export function NestedMenu() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu avec Sous-menus</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger>
            <Button variant="default" className="flex items-center gap-1">
              Catalogue
              <span>↓</span>
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem className="flex items-center gap-2">
              <span>🛍️</span>
              Nouveautés
            </MenuItem>
            <MenuSeparator />

            <MenuSub>
              <MenuSubTrigger>
                <span>🛒</span>
                Vêtements
              </MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Homme</MenuItem>
                <MenuItem>Femme</MenuItem>
                <MenuItem>Enfant</MenuItem>
              </MenuSubContent>
            </MenuSub>

            <MenuSub>
              <MenuSubTrigger>
                <span>Users</span>
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
  );
}

export function CheckboxMenu() {
  const [selections, setSelections] = useState({
    homme: false,
    femme: true,
    enfant: false,
  });

  const handleCheckedChange = (category) => {
    setSelections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu avec Cases à Cocher</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger>
            <Button variant="default" className="flex items-center gap-1">
              Filtres
              <span>↓</span>
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuLabel>Catégories</MenuLabel>
            <MenuCheckboxItem
              checked={selections.homme}
              onCheckedChange={() => handleCheckedChange("homme")}
            >
              Homme
            </MenuCheckboxItem>
            <MenuCheckboxItem
              checked={selections.femme}
              onCheckedChange={() => handleCheckedChange("femme")}
            >
              Femme
            </MenuCheckboxItem>
            <MenuCheckboxItem
              checked={selections.enfant}
              onCheckedChange={() => handleCheckedChange("enfant")}
            >
              Enfant
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

export function RadioMenu() {
  const [paymentType, setPaymentType] = useState("card");

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu avec Options Radio</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger>
            <Button variant="default" className="flex items-center gap-1">
              Paiement
              <span>↓</span>
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuLabel>Type de paiement</MenuLabel>
            <MenuRadioGroup value={paymentType} onValueChange={setPaymentType}>
              <MenuRadioItem value="card">
                <span>CreditCard</span>
                Carte bancaire
              </MenuRadioItem>
              <MenuRadioItem value="paypal">
                <span>Share</span>
                PayPal
              </MenuRadioItem>
              <MenuRadioItem value="transfer">
                <span>Settings</span>
                Virement bancaire
              </MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

export function ProfileMenu() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold">Menu de Profil</h2>
      <div className="flex gap-4">
        <Menu>
          <MenuTrigger>
            <Button variant="ghost" className="h-8 w-8 rounded-full border">
              <span className="sr-only">Menu de profil</span>
              <span className="font-semibold">RB</span>
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuLabel>Mon profil</MenuLabel>
            <MenuItem className="flex items-center gap-2">
              <span>Users</span>
              Mon compte
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <span>🛍️</span>
              Mes commandes
            </MenuItem>
            <MenuItem className="flex items-center gap-2">
              <span>Settings</span>
              Paramètres
            </MenuItem>
            <MenuSeparator />
            <MenuItem className="flex items-center gap-2">
              <span>📧</span>
              Support
            </MenuItem>
            <MenuSeparator />
            <MenuItem className="flex items-center gap-2 text-red-500">
              <span>LogOut</span>
              Déconnexion
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

export default function RadixMenuExample() {
  return (
    <div className="space-y-12 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Exemples de Menus avec Radix UI + Tailwind
        </h1>
        <p className="text-muted-foreground">
          Démonstration des différents types de menus utilisant Radix UI et
          Tailwind CSS. Ces composants remplacent les menus de Chakra UI dans
          l&apos;application Reboul.
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
        <h3 className="text-lg font-semibold mb-2">Notes de Migration</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Remplacement de ChakraUI Menu par Radix UI Menu</li>
          <li>• Conservation des animations Framer Motion</li>
          <li>• Amélioration de l&apos;accessibilité avec Radix UI</li>
          <li>• Styles personnalisés avec Tailwind CSS</li>
        </ul>
      </div>
    </div>
  );
}
