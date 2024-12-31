import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoyaltyPoints() {
    // Pour l'instant, nous utilisons une valeur factice
    const points = 150

    return (
        <Card>
            <CardHeader>
                <CardTitle>Programme de fidélité</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{points} points</p>
                <p className="mt-2">Continuez vos achats pour gagner plus de points et débloquer des récompenses exclusives !</p>
            </CardContent>
        </Card>
    )
}

