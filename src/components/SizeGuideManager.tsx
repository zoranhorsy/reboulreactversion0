import React from "react";
import { SizeGuide } from "@/components/SizeGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { SizeChart } from "@/lib/types/product";
import Image from "next/image";

// Types pour les tableaux de tailles statiques par catégorie
interface SneakerSizeChart {
  eu: string;
  us: string;
  uk: string;
  cm: string;
  inches: string;
}

interface KidsSizeChart {
  age: string;
  height: string;
  chest: string;
  waist: string;
}

// Tableau de tailles pour les chaussures (si non fourni par le produit)
const defaultSneakerSizes: SneakerSizeChart[] = [
  { eu: "35", us: "3.5", uk: "3", cm: "22", inches: "8.7" },
  { eu: "36", us: "4", uk: "3.5", cm: "22.5", inches: "8.9" },
  { eu: "37", us: "5", uk: "4", cm: "23.5", inches: "9.3" },
  { eu: "38", us: "6", uk: "5", cm: "24", inches: "9.5" },
  { eu: "39", us: "6.5", uk: "6", cm: "25", inches: "9.8" },
  { eu: "40", us: "7", uk: "6.5", cm: "25.5", inches: "10" },
  { eu: "41", us: "8", uk: "7", cm: "26", inches: "10.2" },
  { eu: "42", us: "8.5", uk: "8", cm: "27", inches: "10.6" },
  { eu: "43", us: "9.5", uk: "9", cm: "27.5", inches: "10.8" },
  { eu: "44", us: "10", uk: "9.5", cm: "28.5", inches: "11.2" },
  { eu: "45", us: "11", uk: "10.5", cm: "29", inches: "11.4" },
  { eu: "46", us: "12", uk: "11", cm: "30", inches: "11.8" },
];

// Tableau de tailles pour enfants (si non fourni par le produit)
const defaultKidsSizes: KidsSizeChart[] = [
  { age: "2-3 ans", height: "92-98", chest: "53-54", waist: "50-51" },
  { age: "4-5 ans", height: "104-110", chest: "55-57", waist: "51-53" },
  { age: "6-7 ans", height: "116-122", chest: "59-61", waist: "54-55" },
  { age: "8-9 ans", height: "128-134", chest: "63-66", waist: "56-59" },
  { age: "10-11 ans", height: "140-146", chest: "69-71", waist: "60-62" },
  { age: "12-13 ans", height: "152-158", chest: "75-78", waist: "63-66" },
];

// Tableau de tailles pour adultes (si non fourni par le produit)
const defaultAdultSizes: SizeChart[] = [
  { size: "XS", chest: 88, waist: 72, hips: 94 },
  { size: "S", chest: 92, waist: 76, hips: 98 },
  { size: "M", chest: 96, waist: 80, hips: 102 },
  { size: "L", chest: 100, waist: 84, hips: 106 },
  { size: "XL", chest: 104, waist: 88, hips: 110 },
  { size: "XXL", chest: 108, waist: 92, hips: 114 },
];

// Convertir tailles enfants au format standard
const convertKidsSizesToStandard = (
  kidsSizes: KidsSizeChart[],
): SizeChart[] => {
  return kidsSizes.map((size) => ({
    size: size.age,
    chest: parseInt(size.chest.split("-")[0]),
    waist: parseInt(size.waist.split("-")[0]),
    hips: 0, // Non applicable pour les enfants
  }));
};

interface SizeGuideManagerProps {
  productSizeChart?: SizeChart[];
  storeType:
    | "adult"
    | "kids"
    | "sneakers"
    | "cpcompany"
    | "deleted"
    | undefined;
  availableSizes?: string[];
}

