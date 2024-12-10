import { useState } from 'react'
import { Star, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

type Review = {
    id: number
    userName: string
    rating: number
    comment: string
    date: string
}

type ProductReviewsProps = {
    productId: number;
    initialReviews?: Review[];
}

export function ProductReviews({ productId, initialReviews = [] }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews)
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' })

    const handleRatingChange = (rating: number) => {
        setNewReview(prev => ({ ...prev, rating }))
    }

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewReview(prev => ({ ...prev, comment: e.target.value }))
    }

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault()
        const review: Review = {
            id: reviews.length + 1,
            userName: 'Utilisateur anonyme', // In a real case, this would come from the logged-in user
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date().toISOString().split('T')[0]
        }
        setReviews([...reviews, review])
        setNewReview({ rating: 0, comment: '' })
    }

    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
            <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-6 w-6 ${
                            star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className="ml-2 text-lg font-semibold">{averageRating.toFixed(1)}</span>
                <span className="ml-2 text-gray-500">({reviews.length} avis)</span>
            </div>

            <div className="space-y-4 mb-8">
                {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center mb-2">
                                    <User className="h-6 w-6 mr-2" />
                                    <span className="font-semibold">{review.userName}</span>
                                    <span className="ml-auto text-sm text-gray-500">{review.date}</span>
                                </div>
                                <div className="flex mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                                star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p>{review.comment}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p>Aucun avis pour le moment.</p>
                )}
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
                <h3 className="text-xl font-semibold">Ajouter un avis</h3>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none"
                        >
                            <Star
                                className={`h-8 w-8 ${
                                    star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <Textarea
                    value={newReview.comment}
                    onChange={handleCommentChange}
                    placeholder="Partagez votre expérience avec ce produit..."
                    rows={4}
                />
                <Button type="submit" disabled={newReview.rating === 0 || newReview.comment.trim() === ''}>
                    Soumettre l&apos;avis
                </Button>
            </form>
        </div>
    )
}

