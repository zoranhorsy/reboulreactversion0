import { useState } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OrderItem = {
    id: number
    name: string
    quantity: number
    price: number
}

type Order = {
    id: string
    date: string
    total: number
    status: string
    items: OrderItem[]
}

export function OrderDetails({ order }: { order: Order }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const handleDownloadInvoice = () => {
        // Ici, vous implémenteriez la logique réelle pour générer et télécharger la facture
        console.log(`Téléchargement de la facture pour la commande ${order.id}`)
        // Simulons un téléchargement
        const link = document.createElement('a')
        link.href = '#'
        link.download = `facture_${order.id}.pdf`
        link.click()
    }

    return (
        <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Commande {order.id}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm">
                    <span>Date: {order.date}</span>
                    <span>Total: {order.total.toFixed(2)} €</span>
                    <span>Statut: {order.status}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadInvoice}
                    className="mt-2"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger la facture
                </Button>
                {isExpanded && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Articles commandés:</h4>
                        <ul className="space-y-2">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

