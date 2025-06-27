"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api, type Order, fetchUsers } from "@/lib/api";
import { type User } from "next-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortConfig = {
  key: keyof Order;
  direction: "ascending" | "descending";
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

interface ShippingAddress {
  street?: string;
  address?: string;
  postal_code?: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<
    Record<string, { name: string; email: string }>
  >({});
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "descending",
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const { toast } = useToast();

  // Fonction pour extraire l'email d'une commande depuis différents endroits
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

  // Fonction pour extraire le nom du client d'une commande depuis différents endroits
  const getOrderCustomerName = (order: Order): string | null => {
    // Vérifier dans payment_data
    if (order.payment_data?.customerName) {
      return order.payment_data.customerName;
    }

    // Vérifier dans customer_info (objet)
    if (order.customer_info && typeof order.customer_info === "object") {
      const info = order.customer_info as any;

      // Vérifier si name existe directement
      if (info.name) return info.name;

      // Essayer de combiner first_name et last_name
      if (info.firstName && info.lastName) {
        return `${info.firstName} ${info.lastName}`;
      }
      if (info.first_name && info.last_name) {
        return `${info.first_name} ${info.last_name}`;
      }
    }

    // Vérifier dans customer_info (string)
    if (order.customer_info && typeof order.customer_info === "string") {
      try {
        const parsed = JSON.parse(order.customer_info);

        if (parsed.name) return parsed.name;

        if (parsed.firstName && parsed.lastName) {
          return `${parsed.firstName} ${parsed.lastName}`;
        }
        if (parsed.first_name && parsed.last_name) {
          return `${parsed.first_name} ${parsed.last_name}`;
        }
      } catch (e) {
        console.warn("Erreur parsing customer_info pour le nom", e);
      }
    }

    // Vérifier dans shipping_info
    if (order.shipping_info) {
      if (order.shipping_info.firstName && order.shipping_info.lastName) {
        return `${order.shipping_info.firstName} ${order.shipping_info.lastName}`;
      }
      if (order.shipping_info.first_name && order.shipping_info.last_name) {
        return `${order.shipping_info.first_name} ${order.shipping_info.last_name}`;
      }
    }

    // Vérifier dans shipping_address
    if (order.shipping_address && order.shipping_address.full_name) {
      return order.shipping_address.full_name;
    }

    return null;
  };

