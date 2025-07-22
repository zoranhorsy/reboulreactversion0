"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAuth } from "@/app/contexts/AuthContext";
import {
  updateUserInfo,
  uploadUserAvatar,
  deleteAccount,
  updateNotificationSettings,
  fetchNotificationSettings,
  type NotificationSettings,
  changePassword,
} from "@/lib/api";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { UserOrders } from "@/components/UserOrders";
import { ShippingAddresses } from "@/components/ShippingAddresses";
import OrderHistory from "@/components/OrderHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserInfo, UserUpdateData } from "@/lib/types/user";
import type { User } from "next-auth";

// Types
interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // États
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: user?.id || "",
    username: user?.username || "",
    email: user?.email || "",
    avatar_url: user?.avatar_url || "",
  });
  const [updating, setUpdating] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: false,
    marketing: false,
    security: true,
  });
  const [activeTab, setActiveTab] = useState("orders");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const loadNotificationSettings = useCallback(async () => {
    try {
      const settings = await fetchNotificationSettings();
      setNotifications(settings);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres de notification.",
        variant: "destructive",
      });
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.id || "",
        username: user.username || "",
        email: user.email || "",
        avatar_url: user.avatar_url || "",
      });
      loadNotificationSettings();
    }
  }, [user, loadNotificationSettings]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification de la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Le fichier doit être une image.",
        variant: "destructive",
      });
      return;
    }

    setIsAvatarLoading(true);
    try {
      const avatarUrl = await uploadUserAvatar(file);

      setUserInfo((prev) => ({ ...prev, avatar_url: avatarUrl }));

      toast({
        title: "Avatar mis à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour de votre photo de profil.",
        variant: "destructive",
      });
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      if (!userInfo.username) {
        throw new Error("Le nom d'utilisateur est requis");
      }

      const updateData: UserUpdateData = {
        username: userInfo.username,
        email: userInfo.email,
        avatar_url: userInfo.avatar_url,
      };
      const updatedUser = await updateUserInfo(updateData);
      if (updatedUser) {
        const newUserInfo: UserInfo = {
          id: userInfo.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar_url: updatedUser.avatar_url,
        };
        setUserInfo(newUserInfo);
        // Recharger la page pour mettre à jour les informations
        window.location.reload();
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        });
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour de vos informations.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    try {
      await updateNotificationSettings(newSettings);
      setNotifications(newSettings);
      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de notification ont été mises à jour.",
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de mettre à jour vos préférences de notification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const success = await deleteAccount();
      if (success) {
        await logout();
        toast({
          title: "Compte supprimé",
          description: "Votre compte a été supprimé avec succès.",
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de votre compte.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      if (response.success) {
        toast({
          title: "Succès",
          description: "Votre mot de passe a été mis à jour",
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du changement de mot de passe",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Fonction pour naviguer vers un onglet spécifique
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Mise à jour de l'affichage du nom dans le formulaire
  const [firstName, lastName] = (userInfo.username || "").split(" ");

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Connexion requise</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté pour accéder à votre profil.
            </p>
            <Button onClick={() => router.push("/auth/login")}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Mon compte</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et commandes
            </p>
          </div>

          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger
              value="orders"
              onClick={() => navigateToTab("orders")}
              className="flex gap-2 items-center"
            >
              <span>🛍️</span>
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              onClick={() => navigateToTab("profile")}
              className="flex gap-2 items-center"
            >
              <span>👤</span>
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              onClick={() => navigateToTab("addresses")}
              className="flex gap-2 items-center"
            >
              <span>📍</span>
              <span className="hidden sm:inline">Adresses</span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              onClick={() => navigateToTab("favorites")}
              className="flex gap-2 items-center"
            >
              <span>♥</span>
              <span className="hidden sm:inline">Favoris</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() => navigateToTab("settings")}
              className="flex gap-2 items-center"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="orders">
          <div className="grid gap-6">
            <OrderHistory />
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={firstName}
                        onChange={handleInfoChange}
                        placeholder="Votre prénom"
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={lastName}
                        onChange={handleInfoChange}
                        placeholder="Votre nom"
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userInfo.email}
                        onChange={handleInfoChange}
                        placeholder="votre@email.com"
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 sm:gap-4">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          type="button"
                          className="px-4 sm:px-6"
                        >
                          Annuler
                        </Button>
                        <Button type="submit" className="px-4 sm:px-6">
                          Enregistrer
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        type="button"
                        className="px-4 sm:px-6"
                      >
                        Modifier
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Changer le mot de passe
                </CardTitle>
                <CardDescription>
                  Mettez à jour votre mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full sm:w-auto"
                  >
                    {changingPassword
                      ? "Modification..."
                      : "Changer le mot de passe"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Notifications
                </CardTitle>
                <CardDescription>
                  Gérez vos préférences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isNotificationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevez des notifications par email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={() =>
                          handleNotificationChange("email")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifications push</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevez des notifications sur votre navigateur
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={() => handleNotificationChange("push")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Offres marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevez des offres promotionnelles
                        </p>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={() =>
                          handleNotificationChange("marketing")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertes de sécurité</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevez des alertes de sécurité importantes
                        </p>
                      </div>
                      <Switch
                        checked={notifications.security}
                        onCheckedChange={() =>
                          handleNotificationChange("security")
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Mes adresses
                </CardTitle>
                <CardDescription>
                  Gérez vos adresses de livraison et facturation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Section des adresses en cours de développement...
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <OrderHistory />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full sm:w-auto gap-2"
                  >
                    <span>🚪</span>
                    Se déconnecter
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto gap-2"
                      >
                        <span>🗑️</span>
                        Supprimer le compte
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Êtes-vous sûr de vouloir supprimer votre compte ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Toutes vos données
                          seront définitivement supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
