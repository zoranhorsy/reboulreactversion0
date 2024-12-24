import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from 'lucide-react';

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface VariantManagerProps {
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
    const [newVariant, setNewVariant] = useState<Variant>({ size: '', color: '', stock: 0 });

    const addVariant = () => {
        if (newVariant.size && newVariant.color) {
            onChange([...variants, newVariant]);
            setNewVariant({ size: '', color: '', stock: 0 });
        }
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

    return (
        <div className="space-y-4">
            {variants.map((variant, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
                    <Input
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        placeholder="Taille"
                        className="w-1/4"
                    />
                    <Input
                        value={variant.color}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        placeholder="Couleur"
                        className="w-1/4"
                    />
                    <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                        placeholder="Stock"
                        className="w-1/4"
                    />
                    <Button variant="destructive" size="icon" onClick={() => removeVariant(index)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <div className="flex items-end space-x-2">
                <div className="space-y-2 w-1/4">
                    <Label htmlFor="new-size">Taille</Label>
                    <Input
                        id="new-size"
                        value={newVariant.size}
                        onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                        placeholder="Taille"
                    />
                </div>
                <div className="space-y-2 w-1/4">
                    <Label htmlFor="new-color">Couleur</Label>
                    <Input
                        id="new-color"
                        value={newVariant.color}
                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                        placeholder="Couleur"
                    />
                </div>
                <div className="space-y-2 w-1/4">
                    <Label htmlFor="new-stock">Stock</Label>
                    <Input
                        id="new-stock"
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                        placeholder="Stock"
                    />
                </div>
                <Button onClick={addVariant}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            </div>
        </div>
    );
}

