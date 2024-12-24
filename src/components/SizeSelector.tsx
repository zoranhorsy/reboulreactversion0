import React from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SizeSelectorProps {
    availableSizes: string[]
    selectedSize: string
    onSizeChange: (size: string) => void
    sizeStock: Record<string, number>
}

export function SizeSelector({ availableSizes, selectedSize, onSizeChange, sizeStock }: SizeSelectorProps) {
    return (
        <div>
            <Label htmlFor="size-selector" className="text-sm font-medium mb-2 block">Taille</Label>
            <RadioGroup
                id="size-selector"
                value={selectedSize}
                onValueChange={onSizeChange}
                className="flex flex-wrap gap-2"
            >
                {availableSizes.map((size) => {
                    const isOutOfStock = sizeStock[size] === 0;
                    return (
                        <TooltipProvider key={size}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioGroupItem
                                            value={size}
                                            id={`size-${size}`}
                                            className="peer sr-only"
                                            disabled={isOutOfStock}
                                        />
                                        <Label
                                            htmlFor={`size-${size}`}
                                            className={`flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md cursor-pointer 
                                                ${isOutOfStock
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'peer-checked:bg-primary peer-checked:text-primary-foreground hover:bg-muted'}
                                                relative`}
                                        >
                                            {size}
                                            {isOutOfStock && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    <span className="w-full h-0.5 bg-gray-400 rotate-45 transform origin-center"></span>
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isOutOfStock ? 'Rupture de stock' : `En stock: ${sizeStock[size]}`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </RadioGroup>
        </div>
    )
}

