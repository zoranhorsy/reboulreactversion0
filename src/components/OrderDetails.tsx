import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";

export function OrderDetails({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commande {order.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
        <p>Total: {order.total_amount.toFixed(2)} €</p>
        <p>Statut: {order.status}</p>
        <ul className="mt-4">
          {order.items?.map((item, index) => (
            <li key={index} className="mb-2">
              Produit {item.product_id} - Quantité: {item.quantity} - Prix:{" "}
              {item.price.toFixed(2)} €
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
