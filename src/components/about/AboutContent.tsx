"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Placeholder pour la future carte interactive
const boutiques = [
  {
    key: "reboul",
    label: "Reboul Marseille",
    adresse: "523 rue Paradis, 13008 Marseille",
    specialite: "Prêt-à-porter homme, femme, enfant. Boutique principale.",
    coords: { lat: 43.2781, lng: 5.3936 },
  },
  {
    key: "minots",
    label: "Les Minots de Reboul",
    adresse: "523 rue Paradis, 13008 Marseille",
    specialite: "Mode enfant haut de gamme. Grandes marques junior.",
    coords: { lat: 43.2781, lng: 5.3936 },
  },
  {
    key: "cpcompany",
    label: "C.P. Company Marseille",
    adresse: "376 avenue du Prado, 13008 Marseille",
    specialite: "Boutique officielle C.P. Company. Vêtements techniques.",
    coords: { lat: 43.2762, lng: 5.3907 },
  },
  {
    key: "cassis",
    label: "Reboul Concept Store Cassis",
    adresse: "7 avenue Victor Hugo, 13260 Cassis",
    specialite: "Sélection premium à Cassis.",
    coords: { lat: 43.2151, lng: 5.5392 },
  },
  {
    key: "hotel",
    label: "L’Hôtel By Reboul",
    adresse: "7 avenue Victor Hugo, 13260 Cassis",
    specialite: "Hôtel boutique, expérience Reboul.",
    coords: { lat: 43.2151, lng: 5.5392 },
  },
  {
    key: "utility",
    label: "Utility by Reboul",
    adresse: "5 rue Gaillard, 83110 Sanary-sur-mer",
    specialite: "Sélection utilitaire et lifestyle.",
    coords: { lat: 43.1182, lng: 5.8002 },
  },
];

// Carte OpenStreetMap en iframe
function BoutiqueMap({ selected }: { selected: string }) {
  const boutique = boutiques.find((b) => b.key === selected);
  if (!boutique) return null;
  const { lat, lng, label } = boutique.coords ? { ...boutique.coords, label: boutique.label } : { lat: 43.3, lng: 5.4, label: "" };
  // URL OpenStreetMap avec marqueur
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005}%2C${lat-0.003}%2C${lng+0.005}%2C${lat+0.003}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border">
      <iframe
        title={`Carte ${label}`}
        src={url}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
        allowFullScreen
      />
    </div>
  );
}

