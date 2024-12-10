import { useState } from 'react'
import { Star, Edit, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type Review = {
  id: number
  productName: string
  rating: number
  comment: string
  date: string
}

export function UserReviews() {
  const [reviews, setReviews] = useState<Review[]>([
    { id: 1, productName: "T-shirt Stone Island", rating: 5, comment: "Excellent produit, très confortable !", date: "2023-05-20" },
    { id: 2, productName: "Pantalon CP Company", rating: 4, comment: "Bonne qualité, mais taille un peu grande.", date: "2023-06-10" },
  ])

  const [editingReview, setEditingReview] = useState<Review | null>(null)

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
  }

  const handleUpdateReview = (updatedReview: Review) => {
    setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r))
    setEditingReview(null)
  }

  const handleDeleteReview = (id: number) => {
    setReviews(reviews.filter(r => r.id !== id))
  }

  return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mes avis</h3>
        {reviews.map(review => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex justify-between items-center">
                  <span>{review.productName}</span>
                  <span className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{review.comment}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{review.date}</span>
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleEditReview(review)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier l'avis</DialogTitle>
                        </DialogHeader>
                        <EditReviewForm review={review} onUpdate={handleUpdateReview} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(review.id)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>
  )
}

function EditReviewForm({ review, onUpdate }: { review: Review, onUpdate: (review: Review) => void }) {
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ ...review, rating, comment })
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Note</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                >
                  <Star className={`h-6 w-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-1">Commentaire</label>
          <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
          />
        </div>
        <Button type="submit">Mettre à jour l'avis</Button>
      </form>
  )
}

