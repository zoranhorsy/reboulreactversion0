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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ExtendedOrderItem extends OrderItem {
  image_url?: string;
  image?: string;
  is_refunded?: boolean;
  admin_comment?: string;
  updated_at?: string;
}

interface Order extends Omit<ApiOrder, "items"> {
  order_number: string;
  items: ExtendedOrderItem[];
  shipping_info?: {
    email?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app";

export function UserOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [returnModal, setReturnModal] = useState<{orderId: number, item: ExtendedOrderItem} | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reasonInputRef = useRef<HTMLInputElement>(null);
  const [multiReturnModal, setMultiReturnModal] = useState<number | null>(null);
  const [multiReturnState, setMultiReturnState] = useState<Record<number, { checked: boolean, quantity: number, reason: string }>>({});
  const [isMultiSubmitting, setIsMultiSubmitting] = useState(false);

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

  // Fonction pour envoyer la demande de retour
  const handleReturnRequest = async (orderId: number, item: ExtendedOrderItem) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || (user as any)?.token;
      if (!token) {
        toast({ title: "Erreur", description: "Vous devez être connecté pour faire une demande de retour.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/orders/${orderId}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [
            {
              order_item_id: item.id,
              quantity: returnQuantity,
              reason: returnReason
            }
          ]
        })
      });
      if (!res.ok) throw new Error("Erreur lors de la demande de retour");
      toast({ title: "Demande de retour envoyée", description: "Votre demande de retour a bien été enregistrée." });
      // Met à jour l'UI localement
      setOrders(orders => orders.map(order =>
        order.id === orderId ? {
          ...order,
          items: order.items.map(it =>
            it.id === item.id ? { ...it, return_status: 'requested', return_quantity: returnQuantity, return_reason: returnReason } : it
          )
        } : order
      ));
      setReturnModal(null);
      setReturnQuantity(1);
      setReturnReason("");
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande de retour.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour ouvrir la modale multi-retour
  const openMultiReturnModal = (order: Order) => {
    const eligible = order.items.filter(item => order.status === 'delivered' && (item.return_status === 'none' || !item.return_status));
    const state: Record<number, { checked: boolean, quantity: number, reason: string }> = {};
    eligible.forEach(item => {
      state[item.id] = { checked: false, quantity: 1, reason: "" };
    });
    setMultiReturnState(state);
    setMultiReturnModal(order.id);
  };

  // Fonction pour envoyer le retour multi-articles
  const handleMultiReturnRequest = async (order: Order) => {
    setIsMultiSubmitting(true);
    try {
      const token = localStorage.getItem("token") || (user as any)?.token;
      if (!token) {
        toast({ title: "Erreur", description: "Vous devez être connecté pour faire une demande de retour.", variant: "destructive" });
        setIsMultiSubmitting(false);
        return;
      }
      const items = Object.entries(multiReturnState)
        .filter(([_, v]) => v.checked && v.reason.trim())
        .map(([id, v]) => ({ order_item_id: Number(id), quantity: v.quantity, reason: v.reason }));
      if (items.length === 0) {
        toast({ title: "Erreur", description: "Sélectionnez au moins un article et indiquez une raison.", variant: "destructive" });
        setIsMultiSubmitting(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/orders/${order.id}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
      if (!res.ok) throw new Error("Erreur lors de la demande de retour");
      toast({ title: "Demande de retour envoyée", description: "Votre demande de retour a bien été enregistrée." });
      // Met à jour l'UI localement
      setOrders(orders => orders.map(o =>
        o.id === order.id ? {
          ...o,
          items: o.items.map(it =>
            multiReturnState[it.id]?.checked ? { ...it, return_status: 'requested', return_quantity: multiReturnState[it.id].quantity, return_reason: multiReturnState[it.id].reason } : it
          )
        } : o
      ));
      setMultiReturnModal(null);
      setMultiReturnState({});
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande de retour.", variant: "destructive" });
    } finally {
      setIsMultiSubmitting(false);
    }
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
      {orders.map((order) => {
        const eligibleItems = order.items.filter(item => order.status === 'delivered' && (item.return_status === 'none' || !item.return_status));
        return (
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
                            {/* Placeholder image carré */}
                            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-accent/5 text-2xl">
                              
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium truncate">
                                {item.product_name || 'Produit sans nom'}
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
                              {/* Affichage du statut de retour ou bouton */}
                              {item.is_refunded ? (
                                <>
                                  <Badge className="mt-2 bg-green-500/10 text-green-700">Remboursé</Badge>
                                  {item.admin_comment && (
                                    <div className="text-xs text-muted-foreground mt-1">{item.admin_comment}</div>
                                  )}
                                  {item.updated_at && (
                                    <div className="text-xs text-muted-foreground">le {format(new Date(item.updated_at), "d MMM yyyy à HH:mm", { locale: fr })}</div>
                                  )}
                                </>
                              ) : item.return_status === 'requested' ? (
                                <Badge className="mt-2 bg-yellow-500/10 text-yellow-700">Retour demandé</Badge>
                              ) : item.return_status === 'approved' ? (
                                <Badge className="mt-2 bg-green-500/10 text-green-700">Retour validé</Badge>
                              ) : item.return_status === 'rejected' ? (
                                <>
                                  <Badge className="mt-2 bg-red-500/10 text-red-700">Retour refusé</Badge>
                                  {item.admin_comment && (
                                    <div className="text-xs text-muted-foreground mt-1">{item.admin_comment}</div>
                                  )}
                                  {item.updated_at && (
                                    <div className="text-xs text-muted-foreground">le {format(new Date(item.updated_at), "d MMM yyyy à HH:mm", { locale: fr })}</div>
                                  )}
                                </>
                              ) : item.return_status === 'refunded' ? (
                                <Badge className="mt-2 bg-blue-500/10 text-blue-700">Remboursé</Badge>
                              ) : order.status === 'delivered' && (item.return_status === 'none' || !item.return_status) ? (
                                <Dialog open={!!returnModal && returnModal.orderId === order.id && returnModal.item.id === item.id} onOpenChange={open => {
                                  if (!open) setReturnModal(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                                      setReturnModal({ orderId: order.id, item });
                                      setReturnQuantity(1);
                                      setReturnReason("");
                                      setTimeout(() => reasonInputRef.current?.focus(), 100);
                                    }}>
                                      Demander un retour
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Demander un retour</DialogTitle>
                                      <DialogDescription>
                                        {item.product_name} (Qté achetée : {item.quantity})
                                      </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={e => { e.preventDefault(); handleReturnRequest(order.id, item); }}>
                                      <div className="space-y-4">
                                        {item.quantity > 1 && (
                                          <div>
                                            <Label>Quantité à retourner</Label>
                                            <Input type="number" min={1} max={item.quantity} value={returnQuantity} onChange={e => setReturnQuantity(Number(e.target.value))} />
                                          </div>
                                        )}
                                        <div>
                                          <Label>Raison du retour</Label>
                                          <Input ref={reasonInputRef} value={returnReason} onChange={e => setReturnReason(e.target.value)} required placeholder="Ex : Taille trop petite" />
                                        </div>
                                      </div>
                                      <DialogFooter className="mt-4">
                                        <Button type="button" variant="outline" onClick={() => setReturnModal(null)} disabled={isSubmitting}>Annuler</Button>
                                        <Button type="submit" disabled={isSubmitting || !returnReason.trim()}>Envoyer</Button>
                                      </DialogFooter>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Adresse de livraison</h4>
                      <div className="space-y-1 text-sm">
                        {(() => {
                          // Vérifier d'abord shipping_info (format du backend)
                          if (order.shipping_info && order.shipping_info.address) {
                            return (
                              <>
                                <p>{order.shipping_info.address}</p>
                                <p>
                                  {order.shipping_info.postalCode}{" "}
                                  {order.shipping_info.city}
                                </p>
                                <p>{order.shipping_info.country || "France"}</p>
                                {order.shipping_info.phone && (
                                  <p className="mt-1">
                                    <span className="text-muted-foreground">
                                      Tél :
                                    </span>{" "}
                                    {order.shipping_info.phone}
                                  </p>
                                )}
                              </>
                            );
                          }
                          // Sinon vérifier shipping_address (ancien format)
                          if (order.shipping_address) {
                            return (
                              <>
                                <p>{order.shipping_address.street}</p>
                                <p>
                                  {order.shipping_address.postal_code}{" "}
                                  {order.shipping_address.city}
                                </p>
                                <p>{order.shipping_address.country}</p>
                              </>
                            );
                          }
                          // Aucune adresse trouvée
                          return (
                            <p className="text-muted-foreground">
                              Adresse de livraison non disponible
                            </p>
                          );
                        })()}
                        {getOrderEmail(order) && (
                          <p className="mt-2">
                            <span className="text-muted-foreground">
                              Email :
                            </span>{" "}
                            {getOrderEmail(order)}
                          </p>
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
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/commande/${order.id}`, '_blank');
                      }}
                    >
                      Voir le détail
                      <span>↗</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end p-4">
              {eligibleItems.length > 1 && (
                <Dialog open={multiReturnModal === order.id} onOpenChange={open => { if (!open) setMultiReturnModal(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => openMultiReturnModal(order)}>
                      Demander un retour (plusieurs articles)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Demander un retour</DialogTitle>
                      <DialogDescription>
                        Sélectionnez les articles à retourner et indiquez la raison pour chacun.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={e => { e.preventDefault(); handleMultiReturnRequest(order); }}>
                      <div className="space-y-4">
                        {eligibleItems.map(item => (
                          <div key={item.id} className="flex items-center gap-4 border-b pb-2 mb-2">
                            <Checkbox checked={multiReturnState[item.id]?.checked || false} onCheckedChange={checked => setMultiReturnState(state => ({ ...state, [item.id]: { ...state[item.id], checked: !!checked } }))} />
                            <div className="flex-1">
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-xs text-muted-foreground">Qté achetée : {item.quantity}</div>
                              {item.quantity > 1 && multiReturnState[item.id]?.checked && (
                                <Input type="number" min={1} max={item.quantity} value={multiReturnState[item.id]?.quantity || 1} onChange={e => setMultiReturnState(state => ({ ...state, [item.id]: { ...state[item.id], quantity: Number(e.target.value) } }))} className="w-20 mt-1" />
                              )}
                              {multiReturnState[item.id]?.checked && (
                                <Input placeholder="Raison du retour" value={multiReturnState[item.id]?.reason || ""} onChange={e => setMultiReturnState(state => ({ ...state, [item.id]: { ...state[item.id], reason: e.target.value } }))} className="mt-1" required />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setMultiReturnModal(null)} disabled={isMultiSubmitting}>Annuler</Button>
                        <Button type="submit" disabled={isMultiSubmitting}>Envoyer</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        );
      })}
      {/* Modale de retour globale (sécurité) */}
    </div>
  );
}
