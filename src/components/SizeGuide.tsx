import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Check, Info } from "lucide-react"

type SizeChartItem = {
    size: string
    chest: number
    waist: number
    hips: number
}

type SizeGuideProps = {
    sizeChart?: SizeChartItem[]
    isLoading?: boolean
    isKidsSizes?: boolean
}

export function SizeGuide({ 
    sizeChart = [], 
    isLoading = false,
    isKidsSizes = false 
}: SizeGuideProps) {
    const [chest, setChest] = useState('')
    const [waist, setWaist] = useState('')
    const [hips, setHips] = useState('')
    const [height, setHeight] = useState('')
    const [recommendedSize, setRecommendedSize] = useState('')
    const [showResult, setShowResult] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const chestSize = parseInt(chest) || 0
        const waistSize = parseInt(waist) || 0
        const hipsSize = parseInt(hips) || 0
        const heightSize = parseInt(height) || 0

        // Calcul basé sur les mesures disponibles et le type de guide (adulte ou enfant)
        const calculateRecommendation = () => {
            // Vérifier si on a assez de mesures pour faire un calcul
            const hasSufficientData = isKidsSizes 
                ? (chest !== '' || waist !== '' || height !== '')
                : (chest !== '' || waist !== '' || hips !== '');

            if (!hasSufficientData || sizeChart.length === 0) {
                return 'Mesures insuffisantes';
            }

            // Pour les enfants, la hauteur est un facteur important
            if (isKidsSizes && height !== '') {
                // Trouver la taille qui correspond à la hauteur
                for (let i = 0; i < sizeChart.length; i++) {
                    const size = sizeChart[i];
                    const nextSize = sizeChart[i + 1];
                    
                    // Extraire les valeurs numériques de la taille (format: "2-3 ans")
                    const currentSize = size.size;
                    
                    // Si c'est la dernière taille ou que la hauteur correspond à cette plage
                    if (!nextSize || heightSize <= size.chest) { // Utiliser chest comme approximation de la hauteur
                        return currentSize;
                    }
                }
                
                // Si aucune correspondance, retourner la plus grande taille
                return sizeChart[sizeChart.length - 1].size;
            } 
            // Pour adultes ou si on n'a pas la hauteur pour enfants
            else {
                let bestMatch = null;
                let bestScore = -1;
                
                for (const size of sizeChart) {
                    let score = 0;
                    let comparisons = 0;
                    
                    if (chest !== '') {
                        comparisons++;
                        if (chestSize <= size.chest) score++;
                    }
                    
                    if (waist !== '') {
                        comparisons++;
                        if (waistSize <= size.waist) score++;
                    }
                    
                    if (hips !== '' && !isKidsSizes) {
                        comparisons++;
                        if (hipsSize <= size.hips) score++;
                    }
                    
                    // Calculer un pourcentage de correspondance
                    const matchPercentage = comparisons > 0 ? score / comparisons : 0;
                    
                    // Si cette taille est meilleure que la précédente
                    if (matchPercentage > bestScore) {
                        bestScore = matchPercentage;
                        bestMatch = size;
                    }
                }
                
                return bestMatch ? bestMatch.size : 'Taille non trouvée';
            }
        };

        const result = calculateRecommendation();
        setRecommendedSize(result);
        setShowResult(true);
    }

    const resetForm = () => {
        setChest('')
        setWaist('')
        setHips('')
        setHeight('')
        setShowResult(false)
    }

    if (isLoading) {
        return <div className="py-4 text-center text-muted-foreground">Chargement du guide des tailles...</div>
    }

    if (sizeChart.length === 0) {
        return (
            <div className="py-4 text-center text-muted-foreground">
                Aucune information de taille disponible pour ce produit.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!showResult ? (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Entrez vos mensurations ci-dessous pour trouver votre taille idéale. 
                        Vous pouvez remplir seulement les champs que vous connaissez.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className={`grid grid-cols-1 ${isKidsSizes ? 'sm:grid-cols-3' : 'sm:grid-cols-3'} gap-3`}>
                            {isKidsSizes && (
                                <div className="space-y-2">
                                    <Label htmlFor="height" className="text-sm">Hauteur (cm)</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        placeholder="Ex: 110"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="chest" className="text-sm">
                                    {isKidsSizes ? 'Tour de poitrine (cm)' : 'Tour de poitrine (cm)'}
                                </Label>
                                <Input
                                    id="chest"
                                    type="number"
                                    placeholder={isKidsSizes ? "Ex: 60" : "Ex: 96"}
                                    value={chest}
                                    onChange={(e) => setChest(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="waist" className="text-sm">Tour de taille (cm)</Label>
                                <Input
                                    id="waist"
                                    type="number"
                                    placeholder={isKidsSizes ? "Ex: 55" : "Ex: 80"}
                                    value={waist}
                                    onChange={(e) => setWaist(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            
                            {!isKidsSizes && (
                                <div className="space-y-2">
                                    <Label htmlFor="hips" className="text-sm">Tour de hanches (cm)</Label>
                                    <Input
                                        id="hips"
                                        type="number"
                                        placeholder="Ex: 102"
                                        value={hips}
                                        onChange={(e) => setHips(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={(isKidsSizes && !height && !chest && !waist) || 
                                     (!isKidsSizes && !chest && !waist && !hips)}
                        >
                            Trouver ma taille
                        </Button>
                    </form>
                </>
            ) : (
                <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Résultat</h3>
                        <Button variant="ghost" size="sm" onClick={resetForm}>
                            Recommencer
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Vos mesures:</p>
                            <ul className="text-sm space-y-1">
                                {isKidsSizes && height && <li>Hauteur: {height} cm</li>}
                                {chest && <li>Tour de poitrine: {chest} cm</li>}
                                {waist && <li>Tour de taille: {waist} cm</li>}
                                {!isKidsSizes && hips && <li>Tour de hanches: {hips} cm</li>}
                            </ul>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-lg flex flex-col items-center justify-center">
                            <p className="text-sm text-muted-foreground">Taille recommandée</p>
                            <p className="text-xl font-bold my-1">{recommendedSize}</p>
                            {recommendedSize !== 'Taille non trouvée' && recommendedSize !== 'Mesures insuffisantes' && (
                                <div className="flex items-center text-green-600 text-sm">
                                    <Check className="h-4 w-4 mr-1" />
                                    <span>Disponible</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-600">
                        <Info className="h-3 w-3 inline-block mr-1" />
                        Cette recommandation est basée sur des mesures standard. Pour un ajustement parfait, essayez le produit ou consultez notre service client.
                    </div>
                </Card>
            )}

            <div className="overflow-x-auto mt-5">
                <h3 className="font-medium text-sm mb-2">Tableau des tailles</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="py-2 px-3 text-xs">
                                {isKidsSizes ? 'ÂGE' : 'TAILLE'}
                            </TableHead>
                            <TableHead className="py-2 px-3 text-xs">
                                {isKidsSizes ? 'HAUTEUR (cm)' : 'POITRINE (cm)'}
                            </TableHead>
                            <TableHead className="py-2 px-3 text-xs">TAILLE (cm)</TableHead>
                            {!isKidsSizes && (
                                <TableHead className="py-2 px-3 text-xs">HANCHES (cm)</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sizeChart.map((size) => (
                            <TableRow 
                                key={size.size}
                                className={recommendedSize === size.size ? "bg-blue-50" : ""}
                            >
                                <TableCell className="py-2 px-3 font-medium">{size.size}</TableCell>
                                <TableCell className="py-2 px-3">
                                    {isKidsSizes ? size.chest : size.chest}
                                </TableCell>
                                <TableCell className="py-2 px-3">{size.waist}</TableCell>
                                {!isKidsSizes && (
                                    <TableCell className="py-2 px-3">{size.hips}</TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

