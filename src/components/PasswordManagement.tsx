"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import axios from "axios"

interface PasswordManagementProps {
  userId: string
  onPasswordUpdate: () => void
}

export function PasswordManagement({ userId, onPasswordUpdate }: PasswordManagementProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.put(`/api/admin/users/${userId}/password`, { newPassword })
      if (response.data.message === "Mot de passe mis à jour avec succès") {
        toast({
          title: "Succès",
          description: "Le mot de passe a été mis à jour avec succès.",
        })
        setNewPassword("")
        setConfirmPassword("")
        onPasswordUpdate()
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    if (field === "new") {
      setShowNewPassword(!showNewPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
        <CardDescription>Définissez un nouveau mot de passe pour cet utilisateur.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                </span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isLoading} className="w-full" onClick={handleSubmit}>
          {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </Button>
      </CardFooter>
    </Card>
  )
}

PasswordManagement.propTypes = {
  userId: PropTypes.string.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
}

