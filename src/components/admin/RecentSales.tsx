import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Order {
    id: string
    customer: string
    total: number
    status: string
    date: string
}

interface RecentSalesProps {
    orders?: Order[]
}

export function RecentSales({ orders = [] }: RecentSalesProps) {
    if (!orders || orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ventes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        Aucune vente récente
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ventes récentes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                    {order.customer.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{order.customer}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(order.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                +{order.total.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 