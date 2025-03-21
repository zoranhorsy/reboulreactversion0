import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface VariantManagerProps {
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
}

// Liste des tailles prédéfinies regroupées par catégories
const SIZES = {
    standard: ["XS", "S", "M", "L", "XL", "XXL"],
    italian: ["IT 38", "IT 40", "IT 42", "IT 44", "IT 46", "IT 48", "IT 50", "IT 52", "IT 54", "IT 56", "IT 58", "IT 60"],
    shoes: ["EU 35", "EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45", "EU 46", "EU 47", "EU 48"]
};

// Liste des couleurs prédéfinies
const COLORS = [
    "Noir", "Blanc", "Gris", "Bleu marine", "Bleu ciel", "Bleu", "Rouge", "Vert", "Jaune", "Orange", 
    "Rose", "Violet", "Marron", "Beige", "Crème", "Kaki", "Olive", "Turquoise", "Corail", "Bordeaux",
    "Camel", "Argenté", "Doré", "Bronze", "Lavande", "Menthe", "Sable", "Taupe", "Anthracite", "Indigo"
];

export function VariantManager({ variants, onChange }: VariantManagerProps) {
    const [newVariant, setNewVariant] = useState<Variant>({ size: '', color: '', stock: 0 });
    const [error, setError] = useState<string | null>(null);
    // États pour gérer les valeurs personnalisées
    const [customSize, setCustomSize] = useState<string>("");
    const [customColor, setCustomColor] = useState<string>("");
    const [isCustomSize, setIsCustomSize] = useState<boolean>(false);
    const [isCustomColor, setIsCustomColor] = useState<boolean>(false);

    const addVariant = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent form submission
        e.preventDefault();
        
        const finalSize = isCustomSize ? customSize : newVariant.size;
        const finalColor = isCustomColor ? customColor : newVariant.color;
        
        if (!finalSize) {
            setError("La taille est requise");
            return;
        }
        
        if (!finalColor) {
            setError("La couleur est requise");
            return;
        }
        
        onChange([...variants, { 
            size: finalSize, 
            color: finalColor, 
            stock: newVariant.stock 
        }]);
        
        setNewVariant({ size: '', color: '', stock: 0 });
        setCustomSize("");
        setCustomColor("");
        setIsCustomSize(false);
        setIsCustomColor(false);
        setError(null);
    };

    const removeVariant = (index: number) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        onChange(updatedVariants);
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        const updatedVariants = variants.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        );
        onChange(updatedVariants);
    };

    const handleSizeChange = (value: string) => {
        if (value === "custom") {
            setIsCustomSize(true);
        } else {
            setIsCustomSize(false);
            setNewVariant({ ...newVariant, size: value });
        }
    };

    const handleColorChange = (value: string) => {
        if (value === "custom") {
            setIsCustomColor(true);
        } else {
            setIsCustomColor(false);
            setNewVariant({ ...newVariant, color: value });
        }
    };

    return (
        <div className="space-y-4">
            {variants.length > 0 && (
                <div className="space-y-2">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-white/50 border border-border/40 rounded-lg shadow-sm">
                            <div className="w-1/3 sm:w-1/4">
                                <Select value={variant.size} onValueChange={(value) => updateVariant(index, 'size', value)}>
                                    <SelectTrigger className="border-input/40 h-8 sm:h-9 text-sm bg-white/50">
                                        <SelectValue placeholder="Taille" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tailles standards</SelectLabel>
                                            {SIZES.standard.map(size => (
                                                <SelectItem key={size} value={size}>{size}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                            <SelectLabel>Tailles italiennes (pantalons)</SelectLabel>
                                            {SIZES.italian.map(size => (
                                                <SelectItem key={size} value={size}>{size}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        
                                        <SelectGroup>
                                            <SelectLabel>Tailles de chaussures (EU)</SelectLabel>
                                            {SIZES.shoes.map(size => (
                                                <SelectItem key={size} value={size}>{size}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        
                                        {!SIZES.standard.includes(variant.size) && 
                                         !SIZES.italian.includes(variant.size) && 
                                         !SIZES.shoes.includes(variant.size) && 
                                         variant.size && (
                                            <SelectGroup>
                                                <SelectLabel>Valeur personnalisée</SelectLabel>
                                                <SelectItem value={variant.size}>{variant.size}</SelectItem>
                                            </SelectGroup>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-1/3 sm:w-1/4">
                                <Select value={variant.color} onValueChange={(value) => updateVariant(index, 'color', value)}>
                                    <SelectTrigger className="border-input/40 h-8 sm:h-9 text-sm bg-white/50">
                                        <SelectValue placeholder="Couleur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Couleurs standard</SelectLabel>
                                            {COLORS.map(color => (
                                                <SelectItem key={color} value={color}>{color}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        
                                        {!COLORS.includes(variant.color) && variant.color && (
                                            <SelectGroup>
                                                <SelectLabel>Valeur personnalisée</SelectLabel>
                                                <SelectItem value={variant.color}>{variant.color}</SelectItem>
                                            </SelectGroup>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-1/4 sm:w-1/6">
                                <Input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                    placeholder="Stock"
                                    className="border-input/40 h-8 sm:h-9 text-sm bg-white/50"
                                />
                            </div>
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                onClick={() => removeVariant(index)}
                                className="h-8 w-8 rounded-full flex-shrink-0"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="bg-white/40 rounded-lg border border-border/40 p-2 sm:p-3 shadow-sm">
                <h4 className="text-xs font-medium mb-2 text-muted-foreground">Ajouter un nouveau variant</h4>
                <div className="flex flex-wrap gap-2">
                    <div className="w-full sm:w-1/4">
                        <Label htmlFor="new-size" className="text-xs mb-1 block">Taille</Label>
                        {isCustomSize ? (
                            <div className="flex space-x-1">
                                <Input
                                    id="custom-size"
                                    value={customSize}
                                    onChange={(e) => setCustomSize(e.target.value)}
                                    placeholder="Taille personnalisée"
                                    className="border-input/40 h-8 sm:h-9 text-sm bg-white/50 w-3/4"
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsCustomSize(false)}
                                    className="h-8 sm:h-9 w-1/4"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <Select value={newVariant.size} onValueChange={handleSizeChange}>
                                <SelectTrigger className="border-input/40 h-8 sm:h-9 text-sm bg-white/50">
                                    <SelectValue placeholder="Sélectionner une taille" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tailles standards</SelectLabel>
                                        {SIZES.standard.map(size => (
                                            <SelectItem key={size} value={size}>{size}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                    
                                    <SelectGroup>
                                        <SelectLabel>Tailles italiennes (pantalons)</SelectLabel>
                                        {SIZES.italian.map(size => (
                                            <SelectItem key={size} value={size}>{size}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                    
                                    <SelectGroup>
                                        <SelectLabel>Tailles de chaussures (EU)</SelectLabel>
                                        {SIZES.shoes.map(size => (
                                            <SelectItem key={size} value={size}>{size}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                    
                                    <SelectItem value="custom">Autre (personnalisé)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="w-full sm:w-1/4">
                        <Label htmlFor="new-color" className="text-xs mb-1 block">Couleur</Label>
                        {isCustomColor ? (
                            <div className="flex space-x-1">
                                <Input
                                    id="custom-color"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    placeholder="Couleur personnalisée"
                                    className="border-input/40 h-8 sm:h-9 text-sm bg-white/50 w-3/4"
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsCustomColor(false)}
                                    className="h-8 sm:h-9 w-1/4"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <Select value={newVariant.color} onValueChange={handleColorChange}>
                                <SelectTrigger className="border-input/40 h-8 sm:h-9 text-sm bg-white/50">
                                    <SelectValue placeholder="Sélectionner une couleur" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Couleurs standard</SelectLabel>
                                        {COLORS.map(color => (
                                            <SelectItem key={color} value={color}>{color}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectItem value="custom">Autre (personnalisé)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="w-full sm:w-1/6">
                        <Label htmlFor="new-stock" className="text-xs mb-1 block">Stock</Label>
                        <Input
                            id="new-stock"
                            type="number"
                            value={newVariant.stock}
                            onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0})}
                            placeholder="Stock"
                            className="border-input/40 h-8 sm:h-9 text-sm bg-white/50"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex items-end">
                        <Button 
                            onClick={addVariant}
                            type="button"
                            className="h-8 sm:h-9 rounded-full bg-primary/90 hover:bg-primary"
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter
                        </Button>
                    </div>
                </div>
                
                {error && (
                    <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {error}
                    </div>
                )}
            </div>
            
            {variants.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                    Aucun variant ajouté
                </div>
            )}
        </div>
    );
}

