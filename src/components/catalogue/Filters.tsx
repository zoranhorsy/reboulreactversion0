import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

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
                            allBrands
                        }: FiltersProps) {
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)

    useEffect(() => {
        const count =
            (filterBrand !== 'all' ? 1 : 0) +
            filterCategories.length +
            filterTags.length +
            (filterColor !== 'all' ? 1 : 0) +
            (priceRange[0] !== 0 || priceRange[1] !== 600 ? 1 : 0);
        setActiveFiltersCount(count);
    }, [filterBrand, filterCategories, filterTags, filterColor, priceRange]);

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                />
            </div>

            <div className="space-y-2">
                <h3 className="text-base font-semibold">Trier par</h3>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'price' | 'name')}>
                    <SelectTrigger id="sort-by" className="w-full">
                        <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="price">Prix</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <h3 className="text-base font-semibold">Marque</h3>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                    <SelectTrigger id="brand-filter" className="w-full">
                        <SelectValue placeholder="Toutes les marques" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {allBrands.map((brand) => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories">
                    <AccordionTrigger>Catégories</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={category}
                                        checked={filterCategories.includes(category)}
                                        onCheckedChange={(checked) => {
                                            setFilterCategories(
                                                checked
                                                    ? [...filterCategories, category]
                                                    : filterCategories.filter((c) => c !== category)
                                            )
                                        }}
                                    />
                                    <Label htmlFor={category}>{category}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tags">
                    <AccordionTrigger>Tags</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={filterTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setFilterTags(
                                            filterTags.includes(tag)
                                                ? filterTags.filter((t) => t !== tag)
                                                : [...filterTags, tag]
                                        )
                                    }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="space-y-2">
                <h3 className="text-base font-semibold">Couleur</h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        key="all"
                        onClick={() => setFilterColor('all')}
                        variant={filterColor === 'all' ? "default" : "outline"}
                        size="sm"
                    >
                        Toutes
                    </Button>
                    {allColors.map((color) => (
                        <Button
                            key={color}
                            onClick={() => setFilterColor(color)}
                            variant={filterColor === color ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0 rounded-full"
                            style={{ backgroundColor: color }}
                            title={color}
                        >
                            <span className="sr-only">{color}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-base font-semibold">Gamme de prix</h3>
                <Slider
                    id="price-range"
                    min={0}
                    max={600}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="my-4"
                />
                <div className="flex justify-between mt-2 text-sm font-medium">
                    <span>{priceRange[0]}€</span>
                    <span>{priceRange[1]}€</span>
                </div>
            </div>

            <Button className="w-full" onClick={() => {
                setSearchTerm('')
                setSortBy('name')
                setFilterBrand('all')
                setFilterCategories([])
                setFilterTags([])
                setPriceRange([0, 600])
                setFilterColor('all')
            }}>
                Réinitialiser les filtres
            </Button>
        </div>
    )
}

