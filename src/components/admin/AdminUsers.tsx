"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api, createUser } from "@/lib/api";
import { type User } from "next-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortConfig = {
  key: keyof User;
  direction: "ascending" | "descending";
};

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "descending",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    is_admin: false,
  });
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.fetchUsers();
      setUsers(response);
      setFilteredUsers(response);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.email || !newUser.password) {
        toast({
          title: "Erreur",
          description: "Tous les champs sont requis.",
          variant: "destructive",
        });
        return;
      }

      const createdUser = await createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        isAdmin: newUser.is_admin,
      });

      if (createdUser) {
        toast({
          title: "Succès",
          description: "L'utilisateur a été créé avec succès.",
        });
        setIsDialogOpen(false);
        setNewUser({
          username: "",
          email: "",
          password: "",
          is_admin: false,
        });
        loadUsers();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredUsers(filtered);
  };

  const handleSort = (key: keyof User) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <span>↑</span>
    ) : (
      <span>↓</span>
    );
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortConfig.key === "created_at") {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      const dateA = valueA ? new Date(valueA).getTime() : 0;
      const dateB = valueB ? new Date(valueB).getTime() : 0;
      return sortConfig.direction === "ascending"
        ? dateA - dateB
        : dateB - dateA;
    }

    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    // Handle undefined values
    if (valueA === undefined && valueB === undefined) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;

    // Safe comparison after undefined checks
    if (String(valueA) < String(valueB)) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (String(valueA) > String(valueB)) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const handleToggleAdmin = async (
    userId: string,
    isCurrentlyAdmin: boolean,
  ) => {
    try {
      toast({
        title: "En cours...",
        description: `Modification des droits d'administration en cours`,
      });

      await api.updateUserRole(userId, !isCurrentlyAdmin);

      toast({
        title: "Succès",
        description: `Les droits d'administrateur ont été ${isCurrentlyAdmin ? "retirés" : "accordés"}.`,
      });

      loadUsers();
    } catch (error) {
      console.error("Erreur lors de la modification des droits:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les droits d'administrateur.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await api.updateUserStatus(userId, status);
      toast({
        title: "Succès",
        description: `Le statut de l'utilisateur a été mis à jour à ${status}.`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div>
              <CardTitle className="text-lg">
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription className="text-sm">
                Gérez les comptes et leurs droits
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span>🔍</span>
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 bg-background h-9"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-9">
                    <span>👤</span>
                    <span>Ajouter</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un utilisateur</DialogTitle>
                    <DialogDescription>
                      Créer un nouveau compte utilisateur
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-3">
                    <div className="space-y-1">
                      <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) =>
                          setNewUser({ ...newUser, username: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="admin"
                        checked={newUser.is_admin}
                        onCheckedChange={(checked) =>
                          setNewUser({ ...newUser, is_admin: checked })
                        }
                      />
                      <Label htmlFor="admin">Administrateur</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleCreateUser}>Créer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center gap-1">
                      Nom {getSortIcon("username")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/30 hidden sm:table-cell"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/30 hidden sm:table-cell"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Inscription {getSortIcon("created_at")}
                    </div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span>Chargement...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span>🔍</span>
                        <span>Aucun utilisateur trouvé</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell className="min-w-[120px]">
                        <div className="min-w-[100px]">
                          <div className="font-medium">{user.username}</div>
                          <div className="sm:hidden text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                            {user.email}
                          </div>
                          <div className="sm:hidden mt-1">
                            <Badge
                              variant={user.is_admin ? "default" : "secondary"}
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              {user.is_admin ? "Admin" : "User"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {(() => {
                          const createdAt = user.created_at;
                          return createdAt 
                            ? format(new Date(createdAt), "dd/MM/yyyy", {
                                locale: fr,
                              })
                            : "N/A";
                        })()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={user.is_admin ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.is_admin ? "Admin" : "Utilisateur"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleAdmin(user.id, user.is_admin)
                            }
                            className="h-7 w-7"
                            title={
                              user.is_admin
                                ? "Retirer les droits admin"
                                : "Rendre administrateur"
                            }
                          >
                            {user.is_admin ? <span>🛡️</span> : <span>👤</span>}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="utilisateur"
                              >
                                <span>✏️</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Modifier l&apos;utilisateur
                                </DialogTitle>
                                <DialogDescription>
                                  {user.username} ({user.email})
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 py-3">
                                <div className="space-y-1">
                                  <Label>Statut de l&apos;utilisateur</Label>
                                  <Select
                                    value={user.status || "active"}
                                    onValueChange={(value) =>
                                      handleStatusChange(user.id, value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Actif
                                      </SelectItem>
                                      <SelectItem value="suspended">
                                        Suspendu
                                      </SelectItem>
                                      <SelectItem value="banned">
                                        Banni
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" className="mt-0">
                                  Annuler
                                </Button>
                                <Button>Enregistrer</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="utilisateur"
                              >
                                <span>🗑️</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Supprimer cet utilisateur ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Toutes les
                                  données de {user.username} seront supprimées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
