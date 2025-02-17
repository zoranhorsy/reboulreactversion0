'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/contexts/AuthContext"
import axios from 'axios'
import { Loader2, Trash2, Pencil, Key } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PasswordManagement } from '@/components/PasswordManagement'

interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  password: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token non trouvé')
      }

      console.log('Récupération des utilisateurs...')
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Utilisateurs récupérés:', response.data)
      setUsers(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      if (axios.isAxiosError(error)) {
        console.error('Détails de l\'erreur Axios:', error.response?.data)
      }
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des utilisateurs.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [API_URL, toast])

  useEffect(() => {
    const checkAccess = async () => {
      console.log('Vérification de l\'accès, utilisateur actuel:', user)
      if (!user) {
        console.log('Aucun utilisateur trouvé, redirection vers la page de connexion')
        router.push('/admin/login')
        return
      }

      console.log('Statut administrateur de l\'utilisateur:', user.isAdmin)
      if (!user.isAdmin) {
        console.log('L\'utilisateur n\'est pas administrateur, accès refusé')
        toast({
          title: "Accès refusé",
          description: "Vous devez être administrateur pour accéder à cette page.",
          variant: "destructive",
        })
        router.push('/')
        return
      }

      console.log('Accès autorisé, récupération de la liste des utilisateurs')
      await fetchUsers()
    }

    checkAccess()
  }, [user, router, fetchUsers, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token non trouvé')

      const userData = {
        username,
        email,
        is_admin: isAdmin,
        password: password || undefined
      }

      if (editingUser) {
        console.log('Mise à jour de l\'utilisateur:', editingUser.id, userData)
        const response = await axios.put(
          `${API_URL}/users/${editingUser.id}`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('Réponse de mise à jour:', response.data)
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès.",
        })
      } else {
        console.log('Création d\'un nouvel utilisateur:', userData)
        const response = await axios.post(
          `${API_URL}/users`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('Réponse de création:', response.data)
        toast({
          title: "Succès",
          description: "Nouvel utilisateur créé avec succès.",
        })
      }
      await fetchUsers()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      if (axios.isAxiosError(error)) {
        console.error('Détails de l\'erreur Axios:', error.response?.data)
      }
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération. Veuillez vérifier les logs pour plus de détails.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setUsername(user.username)
    setEmail(user.email)
    setIsAdmin(user.is_admin)
    setPassword('')
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token non trouvé')

      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès.",
      })
      fetchUsers()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setUsername('')
    setEmail('')
    setIsAdmin(false)
    setPassword('')
  }

  const handlePasswordUpdate = (userId: string) => {
    setSelectedUserId(userId)
    setIsPasswordDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
        <p className="text-gray-600 mb-4">Vous devez être administrateur pour accéder à cette page.</p>
        <Button onClick={() => router.push('/')}>
          Retour à l&apos;accueil
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>

      <Button onClick={() => setIsDialogOpen(true)} className="mb-4">
        Ajouter un utilisateur
      </Button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom d&apos;utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Mot de passe</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_admin ? 'Oui' : 'Non'}</TableCell>
                <TableCell>{user.password}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePasswordUpdate(user.id)}>
                      <Key className="h-4 w-4 mr-1" />
                      Mot de passe
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifiez les informations de l\'utilisateur ci-dessous. Laissez le champ mot de passe vide pour ne pas le modifier.' : 'Entrez les informations du nouvel utilisateur.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required={!editingUser}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isAdmin">Administrateur</Label>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingUser ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Définissez un nouveau mot de passe pour cet utilisateur.
            </DialogDescription>
          </DialogHeader>
          {selectedUserId && (
            <PasswordManagement
              userId={selectedUserId}
              onPasswordUpdate={() => {
                setIsPasswordDialogOpen(false)
                setSelectedUserId(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

