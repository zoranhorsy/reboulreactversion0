import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserReviews() {
    // Pour l'instant, nous utilisons des données factices
    const reviews = [
        { id: 1, productName: "T-shirt Stone Island", rating: 5, comment: "Excellent produit, très confortable !" },
        { id: 2, productName: "Pantalon CP Company", rating: 4, comment: "Bonne qualité, mais taille un peu grand." }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vos avis</CardTitle>
            </CardHeader>
            <CardContent>
                {reviews.length === 0 ? (
                    <p>Vous n'avez pas encore laissé d'avis.</p>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map((review) => (
                            <li key={review.id} className="border-b pb-4">
                                <h3 className="font-semibold">{review.productName}</h3>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-2">{review.comment}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}

