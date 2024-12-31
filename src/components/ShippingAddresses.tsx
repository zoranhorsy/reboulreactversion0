'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, Address } from '@/lib/api'

export function ShippingAddresses() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'isDefault'>>({
        name: '',
        street: '',
        city: '',
        postalCode: '',
        country: ''
    })

    useEffect(() => {
        loadAddresses()
    }, [])

    const loadAddresses = async () => {
        try {
            setLoading(true)
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
            setLoading(false)
        }
    }

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const addedAddress = await addAddress({ ...newAddress, isDefault: false })
            setAddresses([...addresses, addedAddress])
            setNewAddress({ name: '', street: '', city: '', postalCode: '', country: '' })
            toast({
                title: "Adresse ajoutée",
                description: "La nouvelle adresse a été ajoutée avec succès.",
            })
        } catch (error) {
            console.error('Failed to add address:', error)
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter l'adresse.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAddress) return
        try {
            const updatedAddress = await updateAddress(editingAddress.id, editingAddress)
            setAddresses(addresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr))
            setEditingAddress(null)
            toast({
                title: "Adresse mise à jour",
                description: "L'adresse a été mise à jour avec succès.",
            })
        } catch (error) {
            console.error('Failed to update address:', error)
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour l'adresse.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteAddress = async (id: string) => {
        try {
            await deleteAddress(id)
            setAddresses(addresses.filter(addr => addr.id !== id))
            toast({
                title: "Adresse supprimée",
                description: "L'adresse a été supprimée avec succès.",
            })
        } catch (error) {
            console.error('Failed to delete address:', error)
            toast({
                title: "Erreur",
                description: "Impossible de supprimer l'adresse.",
                variant: "destructive",
            })
        }
    }

    const handleSetDefaultAddress = async (id: string) => {
        try {
            const updatedAddresses = await setDefaultAddress(id)
            setAddresses(updatedAddresses)
            toast({
                title: "Adresse par défaut mise à jour",
                description: "L'adresse par défaut a été mise à jour avec succès.",
            })
        } catch (error) {
            console.error('Failed to set default address:', error)
            toast({
                title: "Erreur",
                description: "Impossible de définir l'adresse par défaut.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return <div>Chargement des adresses...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une nouvelle adresse</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom</Label>
                                <Input
                                    id="name"
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="street">Rue</Label>
                                <Input
                                    id="street"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville</Label>
                                <Input
                                    id="city"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Code postal</Label>
                                <Input
                                    id="postalCode"
                                    value={newAddress.postalCode}
                                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Pays</Label>
                                <Input
                                    id="country"
                                    value={newAddress.country}
                                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit">
                            <Plus className="mr-2 h-4 w-4" /> Ajouter l'adresse
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Adresses enregistrées</CardTitle>
                </CardHeader>
                <CardContent>
                    {addresses.map((address) => (
                        <div key={address.id} className="mb-4 p-4 border rounded-lg">
                            {editingAddress && editingAddress.id === address.id ? (
                                <form onSubmit={handleUpdateAddress} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-name-${address.id}`}>Nom</Label>
                                            <Input
                                                id={`edit-name-${address.id}`}
                                                value={editingAddress.name}
                                                onChange={(e) => setEditingAddress({ ...editingAddress, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-street-${address.id}`}>Rue</Label>
                                            <Input
                                                id={`edit-street-${address.id}`}
                                                value={editingAddress.street}
                                                onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-city-${address.id}`}>Ville</Label>
                                            <Input
                                                id={`edit-city-${address.id}`}
                                                value={editingAddress.city}
                                                onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-postalCode-${address.id}`}>Code postal</Label>
                                            <Input
                                                id={`edit-postalCode-${address.id}`}
                                                value={editingAddress.postalCode}
                                                onChange={(e) => setEditingAddress({ ...editingAddress, postalCode: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-country-${address.id}`}>Pays</Label>
                                            <Input
                                                id={`edit-country-${address.id}`}
                                                value={editingAddress.country}
                                                onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit">
                                        <Check className="mr-2 h-4 w-4" /> Sauvegarder
                                    </Button>
                                </form>
                            ) : (
                                <>
                                    <p><strong>{address.name}</strong> {address.isDefault && <span className="text-green-600">(Par défaut)</span>}</p>
                                    <p>{address.street}</p>
                                    <p>{address.postalCode} {address.city}</p>
                                    <p>{address.country}</p>
                                    <div className="mt-2 space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingAddress(address)}>
                                            <Edit className="mr-2 h-4 w-4" /> Modifier
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                        </Button>
                                        {!address.isDefault && (
                                            <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address.id)}>
                                                Définir par défaut
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

