import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'

interface FilterSummaryProps {
    totalProducts: number
    activeFiltersCount: number
    resetFilters: () => void
}

export function FilterSummary({ totalProducts, activeFiltersCount, resetFilters }: FilterSummaryProps) {
    return (
        <div className="flex items-center justify-between py-4 px-6 border-b bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                    {totalProducts} produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}
                </p>
                {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="px-2 py-0.5">
                        {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                    </Badge>
                )}
            </div>
            {activeFiltersCount > 0 && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Réinitialiser
                </Button>
            )}
        </div>
    )
}