  const loadUsers = useCallback(async () => {
    try {
      const usersData = await fetchUsers();
      const usersMap: Record<string, { name: string; email: string }> = {};
      usersData.forEach((user) => {
        usersMap[user.id] = { name: user.username, email: user.email };
      });

      setUsers(usersMap);
      setAllUsers(usersData);
      console.log("Utilisateurs chargés:", usersData.length);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations des utilisateurs.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.fetchOrders();
      console.log("Réponse API complète:", response);

      if (response && response.data) {
        console.log("Commandes chargées:", response.data.length);

        // Récupérer les détails de chaque commande pour obtenir les articles (items)
        const ordersWithDetails = await Promise.all(
          response.data.map(async (order) => {
            try {
              console.log(
                `Récupération des détails pour la commande #${order.id}`,
              );
              const orderDetails = await api.getOrderById(order.id.toString());
              if (!orderDetails) {
                console.error(
                  `Aucun détail trouvé pour la commande #${order.id}`,
                );
                return;
              }
              console.log(`Détails complets de la commande #${order.id}:`, {
                orderDetails,
                shipping_address: orderDetails.shipping_address,
              });

              // Vérifier shipping_address
              let shippingAddress = null;

              if (orderDetails.shipping_address) {
                shippingAddress = orderDetails.shipping_address;
              }

              // Parser l'adresse si c'est une chaîne
              if (typeof shippingAddress === "string") {
                try {
                  shippingAddress = JSON.parse(shippingAddress);
                  console.log(
                    `Adresse parsée pour la commande #${order.id}:`,
                    shippingAddress,
                  );
                } catch (err) {
                  console.error(
                    `Erreur de parsing de l'adresse pour la commande #${order.id}:`,
                    err,
                  );
                  shippingAddress = null;
                }
              }

              // Vérifier si l'adresse est un objet valide
              if (shippingAddress && typeof shippingAddress === "object") {
                console.log(
                  `Adresse finale pour la commande #${order.id}:`,
                  shippingAddress,
                );
              } else {
                console.log(
                  `Pas d'adresse valide trouvée pour la commande #${order.id}`,
                );
                shippingAddress = null;
              }

              return {
                ...order,
                ...orderDetails,
                shipping_address: shippingAddress,
              };
            } catch (error) {
              console.error(
                `Erreur lors de la récupération des détails pour la commande #${order.id}:`,
                error,
              );
              return order;
            }
          }),
        );

        console.log("Commandes avec détails complets:", ordersWithDetails);
        const validOrders = ordersWithDetails.filter(
          (order): order is Order => order !== undefined,
        );
        setOrders(validOrders);
        setFilteredOrders(validOrders);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes.",
        variant: "destructive",
      });
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrders();
    loadUsers();
  }, [loadOrders, loadUsers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterOrders(value, statusFilter, userFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterOrders(searchTerm, status, userFilter);
  };

  const handleUserFilter = (userId: string) => {
    setUserFilter(userId);
    filterOrders(searchTerm, statusFilter, userId);
  };

  const filterOrders = (
    search: string,
    status: string,
    userId: string = userFilter,
  ) => {
    let filtered = [...orders];

    // Filtre par recherche
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(search) ||
          order.user_id.toString().includes(search) ||
          (users[order.user_id]?.name &&
            users[order.user_id].name
              .toLowerCase()
              .includes(search.toLowerCase())) ||
          (users[order.user_id]?.email &&
            users[order.user_id].email
              .toLowerCase()
              .includes(search.toLowerCase())),
      );
    }

    // Filtre par statut
    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status);
    }

    // Filtre par utilisateur
    if (userId !== "all") {
      filtered = filtered.filter(
        (order) => order.user_id.toString() === userId,
      );
    }

    setFilteredOrders(filtered);
  };

  const handleSort = (key: keyof Order) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const getSortIcon = (key: keyof Order) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <span>↑</span>
    ) : (
      <span>↓</span>
    );
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key === "created_at") {
      const dateA = new Date(a[sortConfig.key]).getTime();
      const dateB = new Date(b[sortConfig.key]).getTime();
      return sortConfig.direction === "ascending"
        ? dateA - dateB
        : dateB - dateA;
    }

    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    if (valueA === undefined && valueB === undefined) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;

    if (valueA < valueB) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast({
        title: "Succès",
        description: "Le statut de la commande a été mis à jour.",
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande.",
        variant: "destructive",
      });
    }
  };

  const formatAmount = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return "0.00 €";
    return `${Number(amount).toFixed(2)} €`;
  };

  const validateShippingAddress = (
    address: unknown,
  ): address is ShippingAddress => {
    if (!address) {
      console.log("Adresse manquante (null ou undefined)");
      return false;
    }

    console.log("Validating address:", address);
    console.log("Address type:", typeof address);

    // Si l'adresse est une chaîne JSON, essayer de la parser
    let parsedAddress: unknown = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
        console.log("Adresse parsée depuis la chaîne:", parsedAddress);
      } catch (err) {
        console.error("Échec du parsing de la chaîne d'adresse:", err);
        return false;
      }
    }

    // Vérifier si l'adresse est un objet
    if (
      !parsedAddress ||
      typeof parsedAddress !== "object" ||
      parsedAddress === null
    ) {
      console.error("L'adresse n'est pas un objet valide:", parsedAddress);
      return false;
    }

    const addr = parsedAddress as Record<string, unknown>;

    // Vérifier en priorité les champs hasAddress et isValid si disponibles
    if (addr.hasAddress === true && addr.isValid === true) {
      console.log("Adresse valide selon les champs hasAddress et isValid");
      return true;
    }

    // Vérifier si address existe et est une chaîne non vide
    if (
      addr.address &&
      typeof addr.address === "string" &&
      addr.address.trim() !== ""
    ) {
      console.log("Adresse valide selon le champ address");
      return true;
    }

    // Vérification alternative avec les champs requis traditionnels
    const hasRequiredFields =
      !!(addr.address || addr.street) && // Accepter soit address soit street
      (typeof addr.city === "string" || typeof addr.postal_code === "string"); // Accepter soit city soit postal_code

    if (hasRequiredFields) {
      console.log("Adresse valide selon les champs requis traditionnels");
      return true;
    }

    console.warn("Adresse invalide, champs manquants:", {
      hasAddress: addr.hasAddress,
      isValid: addr.isValid,
      address: addr.address,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
    });

    return false;
  };

  const renderShippingAddress = (order: Order) => {
    console.log(`Rendu adresse pour commande #${order.id}:`, {
      hasAddress: order.shipping_info?.hasAddress || false,
      address: order.shipping_info?.address || order.shipping_address?.street,
      addressType: order.shipping_info?.addressType || "undefined",
      isValid:
        order.shipping_info?.isValid ||
        validateShippingAddress(order.shipping_address),
    });

    // Vérifier d'abord shipping_info (format du backend)
    if (order.shipping_info && order.shipping_info.hasAddress === true) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Adresse complète
            </Badge>
            {order.shipping_info.deliveryType && (
              <Badge variant="outline" className="text-xs">
                {order.shipping_info.deliveryType}
              </Badge>
            )}
          </div>
          <div className="text-sm">
            <p className="font-medium">
              {order.shipping_info.address || "Non spécifiée"}
            </p>
            <p>
              {order.shipping_info.postalCode || ""}{" "}
              {order.shipping_info.city || ""}
            </p>
            <p className="text-muted-foreground">
              {order.shipping_info.country || ""}
            </p>
            {order.shipping_info.phone && (
              <p className="text-muted-foreground mt-2">
                Tél: {order.shipping_info.phone}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Si pas de shipping_info, vérifier shipping_address (ancien format)
    if (!order.shipping_address) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Adresse manquante
            </Badge>
          </div>
          <div className="text-sm">
            <p className="text-red-600 font-medium">Action requise</p>
            <p className="text-muted-foreground text-xs mt-1">
              Cette commande nécessite une adresse de livraison pour être
              expédiée.
            </p>
          </div>
        </div>
      );
    }

    // Si l'adresse est une chaîne JSON, essayer de la parser
    let address: unknown = order.shipping_address;
    if (typeof address === "string") {
      try {
        address = JSON.parse(address);
      } catch (err) {
        console.error("Échec du parsing de l'adresse:", err);
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                Format d&apos;adresse invalide
              </Badge>
            </div>
            <div className="text-sm">
              <p className="text-red-600 font-medium">Erreur de format</p>
              <p className="text-muted-foreground text-xs mt-1">
                L&apos;adresse de livraison n&apos;est pas dans un format
                valide.
              </p>
            </div>
          </div>
        );
      }
    }

    if (!validateShippingAddress(address)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="destructive"
              className="bg-yellow-100 text-yellow-800"
            >
              Adresse incomplète
            </Badge>
          </div>
          <div className="text-sm">
            <p className="text-yellow-600 font-medium">Vérification requise</p>
            <p className="text-muted-foreground text-xs mt-1">
              Certaines informations de livraison sont manquantes.
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded-md">
            <p className="font-medium">Adresse partielle disponible:</p>
            <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-24 text-xs">
              {JSON.stringify(address, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    // À ce stade, nous avons une adresse valide
    const validatedAddress = address as ShippingAddress;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Adresse complète
          </Badge>
        </div>
        <div className="text-sm">
          <p className="font-medium">
            {validatedAddress.street || "Non spécifiée"}
          </p>
          <p>
            {validatedAddress.postal_code || ""} {validatedAddress.city || ""}
          </p>
          <p className="text-muted-foreground">
            {validatedAddress.country || ""}
          </p>
          {validatedAddress.phone && (
            <p className="text-muted-foreground mt-2">
              Tél: {validatedAddress.phone}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des commandes</CardTitle>
          <CardDescription>
            Gérez et suivez toutes les commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <span>🔍</span>
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={handleUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[150px]">
                          {user.username}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {isLoading ? (
                <div className="col-span-full text-center h-24 flex items-center justify-center">
                  Chargement...
                </div>
              ) : sortedOrders.length === 0 ? (
                <div className="col-span-full text-center h-24 flex items-center justify-center">
                  Aucune commande trouvée
                </div>
              ) : (
                sortedOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order.id}</span>
                            <Badge
                              variant="secondary"
                              className={statusColors[order.status]}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col text-xs text-muted-foreground">
                            <span>
                              Créée le:{" "}
                              {format(new Date(order.created_at), "Pp", {
                                locale: fr,
                              })}
                            </span>
                            {order.updated_at &&
                              order.updated_at !== order.created_at && (
                                <span>
                                  Modifiée le:{" "}
                                  {format(new Date(order.updated_at), "Pp", {
                                    locale: fr,
                                  })}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {formatAmount(order.total_amount)}
                          </div>
                          {order.shipping_cost && (
                            <div className="text-xs text-muted-foreground">
                              Dont livraison:{" "}
                              {formatAmount(order.shipping_cost)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Informations client */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Client
                          </span>
                          <Badge variant="outline" className="text-xs">
                            ID: {order.user_id}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">
                            {users[order.user_id]?.name ||
                              getOrderCustomerName(order) ||
                              `Client #${order.user_id}`}
                          </p>
                          <p className="text-muted-foreground">
                            {users[order.user_id]?.email ||
                              getOrderEmail(order) ||
                              "Email non disponible"}
                          </p>
                        </div>
                      </div>

                      {/* Produits commandés */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Produits
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {order.items?.length || 0} article
                            {order.items?.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {!order.items || order.items.length === 0 ? (
                            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                              <p>Aucun produit dans cette commande</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                La commande ne contient aucun article.
                              </p>
                            </div>
                          ) : (
                            <>
                              {order.items.slice(0, 3).map((item) => (
                                <div
                                  key={item.id || `item-${Math.random()}`}
                                  className="flex justify-between items-start text-sm py-1"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate">
                                      {item.product_name}
                                    </p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                      <div>
                                        <p>Qté: {item.quantity}</p>
                                      </div>
                                      <div>
                                        <p>Prix: {formatAmount(item.price)}</p>
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
                                              Couleur :{" "}
                                              {item.variant_info.color}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {formatAmount(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                                  <span>
                                    +{order.items.length - 3} autre
                                    {order.items.length - 3 > 1 ? "s" : ""}{" "}
                                    article
                                    {order.items.length - 3 > 1 ? "s" : ""}
                                  </span>
                                  <span>
                                    Total: {formatAmount(order.total_amount)}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Adresse de livraison */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Adresse de livraison
                        </span>
                        {order.shipping_address &&
                          validateShippingAddress(order.shipping_address) && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              Adresse complète
                            </Badge>
                          )}
                      </div>
                      {renderShippingAddress(order)}
                    </CardContent>

                    <CardFooter>
                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(order.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <Badge
                                variant="secondary"
                                className={statusColors[order.status]}
                              >
                                {order.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="processing">En cours</SelectItem>
                            <SelectItem value="shipped">Expédiée</SelectItem>
                            <SelectItem value="delivered">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <span>👁️</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Détails de la commande #{order.id}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Informations client
                                    </h4>
                                    <div className="space-y-1">
                                      <p>ID Client: {selectedOrder.user_id}</p>
                                      <p>
                                        Nom:{" "}
                                        {users[selectedOrder.user_id]?.name ||
                                          getOrderCustomerName(selectedOrder) ||
                                          "Non spécifié"}
                                      </p>
                                      <p>
                                        Email:{" "}
                                        {users[selectedOrder.user_id]?.email ||
                                          getOrderEmail(selectedOrder) ||
                                          "Non spécifié"}
                                      </p>
                                      {getOrderCustomerName(selectedOrder) &&
                                        !users[selectedOrder.user_id]?.name && (
                                          <p className="text-xs text-blue-600 mt-1">
                                            Nom du client Stripe:{" "}
                                            {getOrderCustomerName(
                                              selectedOrder,
                                            )}
                                          </p>
                                        )}
                                      {getOrderEmail(selectedOrder) &&
                                        !users[selectedOrder.user_id]
                                          ?.email && (
                                          <p className="text-xs text-blue-600 mt-1">
                                            Email de commande Stripe:{" "}
                                            {getOrderEmail(selectedOrder)}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Statut et dates
                                    </h4>
                                    <div className="space-y-1">
                                      <p>
                                        Statut:{" "}
                                        <Badge
                                          variant="secondary"
                                          className={
                                            statusColors[selectedOrder.status]
                                          }
                                        >
                                          {selectedOrder.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        Créée le:{" "}
                                        {format(
                                          new Date(selectedOrder.created_at),
                                          "Pp",
                                          { locale: fr },
                                        )}
                                      </p>
                                      {selectedOrder.updated_at &&
                                        selectedOrder.updated_at !==
                                          selectedOrder.created_at && (
                                          <p>
                                            Modifiée le:{" "}
                                            {format(
                                              new Date(
                                                selectedOrder.updated_at,
                                              ),
                                              "Pp",
                                              { locale: fr },
                                            )}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">
                                    Produits commandés
                                  </h4>
                                  <div className="space-y-2">
                                    {!selectedOrder.items ||
                                    selectedOrder.items.length === 0 ? (
                                      <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded">
                                        <p className="font-medium">
                                          Aucun produit dans cette commande
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Cette commande ne contient aucun
                                          article. Cela peut indiquer un
                                          problème avec les données.
                                        </p>
                                      </div>
                                    ) : (
                                      selectedOrder.items.map((item) => (
                                        <div
                                          key={
                                            item.id || `item-${Math.random()}`
                                          }
                                          className="flex justify-between items-center py-2 border-b last:border-0"
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
                                                      {
                                                        item.variant_info.size
                                                      }{" "}
                                                    </span>
                                                  )}
                                                  {item.variant_info.color && (
                                                    <span>
                                                      Couleur :{" "}
                                                      {item.variant_info.color}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                              <div>
                                                <p>
                                                  Prix:{" "}
                                                  {formatAmount(item.price)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">
                                              {formatAmount(
                                                item.price * item.quantity,
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Adresse de livraison
                                    </h4>
                                    {renderShippingAddress(selectedOrder)}
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Récapitulatif
                                    </h4>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span>Sous-total</span>
                                        <span>
                                          {formatAmount(
                                            selectedOrder.total_amount -
                                              (selectedOrder.shipping_cost ||
                                                0),
                                          )}
                                        </span>
                                      </div>
                                      {selectedOrder.shipping_cost && (
                                        <div className="flex justify-between">
                                          <span>Livraison</span>
                                          <span>
                                            {formatAmount(
                                              selectedOrder.shipping_cost,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-medium pt-1 border-t">
                                        <span>Total</span>
                                        <span>
                                          {formatAmount(
                                            selectedOrder.total_amount,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
