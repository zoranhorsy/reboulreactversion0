'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronDown, ChevronUp, Download, Printer, RefreshCw, Eye, Truck, DollarSign, Trash2, CalendarIcon } from 'lucide-react'

import { CSVLink } from "react-csv"
import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'

import { ReturnForm } from '@/components/admin/ReturnForm'
import { fetchOrders, updateOrderStatus, deleteOrder, type Order, type OrderItem } from '@/lib/api'
import { DateRange } from 'react-day-picker'
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"


type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: keyof Order;
  direction: SortDirection;
}

type CSVData = {
  ID: string;
  'User ID': string;
  'Total Amount': number;
  Status: string;
  'Created At': string;
};

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-200 text-yellow-800',
  'processing': 'bg-blue-200 text-blue-800',
  'shipped': 'bg-purple-200 text-purple-800',
  'delivered': 'bg-green-200 text-green-800',
  'cancelled': 'bg-red-200 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'descending',
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders.data)
      setPaginationInfo({
        ...fetchedOrders.pagination,
        itemsPerPage: fetchedOrders.data.length,
        hasNextPage: fetchedOrders.pagination.currentPage < fetchedOrders.pagination.totalPages
      })
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement des commandes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleSort = (key: keyof Order) => {
    setSortConfig(current => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const getSortIcon = (key: keyof Order) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'ascending' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !searchTerm ||
      order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.toString().toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(order.created_at) >= dateRange.from &&
        new Date(order.created_at) <= dateRange.to)

    return matchesSearch && matchesDateRange
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!(sortConfig.key in a) || !(sortConfig.key in b)) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || bValue === undefined) return 0;

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  })

  const csvData: CSVData[] = sortedOrders.map(order => ({
    ID: order.id.toString(),
    'User ID': order.user_id.toString(),
    'Total Amount': order.total_amount,
    Status: order.status,
    'Created At': format(new Date(order.created_at), 'Pp', { locale: fr }),
  }))

  const handleExportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['ID', 'User ID', 'Total Amount', 'Status', 'Created At']],
      body: sortedOrders.map(order => [
        order.id,
        order.user_id,
        `${order.total_amount}€`,
        order.status,
        format(new Date(order.created_at), 'Pp', { locale: fr }),
      ]),
    })
    doc.save('orders.pdf')
  }

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast({
        title: "Succès",
        description: `Le statut de la commande ${orderId} a été mis à jour.`,
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du statut.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      toast({
        title: "Succès",
        description: `La commande ${orderId} a été supprimée.`,
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de la commande.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadOrders} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
          <CSVLink
            data={csvData}
            filename="orders.csv"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </CSVLink>
          <Button variant="outline" onClick={handleExportPDF}>
            <Printer className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liste des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID {getSortIcon('id')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('user_id')}
                  >
                    <div className="flex items-center">
                      User ID {getSortIcon('user_id')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('total_amount')}
                  >
                    <div className="flex items-center">
                      Total {getSortIcon('total_amount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.user_id}</TableCell>
                    <TableCell>{order.total_amount}€</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'Pp', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
                              <DialogDescription>
                                Commande passée le {format(new Date(order.created_at), 'Pp', { locale: fr })}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold mb-2">Informations client</h3>
                                <p>ID Client: {order.user_id}</p>
                                <p>Nom: {order.user?.name || 'N/A'}</p>
                                <p>Email: {order.user?.email || 'N/A'}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                                <p>{order.shipping_address?.street || 'N/A'}</p>
                                <p>{order.shipping_address?.city || 'N/A'}, {order.shipping_address?.postal_code || 'N/A'}</p>
                                <p>{order.shipping_address?.country || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h3 className="font-semibold mb-2">Articles commandés</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead>Prix unitaire</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items?.map((item: OrderItem) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.product_name}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{item.price}€</TableCell>
                                      <TableCell>{item.quantity * item.price}€</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">Total de la commande</h3>
                                <p className="text-2xl font-bold">{order.total_amount}€</p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Statut de la commande</h3>
                                <Select
                                  onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                                  defaultValue={order.status}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Changer le statut" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="processing">En cours</SelectItem>
                                    <SelectItem value="shipped">Expédiée</SelectItem>
                                    <SelectItem value="delivered">Livrée</SelectItem>
                                    <SelectItem value="cancelled">Annulée</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Truck className="h-4 w-4 mr-2" />
                          Retour
                        </Button>
                        <Button variant="outline" size="sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Facturer
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette commande ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Toutes les données associées à cette commande seront définitivement supprimées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {paginationInfo && (
          <div className="flex justify-between items-center">
            <p>
              Page {paginationInfo.currentPage} sur {paginationInfo.totalPages}
            </p>
            <p>
              Total des commandes : {paginationInfo.totalItems}
            </p>
          </div>
        )}
        {selectedOrder && (
          <ReturnForm
            order={selectedOrder}
            onReturnProcessed={(updatedOrder) => {
              setOrders(orders.map(o =>
                o.id === updatedOrder.id ? updatedOrder : o
              ))
              setSelectedOrder(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

