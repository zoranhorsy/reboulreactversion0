'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Download, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  MapPin,
  Receipt,
  AlertCircle,
  Search,
  Filter,
  SlidersHorizontal
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { fetchUserOrders, type Order } from '@/lib/api'
import { useToast } from "@/components/ui/use-toast"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { generateInvoicePDF } from '@/lib/services/invoiceService'
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  processing: "bg-blue-500/10 text-blue-500",
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500"
}

const statusLabels: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée"
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />
}

const getStatusTimeline = (status: string) => {
  const allStatuses = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = allStatuses.indexOf(status)
  if (currentIndex === -1) return allStatuses.map(s => ({ status: s, completed: false }))
  return allStatuses.map((s, i) => ({ status: s, completed: i <= currentIndex }))
}

export default function OrderHistory() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchUserOrders()
        setOrders(data)
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos commandes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [toast])

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) throw new Error("Commande non trouvée")

      const { doc, fileName } = generateInvoicePDF(order)
      doc.save(fileName)

      toast({
        title: "Succès",
        description: "La facture a été téléchargée avec succès.",
      })
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture.",
        variant: "destructive",
      })
    }
  }

  const filteredOrders = orders
    .filter(order => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          order.id.toString().includes(searchLower) ||
          (order.shipping_address?.city || "").toLowerCase().includes(searchLower) ||
          (order.items || []).some(item => 
            item.product_name.toLowerCase().includes(searchLower)
          )
        )
      }
      if (dateRange.start && dateRange.end) {
        const orderDate = new Date(order.created_at)
        return orderDate >= dateRange.start && orderDate <= dateRange.end
      }
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

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
              <div key={i} className="h-24 rounded-lg border animate-pulse bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des commandes</CardTitle>
          <CardDescription>
            Impossible d&apos;afficher l&apos;historique des commandes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vous n&apos;avez pas encore passé de commande.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              L&apos;historique de vos commandes s&apos;affichera ici.
            </p>
            <Button asChild>
              <a href="/catalogue">Voir le catalogue</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Trier
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Trier par date</DropdownMenuLabel>
                <DropdownMenuSeparator />
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
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Commande #{order.id}</span>
                    <Badge variant="secondary" className={statusColors[order.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[order.status]}
                        {statusLabels[order.status]}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </div>
                  <div className="mt-1 font-medium">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(order.total_amount)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadInvoice(order.id)}
                        >
                          <Receipt className="w-4 h-4" />
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
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Détails
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune commande n&apos;a été trouvée</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? "Aucune commande ne correspond à votre recherche."
                  : "Aucune commande ne correspond aux filtres sélectionnés."}
              </p>
            </div>
          )}
        </div>

        <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
          {selectedOrder && (
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      Commande #{selectedOrder.id}
                      <Badge variant="secondary" className={statusColors[selectedOrder.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[selectedOrder.status]}
                          {statusLabels[selectedOrder.status]}
                        </span>
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4">
                      <span>
                        {format(new Date(selectedOrder.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                      <span className="text-primary font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
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
                    <Receipt className="w-4 h-4" />
                    Télécharger la facture
                  </Button>
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="w-full justify-start px-6 h-12 bg-background border-b">
                  <TabsTrigger value="details" className="gap-2 data-[state=active]:bg-background">
                    <Package className="w-4 h-4" />
                    Détails
                  </TabsTrigger>
                  <TabsTrigger value="tracking" className="gap-2 data-[state=active]:bg-background">
                    <Truck className="w-4 h-4" />
                    Suivi
                  </TabsTrigger>
                  <TabsTrigger value="invoice" className="gap-2 data-[state=active]:bg-background">
                    <Receipt className="w-4 h-4" />
                    Facture
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="details" className="p-6 focus:outline-none">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Articles</h3>
                          <div className="space-y-4">
                            {selectedOrder.items?.map((item) => (
                              <div 
                                key={item.id} 
                                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                              >
                                <div className="w-20 h-20 bg-accent/5 rounded-md flex items-center justify-center shrink-0">
                                  {item.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={item.image_url} 
                                      alt={item.product_name} 
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                  ) : (
                                    <Package className="w-8 h-8 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h4 className="font-medium truncate">{item.product_name}</h4>
                                      <div className="mt-1 text-sm text-muted-foreground">
                                        Quantité: {item.quantity}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        {new Intl.NumberFormat('fr-FR', {
                                          style: 'currency',
                                          currency: 'EUR'
                                        }).format(item.price)}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Total: {new Intl.NumberFormat('fr-FR', {
                                          style: 'currency',
                                          currency: 'EUR'
                                        }).format(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border space-y-3">
                          <h4 className="font-medium">Récapitulatif</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sous-total</span>
                              <span>
                                {new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(selectedOrder.total_amount * 0.8)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">TVA (20%)</span>
                              <span>
                                {new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(selectedOrder.total_amount * 0.2)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span>Total</span>
                              <span>
                                {new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(selectedOrder.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-4 rounded-lg border space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Adresse de livraison
                          </h4>
                          {selectedOrder.shipping_address && (
                            <div className="space-y-1">
                              <p className="font-medium">{selectedOrder.shipping_address.street}</p>
                              <p className="text-muted-foreground">
                                {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                              </p>
                              <p className="text-muted-foreground">{selectedOrder.shipping_address.country}</p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 rounded-lg border space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Historique de la commande
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-4 h-4 rounded-full bg-primary" />
                              <div>
                                <p className="font-medium">Commande passée</p>
                                <p className="text-muted-foreground">
                                  {format(new Date(selectedOrder.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className={`w-4 h-4 rounded-full ${selectedOrder.status !== 'pending' ? 'bg-primary' : 'bg-muted'}`} />
                              <div>
                                <p className="font-medium">Commande confirmée</p>
                                <p className="text-muted-foreground">
                                  {selectedOrder.status !== 'pending' 
                                    ? format(new Date(selectedOrder.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })
                                    : 'En attente'}
                                </p>
                              </div>
                            </div>
                            {selectedOrder.status === 'shipped' && (
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-4 h-4 rounded-full bg-primary" />
                                <div>
                                  <p className="font-medium">Commande expédiée</p>
                                  <p className="text-muted-foreground">
                                    {format(new Date(selectedOrder.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-muted space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Besoin d&apos;aide ?
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Si vous avez des questions concernant votre commande, n&apos;hésitez pas à contacter notre service client.
                          </p>
                          <Button variant="outline" className="w-full">
                            Contacter le support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tracking" className="p-6 focus:outline-none">
                    <div className="max-w-2xl mx-auto space-y-8">
                      {selectedOrder.status !== 'cancelled' ? (
                        <>
                          <div className="relative">
                            {getStatusTimeline(selectedOrder.status).map((step, index) => (
                              <div key={step.status} className="flex items-center mb-12 last:mb-0">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                  step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                  {statusIcons[step.status]}
                                </div>
                                <div className="ml-4 flex-1">
                                  <h4 className="font-medium">{statusLabels[step.status]}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {step.completed 
                                      ? format(new Date(selectedOrder.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })
                                      : 'À venir'}
                                  </p>
                                </div>
                                {index < getStatusTimeline(selectedOrder.status).length - 1 && (
                                  <div className="absolute left-5 top-10 bottom-0 w-px bg-border -ml-px h-8" />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="p-4 rounded-lg border bg-muted">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <AlertCircle className="w-4 h-4" />
                              <p>Le suivi est mis à jour toutes les 30 minutes</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-destructive" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Commande annulée</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Cette commande a été annulée le{' '}
                            {format(new Date(selectedOrder.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                          <Button variant="outline" className="mt-6">
                            Contacter le support
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="invoice" className="p-6 focus:outline-none">
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="p-6 rounded-lg border space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Facture #{selectedOrder.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              Émise le {format(new Date(selectedOrder.created_at), "d MMMM yyyy", { locale: fr })}
                            </p>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleDownloadInvoice(selectedOrder.id)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </Button>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">Adresse de facturation</h4>
                            {selectedOrder.shipping_address && (
                              <div className="text-sm space-y-1">
                                <p className="font-medium">{selectedOrder.shipping_address.street}</p>
                                <p className="text-muted-foreground">
                                  {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                                </p>
                                <p className="text-muted-foreground">{selectedOrder.shipping_address.country}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Informations de paiement</h4>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="text-muted-foreground">Méthode :</span>{' '}
                                <span className="font-medium">Carte bancaire</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Date :</span>{' '}
                                <span className="font-medium">
                                  {format(new Date(selectedOrder.created_at), "d MMMM yyyy", { locale: fr })}
                                </span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Statut :</span>{' '}
                                <span className="font-medium text-green-600">Payé</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-4">Détail des articles</h4>
                          <div className="space-y-2">
                            {selectedOrder.items?.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                  <span className="font-medium">{item.product_name}</span>
                                  <span className="text-muted-foreground"> × {item.quantity}</span>
                                </div>
                                <span>
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  }).format(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sous-total</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              }).format(selectedOrder.total_amount * 0.8)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">TVA (20%)</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              }).format(selectedOrder.total_amount * 0.2)}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              }).format(selectedOrder.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Pour toute question concernant cette facture, contactez notre service client
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
  )
} 