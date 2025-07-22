"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/app/contexts/AuthContext";
import { api, fetchUsers } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale";
import { CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app";

export function AdminReturns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, { name: string; email: string }>>({});

  // Helper pour auth
  const getAuthHeaders = (): HeadersInit => {
    let token = localStorage.getItem("token");
    const nextAuthToken = (user as any)?.token;
    if (!token && nextAuthToken) token = nextAuthToken;
    if (!token) throw new Error("Token non fourni");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Fetch commandes
        const ordersRes = await api.fetchOrders();
        const orders = ordersRes.data || [];
        // Fetch users
        const usersData = await fetchUsers();
        const usersMap: Record<string, { name: string; email: string }> = {};
        usersData.forEach((u: any) => {
          usersMap[u.id] = { name: u.username, email: u.email };
        });
        setUsers(usersMap);
        // Extraire tous les retours
        const allReturns: any[] = [];
        orders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              if (item.return_status && item.return_status !== 'none') {
                allReturns.push({
                  ...item,
                  order_id: order.id,
                  order_number: order.order_number,
                  user_id: order.user_id,
                  created_at: order.created_at,
                  client_name: usersMap[order.user_id]?.name,
                  client_email: usersMap[order.user_id]?.email,
                });
              }
            });
          }
        });
        setReturns(allReturns);
      } catch (err) {
        toast({ title: "Erreur", description: "Impossible de charger les retours.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast, user]);

  // Actions
  const handleValidate = async (order_id: number, order_item_id: number, approved: boolean) => {
    try {
      await fetch(`${API_URL}/api/orders/${order_id}/return/validate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: [
            { order_item_id, approved, admin_comment: approved ? 'Retour validé' : 'Retour refusé' }
          ]
        })
      });
      toast({ title: 'Succès', description: approved ? 'Retour validé.' : 'Retour refusé.' });
      // Refresh
      setReturns(r => r.filter(ret => !(ret.order_id === order_id && ret.id === order_item_id)));
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de traiter le retour.', variant: 'destructive' });
    }
  };

  const handleRefund = async (order_id: number) => {
    try {
      await fetch(`${API_URL}/api/orders/${order_id}/mark-refunded`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ refund_id: '', admin_comment: 'Remboursement effectué' })
      });
      toast({ title: 'Succès', description: 'Commande marquée comme remboursée.' });
      // Met à jour chaque item concerné pour qu'il ait is_refunded: true et admin_comment
      setReturns(r =>
        r.map(ret =>
          ret.order_id === order_id && ret.return_status === 'approved'
            ? { ...ret, is_refunded: true, admin_comment: 'Remboursement effectué' }
            : ret
        )
      );
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de marquer comme remboursé.', variant: 'destructive' });
    }
  };

  // Sépare les retours non remboursés et remboursés
  const nonRefundedReturns = returns.filter(ret => !ret.is_refunded);
  const refundedReturns = returns.filter(ret => ret.is_refunded);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des retours produits</h2>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <>
          {/* Table des retours à traiter */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonRefundedReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucun retour à traiter.
                  </TableCell>
                </TableRow>
              ) : (
                nonRefundedReturns.map((ret) => (
                  <TableRow key={ret.id} className={ret.return_status === 'requested' ? 'bg-yellow-50' : ''}>
                    <TableCell>#{ret.order_number || ret.order_id}</TableCell>
                    <TableCell>{ret.product_name}</TableCell>
                    <TableCell>
                      {ret.client_name || `Client #${ret.user_id}`}
                      <br />
                      <span className="text-xs text-muted-foreground">{ret.client_email}</span>
                    </TableCell>
                    <TableCell>{ret.return_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={ret.return_status === 'requested' ? 'destructive' : 'secondary'}>
                        {ret.return_status}
                      </Badge>
                      {ret.return_status === 'requested' && (
                        <Badge className="ml-2 bg-red-600 text-white">Nouveau</Badge>
                      )}
                      {/* Badge vert si remboursé */}
                      {ret.return_status === 'approved' && ret.admin_comment && ret.admin_comment.toLowerCase().includes('remboursé') && (
                        <Badge className="ml-2 bg-green-600 text-white flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> remboursé
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{ret.return_reason}</TableCell>
                    <TableCell>{format(new Date(ret.created_at), 'Pp', { locale: fr })}</TableCell>
                    <TableCell className="space-x-2">
                      {ret.return_status === 'requested' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => handleValidate(ret.order_id, ret.id, true)}>
                            Valider
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleValidate(ret.order_id, ret.id, false)}>
                            Refuser
                          </Button>
                        </>
                      )}
                      {ret.return_status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleRefund(ret.order_id)}>
                          Marquer remboursé
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Section historique des retours remboursés */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Historique des retours remboursés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundedReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Aucun retour remboursé.
                    </TableCell>
                  </TableRow>
                ) : (
                  refundedReturns.map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell>#{ret.order_number || ret.order_id}</TableCell>
                      <TableCell>{ret.product_name}</TableCell>
                      <TableCell>
                        {ret.client_name || `Client #${ret.user_id}`}
                        <br />
                        <span className="text-xs text-muted-foreground">{ret.client_email}</span>
                      </TableCell>
                      <TableCell>{ret.return_quantity}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600 text-white flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> remboursé
                        </Badge>
                      </TableCell>
                      <TableCell>{ret.return_reason}</TableCell>
                      <TableCell>{format(new Date(ret.created_at), 'Pp', { locale: fr })}</TableCell>
                      <TableCell>{ret.admin_comment}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
} 