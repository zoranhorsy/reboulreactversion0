'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { changePassword } from '@/lib/api'

export function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les nouveaux mots de passe ne correspondent pas.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const result = await changePassword(currentPassword, newPassword)
            if (result.success) {
                toast({
                    title: "Succès",
                    description: result.message,
                })
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                toast({
                    title: "Erreur",
                    description: result.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du changement de mot de passe.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </Button>
        </form>
    )
}

