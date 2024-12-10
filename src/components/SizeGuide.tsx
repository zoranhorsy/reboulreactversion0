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

type SizeGuideProps = {
    sizes?: string[]
    sizeChart?: {
        size: string
        chest: number
        waist: number
        hips: number
    }[]
    isLoading?: boolean // Add loading state prop
}

export function SizeGuide({ sizes = [], sizeChart = [], isLoading = false }: SizeGuideProps) { // Provide default values
    const [chest, setChest] = useState('')
    const [waist, setWaist] = useState('')
    const [recommendedSize, setRecommendedSize] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const chestSize = parseInt(chest)
        const waistSize = parseInt(waist)

        const recommended = sizeChart.find(
            (size) => chestSize <= size.chest && waistSize <= size.waist
        )

        setRecommendedSize(recommended ? recommended.size : 'Taille non trouvée')
    }

    if (isLoading) {
        return <div>Chargement du guide des tailles...</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Guide des tailles</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                    <Label htmlFor="chest">Tour de poitrine (cm)</Label>
                    <Input id="chest" type="number" value={chest} onChange={(e) => setChest(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="waist">Tour de taille (cm)</Label>
                    <Input id="waist" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} required />
                </div>
                <Button type="submit">Trouver ma taille</Button>
            </form>
            {recommendedSize && (
                <p className="mt-4 font-semibold">Taille recommandée : {recommendedSize}</p>
            )}

            {sizeChart && sizeChart.length > 0 && ( // Conditionally render the table
                <Table className="mt-6">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Taille</TableHead>
                            <TableHead>Poitrine (cm)</TableHead>
                            <TableHead>Taille (cm)</TableHead>
                            <TableHead>Hanches (cm)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sizeChart.map((size) => (
                            <TableRow key={size.size}>
                                <TableCell>{size.size}</TableCell>
                                <TableCell>{size.chest}</TableCell>
                                <TableCell>{size.waist}</TableCell>
                                <TableCell>{size.hips}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

