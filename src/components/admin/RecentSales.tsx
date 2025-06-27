import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

interface RecentSalesProps {
  orders?: Order[];
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
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarFallback>
                  {order.customer
                    ? order.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium leading-none truncate">
                  {order.customer || "Client inconnu"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="ml-2 sm:ml-4 text-xs sm:text-sm font-medium whitespace-nowrap">
                +
                {order.total.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
