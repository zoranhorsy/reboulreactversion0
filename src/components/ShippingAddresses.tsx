'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchAddresses, Address } from '@/lib/api'
import { useToast } from "@/components/ui/use-toast"

export function ShippingAddresses() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const loadAddresses = useCallback(async () => {
        setIsLoading(true)
        try {
            const fetchedAddresses = await fetchAddresses()
            setAddresses(fetchedAddresses)
        } catch (error) {
            console.error('Failed to load addresses:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les adresses.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        loadAddresses()
    }, [loadAddresses])

    const handleAddAddress = () => {
        // Implémentation à venir
        console.log("Ajouter une adresse")
    }

    const handleUpdateAddress = (addressId: string) => {
        // Implémentation à venir
        console.log("Modifier l'adresse", addressId)
    }

    const handleDeleteAddress = (addressId: string) => {
        // Implémentation à venir
        console.log("Supprimer l'adresse", addressId)
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Adresses de livraison</h2>
            {isLoading ? (
                <p>Chargement des adresses...</p>
            ) : addresses.length > 0 ? (
                addresses.map((address) => (
                    <Card key={address.id}>
                        <CardContent className="p-4">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.postalCode}</p>
                            <p>{address.country}</p>
                            <div className="mt-2">
                                <Button
                                    variant="outline"
                                    className="mr-2"
                                    onClick={() => handleUpdateAddress(address.id)}
                                >
                                    Modifier
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteAddress(address.id)}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p>Aucune adresse enregistrée.</p>
            )}
            <Button onClick={handleAddAddress}>Ajouter une nouvelle adresse</Button>
        </div>
    )
}

