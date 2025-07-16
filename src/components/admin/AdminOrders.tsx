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
import { type User as NextAuthUser } from "next-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { 
  User, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Phone,
  Mail,
  Euro
} from "lucide-react";

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
  const [allUsers, setAllUsers] = useState<NextAuthUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "descending",
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  
  // Nouveaux states pour la gestion des numéros de suivi
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Nouveaux states pour la modale de validation
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationOrder, setValidationOrder] = useState<Order | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [stockNotes, setStockNotes] = useState("");

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

  // Fonction pour extraire le numéro de téléphone du client d'une commande
  const getOrderCustomerPhone = (order: Order): string | null => {
    // Vérifier dans shipping_info
    if (order.shipping_info?.phone) {
      return order.shipping_info.phone;
    }

    // Vérifier dans customer_info (objet)
    if (order.customer_info && typeof order.customer_info === "object") {
      const info = order.customer_info as any;
      if (info.phone) return info.phone;
      if (info.phoneNumber) return info.phoneNumber;
      if (info.phone_number) return info.phone_number;
    }

    // Vérifier dans customer_info (string)
    if (order.customer_info && typeof order.customer_info === "string") {
      try {
        const parsed = JSON.parse(order.customer_info);
        if (parsed.phone) return parsed.phone;
        if (parsed.phoneNumber) return parsed.phoneNumber;
        if (parsed.phone_number) return parsed.phone_number;
      } catch (e) {
        console.warn("Erreur parsing customer_info pour le téléphone", e);
      }
    }

    // Vérifier dans payment_data
    if (order.payment_data?.customerPhone) {
      return order.payment_data.customerPhone;
    }

    // Vérifier dans shipping_address
    if (order.shipping_address?.phone) {
      return order.shipping_address.phone;
    }

    // Vérifier dans metadata
    if (order.metadata) {
      try {
        const metadata = typeof order.metadata === "string" 
          ? JSON.parse(order.metadata) 
          : order.metadata;
        if (metadata.phone) return metadata.phone;
        if (metadata.customer_phone) return metadata.customer_phone;
      } catch (e) {
        console.warn("Erreur parsing metadata pour le téléphone", e);
      }
    }

    return null;
  };

  // Fonction pour extraire le payment_intent_id depuis une commande
  const getOrderPaymentIntentId = async (order: Order): Promise<string | null> => {
    // Vérifier dans payment_data
    if (order.payment_data?.payment_intent_id) {
      return order.payment_data.payment_intent_id;
    }

    // Vérifier dans metadata
    if (order.metadata) {
      try {
        const metadata = typeof order.metadata === "string" 
          ? JSON.parse(order.metadata) 
          : order.metadata;
        if (metadata.payment_intent_id) return metadata.payment_intent_id;
        if (metadata.payment_intent) return metadata.payment_intent;
      } catch (e) {
        console.warn("Erreur parsing metadata pour payment_intent_id", e);
      }
    }

    // Si on a une stripe_session_id, récupérer le PaymentIntent via l'API
    const sessionId = order.stripe_session_id || order.payment_data?.stripe_session_id;
    if (sessionId) {
      try {
        console.log(`🔍 Récupération du PaymentIntent depuis la session: ${sessionId}`);
        
        const response = await fetch('/api/stripe/get-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          console.log(`✅ PaymentIntent trouvé via session:`, result.payment_intent.id);
          return result.payment_intent.id;
        } else {
          console.warn(`⚠️ Impossible de récupérer le PaymentIntent depuis la session:`, result.error);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du PaymentIntent:", error);
      }
    }

    return null;
  };

  // Fonction pour capturer un paiement Stripe
  const captureStripePayment = async (paymentIntentId: string): Promise<boolean> => {
    try {
      console.log(`🔄 Capture du paiement Stripe: ${paymentIntentId}`);
      
      const response = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Si l'erreur indique que le paiement est déjà capturé, ce n'est pas une erreur
        if (result.error && result.error.includes('succeeded')) {
          console.log(`✅ Paiement déjà capturé (ancien workflow):`, paymentIntentId);
          return true;
        }
        throw new Error(result.error || 'Erreur lors de la capture');
      }

      console.log(`✅ Paiement capturé avec succès:`, result);
      return true;
    } catch (error) {
      console.error('❌ Erreur capture paiement:', error);
      
      // Si l'erreur indique que le paiement est déjà capturé, ce n'est pas une erreur
      if (error instanceof Error && error.message.includes('succeeded')) {
        console.log(`✅ Paiement déjà capturé (ancien workflow):`, paymentIntentId);
        return true;
      }
      
      throw error;
    }
  };

  // Fonction pour annuler un paiement Stripe
  const cancelStripePayment = async (paymentIntentId: string, reason: string = 'duplicate'): Promise<boolean> => {
    try {
      console.log(`🔄 Annulation du paiement Stripe: ${paymentIntentId}`);
      
      const response = await fetch('/api/stripe/cancel-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          cancellation_reason: reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'annulation');
      }

      console.log(`✅ Paiement annulé avec succès:`, result);
      return true;
    } catch (error) {
      console.error('❌ Erreur annulation paiement:', error);
      throw error;
    }
  };

  // Fonction pour mettre à jour le stock des produits
  const updateProductStock = async (order: Order): Promise<boolean> => {
    try {
      if (!order.items || order.items.length === 0) {
        console.warn(`⚠️ Aucun article trouvé dans la commande #${order.id}`);
        return true; // Ne pas échouer si pas d'articles
      }

      console.log(`📦 Mise à jour du stock pour la commande #${order.id}`);
      
      // Préparer les données pour l'API
      const stockItems = order.items.map(item => ({
        product_id: item.product_id?.toString() || item.id?.toString(),
        variant_info: {
          size: item.variant_info?.size,
          color: item.variant_info?.color
        },
        quantity: item.quantity
      }));

      const response = await fetch('/api/products/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: stockItems,
          order_id: order.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du stock');
      }

      console.log(`✅ Stock mis à jour avec succès:`, result.summary);
      
      // Afficher les erreurs partielles si il y en a
      if (result.errors && result.errors.length > 0) {
        console.warn(`⚠️ Certains articles n'ont pas pu être mis à jour:`, result.errors);
        toast({
          title: "Stock partiellement mis à jour",
          description: `${result.summary.successful_updates}/${result.summary.total_items} articles mis à jour. Vérifiez les logs.`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour stock:', error);
      throw error;
    }
  };

  // Fonction pour envoyer les emails de notification
  const sendOrderEmail = async (order: Order, type: 'pending' | 'confirmed' | 'cancelled'): Promise<boolean> => {
    try {
      const customerEmail = getOrderEmail(order);
      const customerName = getOrderCustomerName(order);

      if (!customerEmail) {
        console.warn(`⚠️ Aucun email trouvé pour la commande #${order.id}`);
        return false;
      }

      console.log(`📧 Envoi d'email ${type} pour la commande #${order.id} à ${customerEmail}`);

      const emailData = {
        order_id: order.id.toString(),
        order_number: order.order_number || order.id.toString(),
        customer_name: customerName || 'Client',
        customer_email: customerEmail,
        total_amount: order.total_amount,
        items: order.items?.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          variant_info: item.variant_info
        })) || [],
        type
      };

      const response = await fetch('/api/orders/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email');
      }

      console.log(`✅ Email ${type} envoyé avec succès:`, result);
      return true;
    } catch (error) {
      console.error(`❌ Erreur envoi email ${type}:`, error);
      throw error;
    }
  };

  // Fonction pour confirmer les réservations de stock (transformer en stock réel)
  const confirmStockReservations = async (order: Order): Promise<boolean> => {
    try {
      console.log(`🔒 Confirmation des réservations pour la commande #${order.id}`);

      // Libérer les réservations (elles seront transformées en stock réel par updateProductStock)
      const response = await fetch(`/api/products/reserve-stock?order_id=${order.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn(`⚠️ Impossible de libérer les réservations:`, result.error);
        // Ne pas échouer si les réservations ne peuvent pas être libérées
        return true;
      }

      console.log(`✅ ${result.released_reservations} réservations confirmées pour la commande #${order.id}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur confirmation réservations:', error);
      // Ne pas échouer le processus de validation pour les réservations
      return true;
    }
  };

  // Fonction pour libérer les réservations de stock (annulation)
  const releaseStockReservations = async (order: Order): Promise<boolean> => {
    try {
      console.log(`🔓 Libération des réservations pour la commande #${order.id}`);

      const response = await fetch(`/api/products/reserve-stock?order_id=${order.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn(`⚠️ Impossible de libérer les réservations:`, result.error);
        // Ne pas échouer si les réservations ne peuvent pas être libérées
        return true;
      }

      console.log(`✅ ${result.released_reservations} réservations libérées pour la commande #${order.id}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur libération réservations:', error);
      // Ne pas faire échouer le processus d'annulation pour les réservations
      return true;
    }
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
    // Si le nouveau statut est "processing", ouvrir la modal de validation
    if (newStatus === "processing") {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setValidationOrder(order);
        setStockNotes("");
        setShowValidationModal(true);
        return;
      }
    }

    // Si le nouveau statut est "shipped", ouvrir la modal pour le numéro de suivi
    if (newStatus === "shipped") {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setTrackingOrder(order);
        setNewStatus(newStatus);
        setTrackingNumber(order.tracking_number || "");
        setCarrier(order.carrier || "Colissimo");
        setShowTrackingModal(true);
        return;
      }
    }

    // Pour les autres statuts, mettre à jour directement
    await updateOrderStatus(orderId, newStatus);
  };

  const updateOrderStatus = async (orderId: number, status: string, trackingData?: { tracking_number?: string; carrier?: string }) => {
    try {
      // Utiliser le nouveau format avec support du tracking si disponible
      if (trackingData && trackingData.tracking_number) {
        await api.updateOrderStatus(orderId, {
          status,
          tracking_number: trackingData.tracking_number,
          carrier: trackingData.carrier
        });
      } else {
        await api.updateOrderStatus(orderId, status);
      }
      
      const statusLabels: Record<string, string> = {
        pending: "En attente",
        processing: "En cours",
        shipped: "Expédiée",
        delivered: "Livrée",
        cancelled: "Annulée"
      };

      toast({
        title: "Succès",
        description: `Statut mis à jour vers "${statusLabels[status] || status}"${trackingData?.tracking_number ? ` avec le numéro de suivi ${trackingData.tracking_number}` : ''}`,
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

  const handleTrackingSubmit = async () => {
    if (!trackingOrder) return;

    await updateOrderStatus(trackingOrder.id, newStatus, {
      tracking_number: trackingNumber,
      carrier: carrier
    });

    setShowTrackingModal(false);
    setTrackingOrder(null);
    setTrackingNumber("");
    setCarrier("");
    setNewStatus("");
  };

  const handleSendTrackingEmail = async (order: Order) => {
    if (!order.tracking_number) {
      toast({
        title: "Erreur",
        description: "Aucun numéro de suivi disponible pour cette commande.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.sendTrackingEmail(order.id, order.tracking_number, order.carrier);
      toast({
        title: "Succès",
        description: "Email de suivi envoyé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de suivi.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour valider la commande (passage à "processing")
  const handleValidateOrder = async () => {
    if (!validationOrder) return;

    setIsValidating(true);
    try {
      // 1. Vérifier si on peut capturer le paiement
      const paymentIntentId = await getOrderPaymentIntentId(validationOrder);
      
      if (!paymentIntentId) {
        console.warn("⚠️ Payment Intent ID non trouvé pour la commande", validationOrder.id);
        toast({
          title: "Attention",
          description: "ID de paiement non trouvé. La commande sera validée sans capture automatique.",
        });
      } else {
        // 2. Capturer le paiement Stripe
        console.log(`💳 Capture du paiement pour la commande #${validationOrder.id}`);
        await captureStripePayment(paymentIntentId);
      }

      // 3. Confirmer les réservations de stock (les libérer)
      await confirmStockReservations(validationOrder);

      // 4. Mettre à jour le stock des produits (décrémenter)
      await updateProductStock(validationOrder);

      // 5. Mettre à jour le statut de la commande
      await updateOrderStatus(validationOrder.id, "processing");

      // 6. Envoyer l'email de confirmation
      await sendOrderEmail(validationOrder, 'confirmed');

      toast({
        title: "Commande validée ! 🎉",
        description: `Commande #${validationOrder.id} confirmée${paymentIntentId ? ' et paiement capturé' : ''}.`,
      });

      setShowValidationModal(false);
      setValidationOrder(null);
      
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      
      // Gestion spécifique des erreurs de paiement
      let errorMessage = "Impossible de valider la commande.";
      if (error instanceof Error) {
        if (error.message.includes("capture") || error.message.includes("payment")) {
          errorMessage = "Erreur lors de la capture du paiement : " + error.message;
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Fonction pour annuler la commande
  const handleCancelOrder = async () => {
    if (!validationOrder) return;

    setIsValidating(true);
    try {
      // 1. Vérifier si on peut annuler le paiement
      const paymentIntentId = await getOrderPaymentIntentId(validationOrder);
      
      if (!paymentIntentId) {
        console.warn("⚠️ Payment Intent ID non trouvé pour la commande", validationOrder.id);
        toast({
          title: "Attention",
          description: "ID de paiement non trouvé. La commande sera annulée sans action sur le paiement.",
        });
      } else {
        // 2. Annuler le PaymentIntent Stripe
        console.log(`💳 Annulation du paiement pour la commande #${validationOrder.id}`);
        await cancelStripePayment(paymentIntentId, 'requested_by_customer');
      }

      // 3. Libérer les réservations de stock
      await releaseStockReservations(validationOrder);

      // 4. Mettre à jour le statut de la commande
      await updateOrderStatus(validationOrder.id, "cancelled");

      // 5. Envoyer l'email d'annulation
      await sendOrderEmail(validationOrder, 'cancelled');

      toast({
        title: "Commande annulée",
        description: `Commande #${validationOrder.id} annulée${paymentIntentId ? '. Aucun prélèvement effectué' : ''}.`,
      });

      setShowValidationModal(false);
      setValidationOrder(null);
      
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      
      // Gestion spécifique des erreurs de paiement
      let errorMessage = "Impossible d'annuler la commande.";
      if (error instanceof Error) {
        if (error.message.includes("cancel") || error.message.includes("payment")) {
          errorMessage = "Erreur lors de l'annulation du paiement : " + error.message;
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
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

      {/* Modal pour la gestion des numéros de suivi */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un numéro de suivi</DialogTitle>
            <DialogDescription>
              Commande #{trackingOrder?.order_number || trackingOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Numéro de suivi</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ex: 1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Transporteur</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un transporteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Colissimo">Colissimo</SelectItem>
                  <SelectItem value="Chronopost">Chronopost</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="Mondial Relay">Mondial Relay</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>💡 Un email de notification sera automatiquement envoyé au client avec le numéro de suivi.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleTrackingSubmit} disabled={!trackingNumber.trim()}>
              Marquer comme expédiée
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour la validation des commandes */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Validation de commande
            </DialogTitle>
            <DialogDescription>
              Commande #{validationOrder?.order_number || validationOrder?.id} - Vérifiez la disponibilité avant de confirmer
            </DialogDescription>
          </DialogHeader>
          
          {validationOrder && (
            <div className="space-y-6">
              {/* Informations client */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations client
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nom complet</p>
                        <p className="font-medium">{getOrderCustomerName(validationOrder) || "Non spécifié"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{getOrderEmail(validationOrder) || "Non spécifié"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{getOrderCustomerPhone(validationOrder) || "Non spécifié"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Montant total</p>
                        <p className="font-medium text-lg text-green-600">{formatAmount(validationOrder.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Badge pour le numéro de commande */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      #{validationOrder.order_number || validationOrder.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(validationOrder.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Produits commandés */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produits à vérifier
                </h4>
                <div className="space-y-3">
                  {validationOrder.items && validationOrder.items.length > 0 ? (
                    validationOrder.items.map((item, index) => (
                      <div key={item.id || index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                              <span>Qté: {item.quantity}</span>
                              {item.variant_info && (
                                <>
                                  {item.variant_info.size && (
                                    <span>Taille: {item.variant_info.size}</span>
                                  )}
                                  {item.variant_info.color && (
                                    <span>Couleur: {item.variant_info.color}</span>
                                  )}
                                </>
                              )}
                              <span>Prix: {formatAmount(item.price)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatAmount(item.price * item.quantity)}</p>
                          </div>
                        </div>
                        
                        {/* Zone de vérification stock */}
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Stock magasin:</span>
                            <Badge variant="outline" className="bg-yellow-50">
                              À vérifier
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded">
                      <p className="font-medium">Aucun produit dans cette commande</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="stock-notes">Notes de vérification (optionnel)</Label>
                <Input
                  id="stock-notes"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="Ex: Vérifiez la taille M en réserve..."
                />
              </div>

              {/* Alerte importante */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800">Important</p>
                    <p className="text-orange-700 mt-1">
                      • <strong>Valider</strong> = Le client sera débité et recevra un email de confirmation
                    </p>
                    <p className="text-orange-700">
                      • <strong>Annuler</strong> = Aucun prélèvement, email d&apos;annulation envoyé
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowValidationModal(false)}
              disabled={isValidating}
            >
              Fermer
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              {isValidating ? "Annulation..." : "Annuler la commande"}
            </Button>
            <Button 
              onClick={handleValidateOrder}
              disabled={isValidating}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isValidating ? "Validation..." : "Valider et débiter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

