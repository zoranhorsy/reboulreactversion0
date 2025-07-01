"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Package, MapPin, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { ClientPageWrapper } from "@/components/ClientPageWrapper";

interface OrderDetail {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
  items?: any[];
  shipping_info?: any;
  shipping_address?: any;
  payment_data?: any;
  customer_info?: any;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-blue-500/10 text-blue-500", 
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const statusLabels = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédiée", 
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function UserOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        setLoading(true);
        const orderData = await api.getOrderById(params.id);
        
        // Check if orderData is null first
        if (!orderData) {
          toast({
            title: "Erreur",
            description: "Commande introuvable.",
            variant: "destructive",
          });
          return;
        }
        
        // Debug pour comprendre le problème
        console.log("Debug - User:", user);
        console.log("Debug - User ID:", user?.id);
        console.log("Debug - Order User ID:", orderData.user_id);
        console.log("Debug - Types:", typeof user?.id, typeof orderData.user_id);
        
        // Vérifier que la commande appartient à l'utilisateur connecté
        // Convertir les IDs en string pour une comparaison sûre
        if (user && orderData.user_id && String(orderData.user_id) !== String(user.id)) {
          console.log("Access denied - IDs don't match");
          console.log(`User ID: ${user.id} (${typeof user.id}), Order User ID: ${orderData.user_id} (${typeof orderData.user_id})`);
          
          // Pour le moment, on laisse passer si l'ID utilisateur n'est pas défini dans la commande
          // ou si c'est une commande sans user_id (commandes anciennes)
          if (orderData.user_id !== null && orderData.user_id !== undefined) {
            toast({
              title: "Accès refusé",
              description: "Vous ne pouvez voir que vos propres commandes.",
              variant: "destructive",
            });
            router.push("/suivi-commande");
            return;
          }
        }
        
        setOrder(orderData as OrderDetail);
      } catch (error) {
        console.error("Erreur lors du chargement de la commande:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la commande.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id && user) {
      loadOrderDetail();
    }
  }, [params.id, toast, user, router]);

  if (loading) {
    return (
      <ClientPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-48" />
          </div>
        </div>
      </ClientPageWrapper>
    );
  }

  if (!order) {
    return (
      <ClientPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Commande introuvable</h3>
            <p className="text-muted-foreground">
              Cette commande n&apos;existe pas ou ne vous appartient pas.
            </p>
            <Button className="mt-4" onClick={() => router.push("/suivi-commande")}>
              Retour à mes commandes
            </Button>
          </div>
        </div>
      </ClientPageWrapper>
    );
  }

  const getShippingInfo = () => {
    if (order.shipping_info) {
      return {
        address: order.shipping_info.address,
        postalCode: order.shipping_info.postalCode,
        city: order.shipping_info.city,
        country: order.shipping_info.country || "France",
        phone: order.shipping_info.phone,
        name: `${order.shipping_info.firstName || ""} ${order.shipping_info.lastName || ""}`.trim()
      };
    }
    if (order.shipping_address) {
      return {
        address: order.shipping_address.street,
        postalCode: order.shipping_address.postal_code,
        city: order.shipping_address.city,
        country: order.shipping_address.country,
        phone: order.shipping_address.phone,
        name: order.shipping_address.full_name
      };
    }
    return null;
  };

  const shippingInfo = getShippingInfo();

  return (
    <ClientPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/suivi-commande")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Mes commandes
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Commande #{order.order_number}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>

          {/* Adresse de livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shippingInfo ? (
                <div className="space-y-1">
                  {shippingInfo.name && <p className="font-medium">{shippingInfo.name}</p>}
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.postalCode} {shippingInfo.city}</p>
                  <p>{shippingInfo.country}</p>
                  {shippingInfo.phone && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Téléphone: {shippingInfo.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Adresse non disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Produits commandés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Vos produits ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-accent/5">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name || 'Produit'}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{item.product_name || 'Produit sans nom'}</h4>
                      <p className="text-muted-foreground">
                        Quantité: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Prix unitaire: {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency", 
                          currency: "EUR",
                        }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total de votre commande</span>
                <span>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/contact")}>
              Contacter le support
            </Button>
            <Button className="flex-1" onClick={() => router.push("/catalogue")}>
              Continuer mes achats
            </Button>
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
