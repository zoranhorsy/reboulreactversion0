"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchUserReviews,
  updateReview,
  deleteReview,
  fetchProducts,
  addReview,
  type UserReview,
  type Product,
} from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserReviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ rating: number; comment: string }>(
    {
      rating: 0,
      comment: "",
    },
  );
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewReviewDialogOpen, setIsNewReviewDialogOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [newReview, setNewReview] = useState({
    productId: "",
    rating: 5,
    comment: "",
  });
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUserReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos avis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetchProducts();
      const productsMap: Record<string, Product> = {};
      response.products.forEach((product) => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
      setAvailableProducts(
        response.products.map((p) => ({ id: p.id, name: p.name })),
      );
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, [loadReviews, loadProducts]);

  const handleEditReview = async () => {
    if (!editingReview) return;

    try {
      const success = await updateReview(
        editingReview.id,
        editingReview.rating,
        editingReview.comment,
      );

      if (success) {
        toast({
          title: "Succès",
          description: "Votre avis a été mis à jour.",
        });
        loadReviews();
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre avis.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const success = await deleteReview(reviewId);
      if (success) {
        setReviews(reviews.filter((review) => review.id !== reviewId));
        toast({
          title: "Succès",
          description: "Votre avis a été supprimé.",
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre avis.",
        variant: "destructive",
      });
    }
  };

  const handleAddReview = async () => {
    if (!newReview.productId || !newReview.comment) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await addReview(newReview.productId, {
        rating: newReview.rating,
        comment: newReview.comment,
      });

      if (success) {
        toast({
          title: "Succès",
          description: "Votre avis a été ajouté.",
        });
        loadReviews();
        setIsNewReviewDialogOpen(false);
        setNewReview({ productId: "", rating: 5, comment: "" });
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre avis.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => <span key={index}>⭐</span>);
  };

  const filteredAndSortedReviews = reviews
    .filter((review) => (filterRating ? review.rating === filterRating : true))
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return b.rating - a.rating;
      }
    });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Vos avis</h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} avis publiés
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={sortBy}
            onValueChange={(value: "date" | "rating") => setSortBy(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="rating">Note</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterRating?.toString() || "all"}
            onValueChange={(value) =>
              setFilterRating(value === "all" ? null : Number(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par note" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les notes</SelectItem>
              {[5, 4, 3, 2, 1].map((rating) => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} étoile{rating > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog
            open={isNewReviewDialogOpen}
            onOpenChange={setIsNewReviewDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <span>+</span>
                Ajouter un avis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un avis</DialogTitle>
                <DialogDescription>
                  Partagez votre expérience avec un produit
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select
                    value={newReview.productId}
                    onValueChange={(value) =>
                      setNewReview({ ...newReview, productId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className="focus:outline-none"
                      >
                        <span>⭐</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Commentaire</Label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    placeholder="Votre avis sur le produit..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewReviewDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleAddReview}>Publier l&apos;avis</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredAndSortedReviews.length === 0 ? (
        <Card>
          <CardContent>
            <CardHeader>
              <span>MessageSquare</span>
              <h3 className="text-lg font-medium">Aucun avis</h3>
              <p className="text-muted-foreground mt-2">
                {reviews.length > 0
                  ? "Aucun avis ne correspond à vos critères de filtrage."
                  : "Vous n'avez pas encore publié d'avis. Partagez votre expérience avec la communauté."}
              </p>
              {reviews.length === 0 && (
                <Button className="mt-4" asChild>
                  <a href="/catalogue">Découvrir nos produits</a>
                </Button>
              )}
            </CardHeader>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAndSortedReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {review.product_name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500/10 text-yellow-500"
                      >
                        {review.rating}/5
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingReview(review);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <span>✏️</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span>🗑️</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer cet avis ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. L&apos;avis sera
                            définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.comment}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Publié le{" "}
                    {format(new Date(review.created_at), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <a href={`/produit/${review.productId}`}>
                      Voir le produit
                      <span>ExternalLink</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;avis</DialogTitle>
            <DialogDescription>
              Modifiez votre avis sur l&apos;article.
            </DialogDescription>
          </DialogHeader>
          {editingReview && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Note</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setEditingReview({
                          ...editingReview,
                          rating,
                        })
                      }
                      className="focus:outline-none"
                    >
                      <span>⭐</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Commentaire</Label>
                <Textarea
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      comment: e.target.value,
                    })
                  }
                  placeholder="Votre avis..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleEditReview}>Mettre à jour</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
