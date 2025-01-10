'use client'

import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type FiltersProps = {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: 'price' | 'name';
    setSortBy: (value: 'price' | 'name') => void;
    filterBrand: string;
    setFilterBrand: (value: string) => void;
    filterCategories: string[];
    setFilterCategories: (value: string[]) => void;
    filterTags: string[];
    setFilterTags: (value: string[]) => void;
    priceRange: number[];
    setPriceRange: (value: number[]) => void;
    filterColor: string;
    setFilterColor: (value: string) => void;
    categories: string[];
    allTags: string[];
    allColors: string[];
    allBrands: string[];
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export function Filters({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterBrand,
    setFilterBrand,
    filterCategories,
    setFilterCategories,
    filterTags,
    setFilterTags,
    priceRange,
    setPriceRange,
    filterColor,
    setFilterColor,
    categories,
    allTags,
    allColors,
    allBrands,
    isOpen,
    setIsOpen
}: FiltersProps) {
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)

    useEffect(() => {
        let count = 0
        if (filterBrand) count++
        if (filterCategories.length > 0) count++
        if (filterTags.length > 0) count++
        if (filterColor) count++
        if (priceRange[0] !== 0 || priceRange[1] !== 1000) count++
        setActiveFiltersCount(count)
    }, [filterBrand, filterCategories, filterTags, filterColor, priceRange])

    const resetFilters = () => {
        setFilterBrand('')
        setFilterCategories([])
        setFilterTags([])
        setFilterColor('')
        setPriceRange([0, 1000])
    }

    const FiltersContent = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Recherche</h3>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Trier par</h3>
                <Select value={sortBy} onValueChange={(value: 'price' | 'name') => setSortBy(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un tri" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price">Prix</SelectItem>
                        <SelectItem value="name">Nom</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="brand">
                    <AccordionTrigger>Marque</AccordionTrigger>
                    <AccordionContent>
                        <Select value={filterBrand} onValueChange={setFilterBrand}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une marque" />
                            </SelectTrigger>
                            <SelectContent>
                                {allBrands.map((brand) => (
                                    <SelectItem key={brand} value={brand}>
                                        {brand}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="categories">
                    <AccordionTrigger>Catégories</AccordionTrigger>
                    <AccordionContent>
                        {categories.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                    id={category}
                                    checked={filterCategories.includes(category)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setFilterCategories([...filterCategories, category])
                                        } else {
                                            setFilterCategories(filterCategories.filter((c) => c !== category))
                                        }
                                    }}
                                />
                                <Label htmlFor={category}>{category}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tags">
                    <AccordionTrigger>Tags</AccordionTrigger>
                    <AccordionContent>
                        {allTags.map((tag) => (
                            <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                    id={tag}
                                    checked={filterTags.includes(tag)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setFilterTags([...filterTags, tag])
                                        } else {
                                            setFilterTags(filterTags.filter((t) => t !== tag))
                                        }
                                    }}
                                />
                                <Label htmlFor={tag}>{tag}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                    <AccordionTrigger>Prix</AccordionTrigger>
                    <AccordionContent>
                        <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={priceRange}
                            onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between mt-2">
                            <span>{priceRange[0]}€</span>
                            <span>{priceRange[1]}€</span>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="color">
                    <AccordionTrigger>Couleur</AccordionTrigger>
                    <AccordionContent>
                        <Select value={filterColor} onValueChange={setFilterColor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une couleur" />
                            </SelectTrigger>
                            <SelectContent>
                                {allColors.map((color) => (
                                    <SelectItem key={color} value={color}>
                                        {color}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                </Button>
                <Badge variant="secondary">{activeFiltersCount} filtres actifs</Badge>
            </div>
        </div>
    )

    return (
        <>
            <div className="hidden md:block">
                <FiltersContent />
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden">
                        Filtres
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Filtres</SheetTitle>
                    </SheetHeader>
                    <FiltersContent />
                </SheetContent>
            </Sheet>
        </>
    )
}

export default Filters

