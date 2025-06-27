import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  const latestReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avis clients</CardTitle>
      </CardHeader>
      <CardContent>
        {latestReview ? (
          <div className="space-y-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i}>⭐</span>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {latestReview.rating}/5
              </span>
            </div>
            <p className="text-sm">{latestReview.comment.slice(0, 100)}...</p>
            <p className="text-xs text-muted-foreground">
              {latestReview.userName} -{" "}
              {new Date(latestReview.date).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun avis pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