export function AboutContent() {
  const [selectedBoutique, setSelectedBoutique] = useState(boutiques[0].key);

  return (
    <div className="container mx-auto py-16 space-y-24">
      {/* En-tête / Introduction */}
      <div className="text-center space-y-6 px-4 sm:px-6 md:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em]">
          À propos de Reboul
        </h1>
        <div className="w-16 sm:w-20 md:w-24 h-px bg-primary mx-auto" />
        <h2 className="text-lg sm:text-xl font-medium mt-2 mb-2">Concept store haut de gamme à Marseille</h2>
        <p className="font-geist text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-full sm:max-w-xl md:max-w-2xl mx-auto px-0 sm:px-2">
          Reboul est un concept store marseillais spécialisé dans la mode premium et les marques de créateurs. Situé en plein cœur de Marseille, Reboul sélectionne les meilleures marques de prêt-à-porter homme, femme et enfant, avec une attention particulière portée à la qualité, l’innovation textile et le style contemporain. Marques emblématiques, pièces iconiques, collections exclusives : Reboul est devenu une référence pour les passionnés de mode à Marseille, mais aussi au-delà grâce à son site e-commerce.
        </p>
      </div>

      {/* Section Reboul Marseille */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[3/2] rounded-xl overflow-hidden">
          {/* Image boutique principale */}
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-400">Image Reboul Marseille</span>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-medium">Reboul Marseille</h2>
          <p className="text-muted-foreground">
            Boutique emblématique située au cœur de Marseille, Reboul propose une sélection pointue de prêt-à-porter homme, femme et enfant. Chaque pièce est choisie pour sa qualité, son innovation textile et son style contemporain. Notre équipe met un point d’honneur à offrir un conseil personnalisé et une expérience d’achat unique, en boutique comme en ligne sur notre site e-commerce.
          </p>
        </div>
      </div>

      {/* Section Les Minots de Reboul */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[3/2] rounded-xl overflow-hidden">
          {/* Image Minots */}
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-400">Image Les Minots</span>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-medium">Les Minots de Reboul</h2>
          <p className="text-muted-foreground">
            À quelques mètres de la boutique principale, Les Minots de Reboul est un espace entièrement dédié à la mode enfant haut de gamme. Vous y retrouverez les plus grandes marques junior : Stone Island, Off-White, Givenchy, Golden Goose, Autry, Chloé, C.P. Company, Herno, Marni et bien d’autres. Chaque pièce est sélectionnée avec soin pour offrir aux plus jeunes un vestiaire à la fois tendance, confortable et durable.
          </p>
        </div>
      </div>

      {/* Section C.P. Company Marseille */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[3/2] rounded-xl overflow-hidden">
          {/* Image CP Company */}
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-400">Image C.P. Company</span>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-medium">C.P. Company Marseille</h2>
          <p className="text-muted-foreground">
            Reboul est fier d’accueillir à Marseille une boutique officielle dédiée à C.P. Company, marque italienne culte de vêtements techniques. Dans cet espace exclusif, les passionnés retrouvent les dernières collections, les pièces iconiques – goggles, vestes, cargos – et toute l’esthétique urbaine de la marque fondée par Massimo Osti.
          </p>
        </div>
      </div>

      {/* Section Nos Boutiques avec carte interactive */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-light uppercase tracking-[0.3em]">
            Nos Boutiques
          </h2>
          <div className="w-24 h-px bg-primary mx-auto" />
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Boutons boutiques : scroll horizontal sur mobile */}
          <div className="flex md:flex-col gap-2 w-full md:w-56 overflow-x-auto md:overflow-visible flex-nowrap md:flex-wrap pb-2 md:pb-0 -mx-2 md:mx-0">
            {boutiques.map((b) => (
              <Button
                key={b.key}
                variant={selectedBoutique === b.key ? "default" : "outline"}
                onClick={() => setSelectedBoutique(b.key)}
                className="w-auto min-w-[160px] flex-shrink-0 md:w-full md:min-w-0 px-3 py-2 text-xs sm:text-sm md:text-base whitespace-normal text-center mx-2 md:mx-0"
              >
                {b.label}
              </Button>
            ))}
          </div>
          {/* Carte + fiche */}
          <div className="flex-1 w-full space-y-4 min-w-0">
            <div className="w-full h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden border bg-white dark:bg-zinc-900">
              <BoutiqueMap selected={boutiques.find((b) => b.key === selectedBoutique)?.key || ""} />
            </div>
            <Card className="w-full max-w-full">
              <CardContent className="p-4 sm:p-6 space-y-2">
                <h3 className="text-lg sm:text-xl font-medium">
                  {boutiques.find((b) => b.key === selectedBoutique)?.label}
                </h3>
                <div className="text-muted-foreground text-sm sm:text-base">
                  {boutiques.find((b) => b.key === selectedBoutique)?.adresse}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  {boutiques.find((b) => b.key === selectedBoutique)?.specialite}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Section Pourquoi choisir Reboul ? */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-light uppercase tracking-[0.3em]">
            Pourquoi choisir Reboul ?
          </h2>
          <div className="w-24 h-px bg-primary mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-2">Sélection pointue de marques de luxe et streetwear</h3>
              <p className="text-muted-foreground">Un choix exigeant des plus grandes marques et des collections les plus recherchées, pour une offre toujours à la pointe.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-2">Conseil personnalisé en boutique</h3>
              <p className="text-muted-foreground">Une équipe passionnée à votre écoute pour vous accompagner et vous conseiller selon vos envies et votre style.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-2">Expérience d’achat unique</h3>
              <p className="text-muted-foreground">Un univers où héritage, modernité et culture urbaine se rencontrent pour une expérience shopping inoubliable.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-2">Pièces exclusives et collections limitées</h3>
              <p className="text-muted-foreground">Accès à des exclusivités, des éditions limitées et des pièces rares, disponibles en boutique et en ligne.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Conclusion / Lifestyle */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-medium">Reboul, bien plus qu’un magasin de vêtements</h2>
        <p className="text-muted-foreground">
          Reboul, c’est un lifestyle store marseillais qui incarne une vision contemporaine de la mode : entre techwear, luxe discret, culture urbaine et héritage européen. Notre communauté fidèle et nos clients passionnés partagent un même mot d’ordre : l’élégance sans compromis.
        </p>
      </div>
    </div>
  );
}
