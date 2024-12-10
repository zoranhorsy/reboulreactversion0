import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type PointsHistory = {
    id: number
    date: string
    description: string
    points: number
}

export function LoyaltyPoints() {
    const [totalPoints, setTotalPoints] = useState(750)
    const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([
        { id: 1, date: "2023-05-15", description: "Achat T-shirt Stone Island", points: 50 },
        { id: 2, date: "2023-06-02", description: "Achat Pantalon CP Company", points: 75 },
        { id: 3, date: "2023-06-20", description: "Bonus anniversaire", points: 100 },
    ])

    const nextTier = 1000
    const progress = (totalPoints / nextTier) * 100

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Points de fidélité</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold mb-2">{totalPoints} points</div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-500 mt-2">
                        {nextTier - totalPoints} points de plus pour atteindre le niveau suivant
                    </p>
                </CardContent>
            </Card>

            <div>
                <h4 className="text-lg font-semibold mb-4">Historique des points</h4>
                {pointsHistory.map((entry) => (
                    <Card key={entry.id} className="mb-4">
                        <CardContent className="flex justify-between items-center py-4">
                            <div>
                                <p className="font-medium">{entry.description}</p>
                                <p className="text-sm text-gray-500">{entry.date}</p>
                            </div>
                            <div className="text-lg font-semibold text-green-600">+{entry.points}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

