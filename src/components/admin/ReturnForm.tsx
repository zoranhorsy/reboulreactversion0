import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { processReturn, Order } from '@/lib/api'

interface ReturnFormProps {
    order: Order;
    onReturnProcessed: (updatedOrder: Order) => void;
}

export function ReturnForm({ order, onReturnProcessed }: ReturnFormProps) {
    const [returnReason, setReturnReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const updatedOrder = await processReturn(order.id, returnReason)
            onReturnProcessed(updatedOrder)
            toast({
                title: "Retour traité",
                description: `Le retour pour la commande ${order.id} a été traité avec succès.`,
            })
        } catch (error) {
            console.error('Erreur lors du traitement du retour:', error)
            toast({
                title: "Erreur",
                description: "Impossible de traiter le retour. Veuillez réessayer.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                placeholder="Raison du retour"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
            />
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Traitement...' : 'Traiter le retour'}
            </Button>
        </form>
    )
}

