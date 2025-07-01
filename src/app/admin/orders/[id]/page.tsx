"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        setLoading(true);
        const orderData = await api.getOrderById(params.id);
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

    if (params.id) {
      loadOrderDetail();
    }
  }, [params.id, toast]);

  if (loading) {
    return (
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
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Commande introuvable</h3>
          <p className="text-muted-foreground">
            Cette commande n&apos;existe pas ou vous n&apos;avez pas l&apos;autorisation de la voir.
          </p>
          <Button className="mt-4" onClick={() => router.back()}>
            Retour
          </Button>
        </div>
      </div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Commande #{order.order_number}</h1>
              <p className="text-muted-foreground">
                {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">ID Client: {order.user_id}</p>
                {shippingInfo?.name && (
                  <p className="text-sm text-muted-foreground">{shippingInfo.name}</p>
                )}
              </div>
            </CardContent>
          </Card>

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
                <div className="space-y-1 text-sm">
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.postalCode} {shippingInfo.city}</p>
                  <p>{shippingInfo.country}</p>
                  {shippingInfo.phone && (
                    <p className="mt-2">
                      <span className="text-muted-foreground">Tél:</span> {shippingInfo.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Adresse non disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Produits commandés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produits commandés ({order.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-accent/5">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name || 'Produit'}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name || 'Produit sans nom'}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantité: {item.quantity} | Prix unitaire: {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
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

        {/* Résumé de la commande */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Résumé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-medium">
                <span>Total de la commande</span>
                <span>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(order.total_amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
