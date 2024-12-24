'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/contexts/CartContext';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Définition des types nécessaires
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variant: {
        size: string;
        color: string;
    };
}

interface Order {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
}

export function CheckoutForm() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { items: cartItems, total, clearCart, setLastOrder } = useCart();
    const { toast } = useToast();
    const router = useRouter();

    const [cardInfo, setCardInfo] = useState({
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardInfo(prev => ({ ...prev, [name]: value }));
    };

    const createOrder = async (orderDetails: Order): Promise<Order> => {
        try {
            console.log('Sending order to API:', orderDetails);
            const response = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error response:', errorData);
                throw new Error(errorData.error || 'Erreur lors de la création de la commande');
            }

            const data = await response.json();
            console.log('Order created successfully:', data);
            return data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    };

    const processCheckout = async (isTest: boolean) => {
        setIsProcessing(true);
        setError(null);
        console.log('Processing checkout...', { isTest, cartItems });

        try {
            if (cartItems.length === 0) {
                throw new Error('Votre panier est vide');
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            if (!isTest) {
                if (cardInfo.cardNumber.length !== 16 || !/^\d+$/.test(cardInfo.cardNumber)) {
                    throw new Error('Numéro de carte invalide');
                }
            }

            const orderDetails: Order = {
                id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                date: new Date().toISOString(),
                customer: "John Doe", // Ceci devrait être remplacé par les informations réelles du client
                total: total,
                status: 'pending',
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    variant: {
                        size: item.variant?.size || 'Default',
                        color: item.variant?.color || 'Default'
                    }
                }))
            };

            // Créer la commande dans l'API
            const createdOrder = await createOrder(orderDetails);

            console.log('Setting last order:', createdOrder);
            setLastOrder(createdOrder);

            console.log('Checkout successful, redirecting to confirmation page...');

            toast({
                title: isTest ? "Test de paiement réussi" : "Paiement réussi",
                description: "Votre commande a été traitée avec succès.",
            });

            // Clear the cart before redirection
            clearCart();

            // Use setTimeout to ensure the cart is cleared before navigation
            setTimeout(() => {
                router.push('/confirmation-commande');
            }, 100);

        } catch (error) {
            console.error('Error:', error);
            setError((error as Error).message);
            toast({
                title: "Erreur de paiement",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        processCheckout(false);
    };

    const handleTestCheckout = () => {
        processCheckout(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={cardInfo.cardNumber}
                    onChange={handleInputChange}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="expiry">Date d'expiration</Label>
                    <Input
                        id="expiry"
                        name="expiry"
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={cardInfo.expiry}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                        id="cvc"
                        name="cvc"
                        type="text"
                        required
                        placeholder="123"
                        value={cardInfo.cvc}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Erreur de paiement</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button
                type="submit"
                disabled={isProcessing}
                className="w-full"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement en cours...
                    </>
                ) : (
                    'Payer'
                )}
            </Button>

            <Button
                type="button"
                onClick={handleTestCheckout}
                disabled={isProcessing}
                variant="secondary"
                className="w-full mt-2"
            >
                Test Checkout (Sans remplir les champs)
            </Button>

            <p className="mt-2 text-xs text-gray-500 text-center">
                En cliquant sur "Payer", vous acceptez nos conditions générales de vente.
            </p>
        </form>
    );
}

