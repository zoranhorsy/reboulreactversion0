"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchUserOrders,
  type Order as ApiOrder,
  type OrderItem,
} from "@/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";

interface Order extends Omit<ApiOrder, "items"> {
  order_number: string;
  items: OrderItem[];
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

export function UserOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  // Fonction pour extraire l'email d'une commande
  const getOrderEmail = (order: Order): string | null => {
    // Vérifier dans shipping_info
    if (order.shipping_info?.email) {
      return order.shipping_info.email;
    }

    // Vérifier dans payment_data
    if (order.payment_data?.customerEmail) {
      return order.payment_data.customerEmail;
    }

    // Vérifier dans customer_info (objet)
    if (order.customer_info && typeof order.customer_info === "object") {
      const info = order.customer_info as any;
      if (info.email) return info.email;
      if (info.accountEmail) return info.accountEmail;
      if (info.stripe_email) return info.stripe_email;
      if (info.reboul_email) return info.reboul_email;
    }

    // Vérifier dans customer_info (string)
    if (order.customer_info && typeof order.customer_info === "string") {
      try {
        const parsed = JSON.parse(order.customer_info);
        if (parsed.email) return parsed.email;
        if (parsed.accountEmail) return parsed.accountEmail;
        if (parsed.stripe_email) return parsed.stripe_email;
        if (parsed.reboul_email) return parsed.reboul_email;
      } catch (e) {
        console.warn("Erreur parsing customer_info", e);
      }
    }

    // Vérifier dans metadata
    if (order.metadata) {
      try {
        const metadata =
          typeof order.metadata === "string"
            ? JSON.parse(order.metadata)
            : order.metadata;
        if (metadata.user_email) return metadata.user_email;
        if (metadata.account_email) return metadata.account_email;
        if (metadata.email) return metadata.email;
      } catch (e) {
        console.warn("Erreur parsing metadata", e);
      }
    }

    return null;
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return;
      try {
        const data = await fetchUserOrders();
        // Filtrer les commandes qui ont des items
        const ordersWithItems = data.filter((order): order is Order => {
          return Array.isArray(order.items) && order.items.length > 0;
        });
        setOrders(ordersWithItems);
      } catch (err) {
        console.error(err);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos commandes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user, toast]);

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(String(orderId))
        ? prev.filter((id) => id !== String(orderId))
        : [...prev, String(orderId)],
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <span>📦</span>
        <h3 className="mt-4 text-lg font-medium">Aucune commande</h3>
        <p className="text-center text-muted-foreground">
          Vous n&apos;avez pas encore de commande
        </p>
        <Button className="mt-4" asChild>
          <a href="/catalogue">Découvrir nos produits</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg overflow-hidden">
          <div
            className="p-6 bg-card hover:bg-accent/5 transition-colors cursor-pointer"
            onClick={() => toggleOrderExpansion(order.id)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">
                    Commande #{order.order_number}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={statusColors[order.status]}
                  >
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(order.total_amount)}
                </p>
                {expandedOrders.includes(String(order.id)) ? (
                  <span>↑</span>
                ) : (
                  <span>↓</span>
                )}
              </div>
            </div>
          </div>

          {expandedOrders.includes(String(order.id)) && (
            <div className="p-6 border-t bg-card/50">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Produits</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-accent/5">
                            {item.image_url && (
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">
                              {item.product_name}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity}
                            </p>
                            <p className="text-sm">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Adresse de livraison</h4>
                    <div className="space-y-1 text-sm">
                      {order.shipping_address ? (
                        <>
                          <p>{order.shipping_address.street}</p>
                          <p>
                            {order.shipping_address.postal_code}{" "}
                            {order.shipping_address.city}
                          </p>
                          <p>{order.shipping_address.country}</p>
                          {getOrderEmail(order) && (
                            <p className="mt-2">
                              <span className="text-muted-foreground">
                                Email :
                              </span>{" "}
                              {getOrderEmail(order)}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground">
                            Adresse de livraison non disponible
                          </p>
                          {getOrderEmail(order) && (
                            <p className="mt-2">
                              <span className="text-muted-foreground">
                                Email :
                              </span>{" "}
                              {getOrderEmail(order)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de la commande
                    </p>
                    <p className="text-lg font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.total_amount)}
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    Voir le détail
                    <span>ExternalLink</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
