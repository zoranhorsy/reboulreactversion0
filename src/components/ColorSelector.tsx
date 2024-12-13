import React from 'react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { productColors, getColorValue } from '@/config/productColors'

interface ColorSelectorProps {
    availableColors: string[]
    selectedColor: string
    onColorChange: (color: string) => void
}

export function ColorSelector({ availableColors, selectedColor, onColorChange }: ColorSelectorProps) {
    return (
        <div className="flex flex-wrap gap-4">
            {availableColors.map((colorName, index) => {
                const colorValue = getColorValue(colorName);
                return (
                    <motion.button
                        key={colorName}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => onColorChange(colorName)}
                        className={cn(
                            "w-8 h-8 rounded-full transition-all duration-300",
                            selectedColor === colorName ? "ring-2 ring-offset-2 ring-black" : "ring-1 ring-gray-300 hover:ring-gray-400"
                        )}
                        style={{ backgroundColor: colorValue }}
                        title={colorName}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    />
                );
            })}
        </div>
    )
}

