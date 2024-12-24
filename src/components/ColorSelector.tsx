'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { productColors, getColorValue } from '@/config/productColors'

interface ColorSelectorProps {
    availableColors: string[]
    selectedColor: string
    onColorChange: (color: string) => void
}

export function ColorSelector({ availableColors, selectedColor, onColorChange }: ColorSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    const filteredColors = productColors
        .filter(color => availableColors.includes(color.name))
        .filter(color => color.name.toLowerCase().includes(searchTerm.toLowerCase()))

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center">
                    <motion.div
                        className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                        style={{ backgroundColor: getColorValue(selectedColor) }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                    {selectedColor}
                </div>
                <ChevronDown className="ml-2 h-4 w-4" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <input
                            type="text"
                            className="block w-full px-4 py-2 text-gray-800 border-b border-gray-200 focus:ring-0 focus:border-blue-300"
                            placeholder="Rechercher une couleur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {filteredColors.map((color) => (
                            <motion.button
                                key={color.name}
                                className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                                    selectedColor === color.name ? 'bg-gray-100' : ''
                                }`}
                                onClick={() => {
                                    onColorChange(color.name)
                                    setIsOpen(false)
                                }}
                                whileHover={{ backgroundColor: "#f3f4f6" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                                    style={{ backgroundColor: color.value }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                                {color.name}
                                {selectedColor === color.name && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    >
                                        <Check className="ml-auto h-4 w-4 text-green-500" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