export function SizeGuideManager({
  productSizeChart,
  storeType,
  availableSizes = [],
}: SizeGuideManagerProps) {
  // Détermine quel tableau utiliser
  const useSizeChart =
    productSizeChart && productSizeChart.length > 0
      ? productSizeChart
      : storeType === "adult" || storeType === "cpcompany"
        ? defaultAdultSizes
        : storeType === "kids"
          ? convertKidsSizesToStandard(defaultKidsSizes)
          : defaultAdultSizes;

  // Filtre pour montrer uniquement les tailles disponibles si nécessaire
  const filteredSizeChart =
    availableSizes && availableSizes.length > 0
      ? useSizeChart.filter((item) => availableSizes.includes(item.size))
      : useSizeChart;

  // Guide pour les chaussures (sneakers)
  if (storeType === "sneakers") {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">Guide visuel</TabsTrigger>
            <TabsTrigger value="conversion">Tableau de conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <div className="flex justify-center">
              <Image
                src="/images/size-guide/sneakers-guide.svg"
                alt="Guide de pointure"
                width={400}
                height={200}
                className="max-w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/400x200?text=Guide+Chaussures";
                }}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                Comment mesurer votre pied :
              </h4>
              <ol className="text-sm space-y-2 list-decimal pl-5">
                <li>Placez une feuille de papier sur le sol contre un mur.</li>
                <li>
                  Tenez-vous debout sur la feuille, le talon contre le mur.
                </li>
                <li>
                  Tracez le contour de votre pied ou marquez sa longueur
                  maximale.
                </li>
                <li>
                  Mesurez la distance entre le mur et la marque la plus
                  éloignée.
                </li>
                <li>
                  Consultez le tableau ci-dessous pour trouver votre pointure.
                </li>
              </ol>

              <p className="text-sm text-muted-foreground mt-2">
                Nous recommandons de mesurer vos pieds en fin de journée,
                lorsqu&apos;ils sont le plus dilatés.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-600">
              <span>ℹ️</span>
              Nos pointures sont basées sur les standards européens (EU).
              Utilisez le tableau de conversion pour les autres systèmes.
            </div>
          </TabsContent>

          <TabsContent value="conversion">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      EU
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      US
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      UK
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      CM
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      POUCES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {defaultSneakerSizes.map((size, index) => {
                    const isAvailable =
                      !availableSizes.length ||
                      availableSizes.includes(size.eu);
                    return (
                      <tr
                        key={index}
                        className={`border-b ${!isAvailable ? "opacity-50" : ""} ${
                          isAvailable && "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-2 text-xs font-medium">
                          {size.eu}
                        </td>
                        <td className="py-2 px-2 text-xs">{size.us}</td>
                        <td className="py-2 px-2 text-xs">{size.uk}</td>
                        <td className="py-2 px-2 text-xs">{size.cm}</td>
                        <td className="py-2 px-2 text-xs">{size.inches}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Card className="p-3">
              <h4 className="text-xs font-medium mb-2">
                Conseils pour le choix de la pointure :
              </h4>
              <ul className="text-xs space-y-1 list-disc pl-5">
                <li>Si vous êtes entre deux tailles, prenez la plus grande.</li>
                <li>
                  Les personnes ayant un pied large devraient prendre une
                  demi-pointure au-dessus.
                </li>
                <li>
                  Pour les chaussures de sport, un petit espace (5-10mm) est
                  recommandé au bout.
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Guide pour les enfants
  else if (storeType === "kids") {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">Guide visuel</TabsTrigger>
            <TabsTrigger value="calculateur">Calculateur</TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <div className="flex justify-center">
              <Image
                src="/images/size-guide/kids-silhouette.svg"
                alt="Mesures enfant"
                width={400}
                height={300}
                className="max-w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/400x300?text=Guide+Enfants";
                }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      ÂGE
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      HAUTEUR (cm)
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      POITRINE (cm)
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium">
                      TAILLE (cm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {defaultKidsSizes.map((size, index) => {
                    const isAvailable =
                      !availableSizes.length ||
                      availableSizes.includes(size.age);
                    return (
                      <tr
                        key={index}
                        className={`border-b ${!isAvailable ? "opacity-50" : ""} ${
                          isAvailable && "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-2 text-xs font-medium">
                          {size.age}
                        </td>
                        <td className="py-2 px-2 text-xs">{size.height}</td>
                        <td className="py-2 px-2 text-xs">{size.chest}</td>
                        <td className="py-2 px-2 text-xs">{size.waist}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-600">
              <span>ℹ️</span>
              Ces indications sont données à titre indicatif et peuvent varier
              selon la morphologie de l&apos;enfant.
            </div>
          </TabsContent>

          <TabsContent value="calculateur">
            {/* Calculateur content */}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Guide pour les adultes (et par défaut)
  else {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">Guide visuel</TabsTrigger>
            <TabsTrigger value="calculateur">Calculateur</TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <div className="flex justify-center">
              <Image
                src="/images/size-guide/adult-silhouette.svg"
                alt="Mesures adulte"
                width={400}
                height={300}
                className="max-w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/400x300?text=Guide+Adultes";
                }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left text-xs font-medium">
                      TAILLE
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium">
                      POITRINE (cm)
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium">
                      TAILLE (cm)
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium">
                      HANCHES (cm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {defaultAdultSizes.map((size, index) => {
                    const isAvailable =
                      !availableSizes.length ||
                      availableSizes.includes(size.size);
                    return (
                      <tr
                        key={index}
                        className={`border-b ${!isAvailable ? "opacity-50" : ""} ${
                          isAvailable && "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-3 text-xs font-medium">
                          {size.size}
                        </td>
                        <td className="py-2 px-3 text-xs">{size.chest}</td>
                        <td className="py-2 px-3 text-xs">{size.waist}</td>
                        <td className="py-2 px-3 text-xs">{size.hips}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-600">
              <span>ℹ️</span>
              Ces informations sont données à titre indicatif. Pour un
              ajustement parfait, consultez les mesures spécifiques de chaque
              produit.
            </div>
          </TabsContent>

          <TabsContent value="calculateur">
            {/* Calculateur content */}
          </TabsContent>
        </Tabs>
      </div>
    );
  }
}
