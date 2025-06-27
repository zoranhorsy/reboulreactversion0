"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetchUserOrders, type Order } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateInvoicePDF } from "@/lib/services/invoiceService";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import axios from "axios";
import { api } from "@/lib/api";
import type { Order as ApiOrder } from "@/lib/api";

interface VariantInfo {
  size?: string;
  color?: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  variant_info?: VariantInfo;
}

interface OrderWithDetails extends ApiOrder {
  items?: OrderItem[];
  variant_info?: VariantInfo;
}

interface ApiResponse {
  data: OrderWithDetails[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-blue-500/10 text-blue-500",
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <span>Clock</span>,
  processing: <span>📦</span>,
  shipped: <span>🚚</span>,
  delivered: <span>CheckCircle2</span>,
  cancelled: <span>XCircle</span>,
};

const getStatusTimeline = (status: string) => {
  const allStatuses = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = allStatuses.indexOf(status);
  if (currentIndex === -1)
    return allStatuses.map((s) => ({ status: s, completed: false }));
  return allStatuses.map((s, i) => ({
    status: s,
    completed: i <= currentIndex,
  }));
};

// Fonction pour générer des données de commandes simulées
const generateMockOrders = (): OrderWithDetails[] => {
  const mockProducts = [
    {
      id: 1,
      name: "Bracelet Aro Argent",
      price: 39.99,
      image_url: "/images/products/bracelet-aro.jpg",
    },
    {
      id: 2,
      name: "Collier Livia Or",
      price: 159.99,
      image_url: "/images/products/collier-livia.jpg",
    },
    {
      id: 3,
      name: "Bague Céleste Diamant",
      price: 249.99,
      image_url: "/images/products/bague-celeste.jpg",
    },
    {
      id: 4,
      name: "Boucles d'oreilles Étoile",
      price: 85.99,
      image_url: "/images/products/boucles-etoile.jpg",
    },
    {
      id: 5,
      name: "Bracelet Harmonie Perles",
      price: 129.99,
      image_url: "/images/products/bracelet-harmonie.jpg",
    },
    {
      id: 6,
      name: "Montre Luna Acier",
      price: 299.99,
      image_url: "/images/products/montre-luna.jpg",
    },
    {
      id: 7,
      name: "Pendentif Soleil Or Rose",
      price: 119.99,
      image_url: "/images/products/pendentif-soleil.jpg",
    },
  ];

  const statuses: Array<
    "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  > = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const statusWeights = [0.2, 0.3, 0.2, 0.2, 0.1]; // Probabilités pour chaque statut

  // Noms français pour les commandes
  const frenchNames = [
    { name: "Jean Dupont", email: "jean.dupont@example.com" },
    { name: "Marie Bernard", email: "marie.bernard@example.com" },
    { name: "Sophie Martin", email: "sophie.martin@example.com" },
    { name: "Thomas Leroy", email: "thomas.leroy@example.com" },
    { name: "Émilie Dubois", email: "emilie.dubois@example.com" },
  ];

  // Adresses françaises
  const frenchAddresses = [
    { street: "23 Rue de la Paix", postal_code: "75001", city: "Paris" },
    {
      street: "15 Avenue des Champs-Élysées",
      postal_code: "75008",
      city: "Paris",
    },
    { street: "42 Boulevard Victor Hugo", postal_code: "69003", city: "Lyon" },
    { street: "8 Rue du Vieux Port", postal_code: "13001", city: "Marseille" },
    {
      street: "5 Place de la Cathédrale",
      postal_code: "67000",
      city: "Strasbourg",
    },
  ];

  // Fonction pour choisir un statut avec les probabilités données
  const selectStatusWithProbability = ():
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled" => {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < statusWeights.length; i++) {
      sum += statusWeights[i];
      if (random < sum) {
        return statuses[i];
      }
    }
    return statuses[0]; // Valeur par défaut
  };

  // Générer 5 à 8 commandes simulées
  const numberOfOrders = Math.floor(Math.random() * 4) + 5; // Entre 5 et 8 commandes

  return Array.from({ length: numberOfOrders }, (_, i) => {
    // Sélectionner un nom et une adresse aléatoires
    const personIndex = Math.floor(Math.random() * frenchNames.length);
    const addressIndex = Math.floor(Math.random() * frenchAddresses.length);
    const person = frenchNames[personIndex];
    const address = frenchAddresses[addressIndex];

    // Nombre aléatoire d'articles par commande (1 à 4)
    const numberOfItems = Math.floor(Math.random() * 4) + 1;

    // Pour éviter les doublons dans les articles
    const selectedProductIndices = new Set<number>();
    while (selectedProductIndices.size < numberOfItems) {
      selectedProductIndices.add(
        Math.floor(Math.random() * mockProducts.length),
      );
    }

    // Créer les articles de la commande
    const orderItems = Array.from(selectedProductIndices).map(
      (productIndex, j) => {
        const product = mockProducts[productIndex];
        const quantity = Math.floor(Math.random() * 2) + 1;

        return {
          id: j + 1,
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: quantity,
          image_url: product.image_url,
          order_id: 101 + i,
        };
      },
    );

    // Calculer le montant total
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Date de création (entre 1 et 60 jours dans le passé)
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60) + 1);

    // Sélection du statut avec pondération
    const status = selectStatusWithProbability();

    // Date de mise à jour (plus récente que la date de création)
    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 48));

    return {
      id: 101 + i,
      user_id: 1,
      status: status,
      total_amount: totalAmount,
      items: orderItems,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      order_number: `ORD-${(101 + i).toString().padStart(5, "0")}`,
      shipping_address: {
        full_name: person.name,
        street: address.street,
        postal_code: address.postal_code,
        city: address.city,
        country: "France",
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`, // Numéro français à 10 chiffres
        id: (i + 1).toString(),
      },
      shipping_info: {
        email: person.email,
        method: Math.random() > 0.7 ? "express" : "standard",
      },
      payment_data: {
        payment_method_types: Math.random() > 0.2 ? ["card"] : ["apple_pay"],
        payment_status: status === "cancelled" ? "cancelled" : "paid",
        stripe_session_id:
          "cs_test_" + Math.random().toString(36).substring(2, 15),
        created: Math.floor(createdAt.getTime() / 1000),
        customer: "cus_" + Math.random().toString(36).substring(2, 12),
      },
      stripe_session_id:
        "cs_test_" + Math.random().toString(36).substring(2, 15),
    };
  });
};

export default function OrderHistory() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null,
  );
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());

  // Fonction pour extraire l'email d'une commande
  const getOrderEmail = (order: OrderWithDetails): string | null => {
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

  // Fonction pour récupérer les commandes de l'utilisateur
  const directFetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");

      console.log("Début de la récupération des commandes...");
      console.log("Token:", token ? "Présent" : "Absent");
      console.log("Email:", userEmail);

      if (!token) {
        console.log(
          "Pas de token d'authentification, impossible de récupérer les commandes",
        );
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        // Récupérer les commandes de l'utilisateur via l'API
        const response = await api.fetchUserOrders();
        console.log("Réponse API fetchUserOrders:", response);

        if (Array.isArray(response) && response.length > 0) {
          console.log(`Traitement de ${response.length} commandes`);
          setOrders(response);
        } else {
          console.log("Aucune commande trouvée");
          setOrders([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Erreur générale:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    directFetchOrders();
  }, [refreshTrigger]);

  // Journalisation basique
  useEffect(() => {
    if (!loading && orders.length > 0) {
      console.log(`${orders.length} commandes chargées`);
    }
  }, [orders, loading]);

  // Actualiser les commandes lors du montage du composant
  useEffect(() => {
    setRefreshTrigger(Date.now());
  }, []);

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) throw new Error("Commande non trouvée");

      const { doc, fileName } = generateInvoicePDF(order);
      doc.save(fileName);

      toast({
        title: "Succès",
        description: "La facture a été téléchargée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.id.toString().includes(searchLower) ||
          (order.shipping_address?.city || "")
            .toLowerCase()
            .includes(searchLower) ||
          (order.items || []).some((item) =>
            item.product_name.toLowerCase().includes(searchLower),
          )
        );
      }
      if (dateRange.start && dateRange.end) {
        const orderDate = new Date(order.created_at);
        return orderDate >= dateRange.start && orderDate <= dateRange.end;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des commandes</CardTitle>
          <CardDescription>Chargement de vos commandes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-lg border animate-pulse bg-muted"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des commandes</CardTitle>
          <CardDescription>
            Aucune commande trouvée dans votre historique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span>📦</span>
            <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Nous n&apos;avons pas trouvé de commandes associées à votre
              compte.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Si vous avez récemment passé une commande via Stripe, elle devrait
              apparaître ici.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                variant="outline"
                onClick={() => setRefreshTrigger(Date.now())}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Actualiser
              </Button>
              <Button asChild>
                <a href="/catalogue">Voir le catalogue</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historique des commandes</CardTitle>
            <CardDescription>Consultez vos commandes passées</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setRefreshTrigger(Date.now());
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Actualiser
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span>⚙️</span>
                  Trier
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Trier par date</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  Plus récentes d&apos;abord
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  Plus anciennes d&apos;abord
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span>🔍</span>
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      {statusIcons[value]}
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message d'information si la commande #80 est présente */}
          {orders.some((order) => order.id === 80) && (
            <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 flex flex-col md:flex-row items-start gap-3">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 flex-shrink-0"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div>
                  <p className="font-medium mb-1">
                    Commandes associées à votre email
                  </p>
                  <p>
                    Les commandes affichées sont associées à l&apos;email{" "}
                    <span className="font-semibold">zxransounds@gmail.com</span>{" "}
                    que vous avez utilisé lors du paiement sur Stripe.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 md:mt-0 md:ml-auto"
                onClick={() => setRefreshTrigger(Date.now())}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Actualiser
              </Button>
            </div>
          )}

          {/* Affichage des résultats de recherche */}
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              {filteredOrders.length} résultat(s) trouvé(s)
            </div>
          )}

          {/* Liste des commandes */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Commande #{order.id}</span>
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status]}
                      >
                        <span className="flex items-center gap-1">
                          {statusIcons[order.status]}
                          {statusLabels[order.status]}
                        </span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(order.total_amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(order.created_at),
                          "d MMMM yyyy 'à' HH:mm",
                          { locale: fr },
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Aperçu des articles */}
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-accent/5 rounded-md flex items-center justify-center shrink-0">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Qté: {item.quantity}</span>
                              {item.variant_info && (
                                <>
                                  {item.variant_info.size && (
                                    <span>
                                      • Taille: {item.variant_info.size}
                                    </span>
                                  )}
                                  {item.variant_info.color && (
                                    <span>
                                      • Couleur: {item.variant_info.color}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-right font-medium">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <p className="text-sm text-muted-foreground">
                        + {order.items!.length - 2} autre
                        {order.items!.length - 2 > 1 ? "s" : ""} article
                        {order.items!.length - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Informations de livraison */}
                  {order.shipping_address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📍</span>
                      <span>
                        Livraison à {order.shipping_address.city},{" "}
                        {order.shipping_address.postal_code}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadInvoice(order.id)}
                      >
                        <span>Receipt</span>
                      </Button>
                      <TooltipTrigger>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadInvoice(order.id)}
                        >
                          <span>Receipt</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Télécharger la facture</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 md:flex-none gap-2"
                  >
                    <span>👁️</span>
                    Détails
                    <span>→</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <span>📦</span>
              <h3 className="text-lg font-medium mb-2">
                Aucune commande n&apos;a été trouvée
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Aucune commande ne correspond à votre recherche."
                  : "Aucune commande ne correspond aux filtres sélectionnés."}
              </p>
            </div>
          )}
        </div>

        <Dialog
          open={selectedOrder !== null}
          onOpenChange={() => setSelectedOrder(null)}
        >
          {selectedOrder && (
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <DialogHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      Commande #{selectedOrder.id}
                      <Badge
                        variant="secondary"
                        className={statusColors[selectedOrder.status]}
                      >
                        <span className="flex items-center gap-1">
                          {statusIcons[selectedOrder.status]}
                          {statusLabels[selectedOrder.status]}
                        </span>
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4">
                      <span>
                        {format(
                          new Date(selectedOrder.created_at),
                          "d MMMM yyyy 'à' HH:mm",
                          { locale: fr },
                        )}
                      </span>
                      <span className="text-primary font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(selectedOrder.total_amount)}
                      </span>
                    </DialogDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(selectedOrder.id)}
                    className="gap-2"
                  >
                    <span>Receipt</span>
                    Télécharger la facture
                  </Button>
                </div>
              </DialogHeader>

              <Tabs
                defaultValue="details"
                className="flex-1 overflow-hidden flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-1"
                  >
                    <span>📦</span>
                    Détails
                  </TabsTrigger>
                  <TabsTrigger
                    value="tracking"
                    className="flex items-center gap-1"
                  >
                    <span>🚚</span>
                    Suivi
                  </TabsTrigger>
                  <TabsTrigger
                    value="receipt"
                    className="flex items-center gap-1"
                  >
                    <span>Receipt</span>
                    Facture
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="details" className="mt-0 p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Articles
                          </h3>
                          <div className="space-y-4">
                            {selectedOrder.items?.map((item) => (
                              <div
                                key={item.id || `item-${Math.random()}`}
                                className="flex justify-between items-start py-2 border-b last:border-0"
                              >
                                <div>
                                  <p className="font-medium">
                                    {item.product_name}
                                  </p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                    <div>
                                      <p>Qté: {item.quantity}</p>
                                    </div>
                                    {item.variant_info && (
                                      <div className="text-xs text-muted-foreground">
                                        {item.variant_info.size && (
                                          <span>
                                            Taille :{" "}
                                            {item.variant_info.size}{" "}
                                          </span>
                                        )}
                                        {item.variant_info.color && (
                                          <span>
                                            Couleur : {item.variant_info.color}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <div>
                                      <p>
                                        Prix:{" "}
                                        {new Intl.NumberFormat("fr-FR", {
                                          style: "currency",
                                          currency: "EUR",
                                        }).format(item.price)}
                                      </p>
                                    </div>
                                  </div>
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
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border space-y-3">
                          <h4 className="font-medium">Récapitulatif</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Sous-total
                              </span>
                              <span>
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(selectedOrder.total_amount * 0.8)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                TVA (20%)
                              </span>
                              <span>
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(selectedOrder.total_amount * 0.2)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span>Total</span>
                              <span>
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(selectedOrder.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {selectedOrder.shipping_address && (
                          <div className="p-4 rounded-lg border">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                              <span>📍</span>
                              Adresse de livraison
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium">
                                {selectedOrder.shipping_address.full_name}
                              </p>
                              <p>{selectedOrder.shipping_address.street}</p>
                              <p>
                                {selectedOrder.shipping_address.postal_code}{" "}
                                {selectedOrder.shipping_address.city}
                              </p>
                              <p>{selectedOrder.shipping_address.country}</p>
                              {selectedOrder.shipping_address.phone && (
                                <p className="mt-2">
                                  Tél: {selectedOrder.shipping_address.phone}
                                </p>
                              )}
                              {getOrderEmail(selectedOrder) && (
                                <p className="mt-2">
                                  Email: {getOrderEmail(selectedOrder)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Informations de paiement Stripe */}
                        {selectedOrder.payment_data && (
                          <div className="p-4 rounded-lg border">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                              <span>CreditCard</span>
                              Informations de paiement
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Méthode
                                </span>
                                <span className="font-medium">
                                  {selectedOrder.payment_data
                                    .payment_method_types?.[0] === "card"
                                    ? "Carte bancaire"
                                    : selectedOrder.payment_data
                                        .payment_method_types?.[0] || "Stripe"}
                                </span>
                              </div>

                              {selectedOrder.payment_data.payment_status && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Statut
                                  </span>
                                  <Badge
                                    variant={
                                      selectedOrder.payment_data
                                        .payment_status === "paid"
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {selectedOrder.payment_data
                                      .payment_status === "paid"
                                      ? "Payé"
                                      : selectedOrder.payment_data
                                          .payment_status}
                                  </Badge>
                                </div>
                              )}

                              {selectedOrder.payment_data.stripe_session_id && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    ID de session
                                  </span>
                                  <span
                                    className="font-mono text-xs truncate max-w-[180px]"
                                    title={
                                      selectedOrder.payment_data
                                        .stripe_session_id
                                    }
                                  >
                                    {selectedOrder.payment_data.stripe_session_id.substring(
                                      0,
                                      14,
                                    )}
                                    ...
                                  </span>
                                </div>
                              )}

                              {selectedOrder.stripe_session_id && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Session Stripe
                                  </span>
                                  <span
                                    className="font-mono text-xs truncate max-w-[180px]"
                                    title={selectedOrder.stripe_session_id}
                                  >
                                    {selectedOrder.stripe_session_id.substring(
                                      0,
                                      14,
                                    )}
                                    ...
                                  </span>
                                </div>
                              )}

                              {selectedOrder.payment_data.created && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Date
                                  </span>
                                  <span>
                                    {format(
                                      new Date(
                                        selectedOrder.payment_data.created *
                                          1000,
                                      ),
                                      "d MMMM yyyy 'à' HH:mm",
                                      { locale: fr },
                                    )}
                                  </span>
                                </div>
                              )}

                              {selectedOrder.payment_data.customer && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Client Stripe
                                  </span>
                                  <span
                                    className="font-mono text-xs truncate max-w-[180px]"
                                    title={selectedOrder.payment_data.customer}
                                  >
                                    {selectedOrder.payment_data.customer.substring(
                                      0,
                                      14,
                                    )}
                                    ...
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4 rounded-lg border space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <span>Clock</span>
                            Historique de la commande
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-4 h-4 rounded-full bg-primary" />
                              <div>
                                <p className="font-medium">Commande passée</p>
                                <p className="text-muted-foreground">
                                  {format(
                                    new Date(selectedOrder.created_at),
                                    "d MMMM yyyy 'à' HH:mm",
                                    { locale: fr },
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div
                                className={`w-4 h-4 rounded-full ${selectedOrder.status !== "pending" ? "bg-primary" : "bg-muted"}`}
                              />
                              <div>
                                <p className="font-medium">
                                  Commande confirmée
                                </p>
                                <p className="text-muted-foreground">
                                  {selectedOrder.status !== "pending"
                                    ? format(
                                        new Date(selectedOrder.updated_at),
                                        "d MMMM yyyy 'à' HH:mm",
                                        { locale: fr },
                                      )
                                    : "En attente"}
                                </p>
                              </div>
                            </div>
                            {selectedOrder.status === "shipped" && (
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-4 h-4 rounded-full bg-primary" />
                                <div>
                                  <p className="font-medium">
                                    Commande expédiée
                                  </p>
                                  <p className="text-muted-foreground">
                                    {format(
                                      new Date(selectedOrder.updated_at),
                                      "d MMMM yyyy 'à' HH:mm",
                                      { locale: fr },
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-muted space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <span>⚠️</span>
                            Besoin d&apos;aide ?
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Si vous avez des questions concernant votre
                            commande, n&apos;hésitez pas à contacter notre
                            service client.
                          </p>
                          <Button variant="outline" className="w-full">
                            Contacter le support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tracking" className="mt-0 p-6">
                    <div className="max-w-2xl mx-auto space-y-8">
                      {selectedOrder.status !== "cancelled" ? (
                        <>
                          <div className="relative">
                            {getStatusTimeline(selectedOrder.status).map(
                              (step, index) => (
                                <div
                                  key={step.status}
                                  className="flex items-center mb-12 last:mb-0"
                                >
                                  <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                      step.completed
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {statusIcons[step.status]}
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <h4 className="font-medium">
                                      {statusLabels[step.status]}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {step.completed
                                        ? format(
                                            new Date(selectedOrder.updated_at),
                                            "d MMMM yyyy 'à' HH:mm",
                                            { locale: fr },
                                          )
                                        : "À venir"}
                                    </p>
                                  </div>
                                  {index <
                                    getStatusTimeline(selectedOrder.status)
                                      .length -
                                      1 && (
                                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border -ml-px h-8" />
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                          <div className="p-4 rounded-lg border bg-muted">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>⚠️</span>
                              <p>
                                Le suivi est mis à jour toutes les 30 minutes
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <span>XCircle</span>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            Commande annulée
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Cette commande a été annulée le{" "}
                            {format(
                              new Date(selectedOrder.updated_at),
                              "d MMMM yyyy 'à' HH:mm",
                              { locale: fr },
                            )}
                          </p>
                          <Button variant="outline" className="mt-6">
                            Contacter le support
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="receipt" className="mt-0 p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="p-6 rounded-lg border space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                              Facture #{selectedOrder.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Émise le{" "}
                              {format(
                                new Date(selectedOrder.created_at),
                                "d MMMM yyyy",
                                { locale: fr },
                              )}
                            </p>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleDownloadInvoice(selectedOrder.id)
                            }
                            className="gap-2"
                          >
                            <span>Download</span>
                            Télécharger
                          </Button>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">
                              Adresse de facturation
                            </h4>
                            {selectedOrder.shipping_address && (
                              <div className="text-sm space-y-1">
                                <p className="font-medium">
                                  {selectedOrder.shipping_address.street}
                                </p>
                                <p className="text-muted-foreground">
                                  {selectedOrder.shipping_address.postal_code}{" "}
                                  {selectedOrder.shipping_address.city}
                                </p>
                                <p className="text-muted-foreground">
                                  {selectedOrder.shipping_address.country}
                                </p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              Informations de paiement
                            </h4>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="text-muted-foreground">
                                  Méthode :
                                </span>{" "}
                                <span className="font-medium">
                                  Carte bancaire
                                </span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">
                                  Date :
                                </span>{" "}
                                <span className="font-medium">
                                  {format(
                                    new Date(selectedOrder.created_at),
                                    "d MMMM yyyy",
                                    { locale: fr },
                                  )}
                                </span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">
                                  Statut :
                                </span>{" "}
                                <span className="font-medium text-green-600">
                                  Payé
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-4">
                            Détail des articles
                          </h4>
                          <div className="space-y-2">
                            {selectedOrder.items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <div>
                                  <span className="font-medium">
                                    {item.product_name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    × {item.quantity}
                                  </span>
                                </div>
                                <span>
                                  {new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                  }).format(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Sous-total
                            </span>
                            <span>
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(selectedOrder.total_amount * 0.8)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              TVA (20%)
                            </span>
                            <span>
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(selectedOrder.total_amount * 0.2)}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(selectedOrder.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Pour toute question concernant cette facture,
                          contactez notre service client
                        </p>
                        <Button variant="link" className="mt-2">
                          Contacter le support
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
}
