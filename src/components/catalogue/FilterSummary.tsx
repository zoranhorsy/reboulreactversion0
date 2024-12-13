import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'

interface FilterSummaryProps {
    totalProducts: number
    activeFiltersCount: number
    resetFilters: () => void
}

export function FilterSummary({ totalProducts, activeFiltersCount, resetFilters }: FilterSummaryProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
                {totalProducts} produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}
            </p>
            {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser les filtres ({activeFiltersCount})
                </Button>
            )}
        </div>
    )
}

