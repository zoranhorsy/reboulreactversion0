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

type SizeChartItem = {
    size: string
    chest: number
    waist: number
    hips: number
}

type SizeGuideProps = {
    sizeChart?: SizeChartItem[]
    isLoading?: boolean
}

export function SizeGuide({ sizeChart = [], isLoading = false }: SizeGuideProps) {
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
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Guide des tailles</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="chest">Tour de poitrine (cm)</Label>
                    <Input
                        id="chest"
                        type="number"
                        value={chest}
                        onChange={(e) => setChest(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="waist">Tour de taille (cm)</Label>
                    <Input
                        id="waist"
                        type="number"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit">Trouver ma taille</Button>
            </form>
            {recommendedSize && (
                <p className="font-semibold">Taille recommandée : {recommendedSize}</p>
            )}

            {sizeChart.length > 0 && (
                <Table>
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

