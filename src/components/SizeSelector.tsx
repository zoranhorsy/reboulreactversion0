'use client'

import React from 'react'

interface SizeSelectorProps {
    selectedSize: string
    onSizeChange: (size: string) => void
}

const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']

export function SizeSelector({ selectedSize, onSizeChange }: SizeSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
                <button
                    key={size}
                    onClick={() => onSizeChange(size)}
                    className={`px-4 py-2 ${
                        selectedSize === size
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    }`}
                >
                    {size}
                </button>
            ))}
        </div>
    )
}

