'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api, type Settings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, AlertTriangle } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import debounce from 'lodash/debounce'

const CURRENCIES = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dollar ($)' },
    { value: 'GBP', label: 'Livre Sterling (£)' }
]

const TAX_RATES = [
    { value: 20, label: '20% (Standard)' },
    { value: 10, label: '10% (Réduit)' },
    { value: 5.5, label: '5.5% (Réduit)' },
    { value: 2.1, label: '2.1% (Super réduit)' }
]

interface ValidationErrors {
    siteName?: string
    contactEmail?: string
    taxRate?: string
}

export function AdminSettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
    const [originalSettings, setOriginalSettings] = useState<Settings | null>(null)
    const [settings, setSettings] = useState<Settings>({
        siteName: "Mon E-commerce",
        siteDescription: "Description du site",
        contactEmail: "contact@example.com",
        enableRegistration: true,
        enableCheckout: true,
        maintenanceMode: false,
        currency: "EUR",
        taxRate: 20,
    })
    const { toast } = useToast()

    // Validation des données
    const validateSettings = (data: Settings): ValidationErrors => {
        const errors: ValidationErrors = {}
        
        if (!data.siteName.trim()) {
            errors.siteName = "Le nom du site est requis"
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.contactEmail)) {
            errors.contactEmail = "L'email de contact n'est pas valide"
        }
        
        if (data.taxRate < 0 || data.taxRate > 100) {
            errors.taxRate = "Le taux de TVA doit être compris entre 0 et 100"
        }
        
        return errors
    }

    // Chargement initial des paramètres
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true)
            try {
                const response = await api.fetchSettings()
                setSettings(response)
                setOriginalSettings(response)
            } catch (error) {
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les paramètres.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
    }, [toast])

    // Sauvegarde automatique
    const debouncedSave = useCallback((data: Settings) => {
        const saveSettings = async () => {
            try {
                await api.updateSettings(data)
                setOriginalSettings(data)
                setHasChanges(false)
                toast({
                    title: "Succès",
                    description: "Les paramètres ont été sauvegardés automatiquement.",
                })
            } catch (error) {
                toast({
                    title: "Erreur",
                    description: "Erreur lors de la sauvegarde automatique.",
                    variant: "destructive",
                })
            }
        }
        saveSettings()
    }, [setOriginalSettings, setHasChanges, toast])

    // Gestion des modifications
    const handleChange = (key: keyof Settings, value: any) => {
        const newSettings = {
            ...settings,
            [key]: value,
        }
        
        setSettings(newSettings)
        setHasChanges(true)
        
        // Validation en temps réel
        const errors = validateSettings(newSettings)
        setValidationErrors(errors)
        
        // Sauvegarde automatique si pas d'erreurs
        if (Object.keys(errors).length === 0) {
            debouncedSave(newSettings)
        }
    }

    // Sauvegarde manuelle
    const handleSave = useCallback(async () => {
        const errors = validateSettings(settings)
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            toast({
                title: "Erreur de validation",
                description: "Veuillez corriger les erreurs avant de sauvegarder.",
                variant: "destructive",
            })
            return
        }

        setIsSaving(true)
        try {
            await api.updateSettings(settings)
            setOriginalSettings(settings)
            setHasChanges(false)
            toast({
                title: "Succès",
                description: "Les paramètres ont été mis à jour.",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour les paramètres.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }, [settings, toast])

    // Réinitialisation des paramètres
    const handleReset = () => {
        if (originalSettings) {
            setSettings(originalSettings)
            setHasChanges(false)
            setValidationErrors({})
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {hasChanges && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Vous avez des modifications non sauvegardées
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="commerce">Commerce</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres généraux</CardTitle>
                            <CardDescription>
                                Configurez les informations de base du site
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="siteName">
                                    Nom du site
                                    {validationErrors.siteName && (
                                        <span className="text-red-500 text-sm ml-2">
                                            {validationErrors.siteName}
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="siteName"
                                    value={settings.siteName}
                                    onChange={(e) =>
                                        handleChange("siteName", e.target.value)
                                    }
                                    className={validationErrors.siteName ? "border-red-500" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">
                                    Description du site
                                </Label>
                                <Textarea
                                    id="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={(e) =>
                                        handleChange(
                                            "siteDescription",
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">
                                    Email de contact
                                    {validationErrors.contactEmail && (
                                        <span className="text-red-500 text-sm ml-2">
                                            {validationErrors.contactEmail}
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) =>
                                        handleChange(
                                            "contactEmail",
                                            e.target.value
                                        )
                                    }
                                    className={validationErrors.contactEmail ? "border-red-500" : ""}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="commerce">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres de commerce</CardTitle>
                            <CardDescription>
                                Configurez les options de vente et de paiement
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Devise</Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) =>
                                        handleChange("currency", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une devise" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((currency) => (
                                            <SelectItem
                                                key={currency.value}
                                                value={currency.value}
                                            >
                                                {currency.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxRate">
                                    Taux de TVA
                                    {validationErrors.taxRate && (
                                        <span className="text-red-500 text-sm ml-2">
                                            {validationErrors.taxRate}
                                        </span>
                                    )}
                                </Label>
                                <Select
                                    value={settings.taxRate.toString()}
                                    onValueChange={(value) =>
                                        handleChange("taxRate", parseFloat(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un taux de TVA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TAX_RATES.map((rate) => (
                                            <SelectItem
                                                key={rate.value}
                                                value={rate.value.toString()}
                                            >
                                                {rate.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Activer le paiement</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Permettre aux clients de passer des
                                        commandes
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enableCheckout}
                                    onCheckedChange={(checked) =>
                                        handleChange("enableCheckout", checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="maintenance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance</CardTitle>
                            <CardDescription>
                                Gérez l&apos;accès au site et la maintenance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Inscriptions</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Autoriser les nouvelles inscriptions
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.enableRegistration}
                                    onCheckedChange={(checked) =>
                                        handleChange(
                                            "enableRegistration",
                                            checked
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Mode maintenance</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Mettre le site en maintenance
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked) =>
                                        handleChange("maintenanceMode", checked)
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Statut de l&apos;utilisateur</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Mettre le site en maintenance
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked) =>
                                        handleChange("maintenanceMode", checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges}
                >
                    Réinitialiser
                </Button>
                
                <div className="space-x-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                disabled={!settings.maintenanceMode}
                            >
                                Désactiver la maintenance
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Désactiver le mode maintenance ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action rendra le site accessible à tous les utilisateurs.
                                    Assurez-vous que toutes les opérations de maintenance sont terminées.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleChange("maintenanceMode", false)}
                                >
                                    Désactiver
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || Object.keys(validationErrors).length > 0}
                    >
                        {isSaving && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {!isSaving && <Save className="mr-2 h-4 w-4" />}
                        Enregistrer les modifications
                    </Button>
                </div>
            </div>
        </div>
    )
} 