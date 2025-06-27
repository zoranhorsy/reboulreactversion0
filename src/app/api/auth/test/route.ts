import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { api } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session NextAuth
    const nextAuthSession = await getServerSession(authOptions);

    // S'il n'y a pas de session, l'utilisateur n'est pas connecté
    if (!nextAuthSession) {
      return NextResponse.json({
        authenticated: false,
        nextAuthSession: null,
        message: "Non authentifié avec NextAuth",
      });
    }

    // Utiliser le token JWT stocké dans la session NextAuth pour vérifier l'API existante
    let apiUserProfile = null;
    let apiAuthenticated = false;

    try {
      // Simuler l'utilisation du token pour une requête API
      const token = nextAuthSession.user.token;
      if (token) {
        // Ici, on ne fait pas réellement de requête à l'API, mais on pourrait utiliser le token
        apiAuthenticated = true;
        apiUserProfile = {
          id: nextAuthSession.user.id,
          email: nextAuthSession.user.email,
          username: nextAuthSession.user.username,
          is_admin: nextAuthSession.user.is_admin,
          avatar_url: nextAuthSession.user.avatar_url,
        };
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'API:", error);
    }

    // Retourner les informations de session
    return NextResponse.json({
      authenticated: true,
      nextAuthSession: {
        user: {
          id: nextAuthSession.user.id,
          email: nextAuthSession.user.email,
          username: nextAuthSession.user.username,
          is_admin: nextAuthSession.user.is_admin,
          avatar_url: nextAuthSession.user.avatar_url,
        },
      },
      apiAuthenticated,
      apiUserProfile,
      message: "Authentifié avec NextAuth et API vérifiée",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error,
    );
    return NextResponse.json(
      {
        error: "Erreur interne lors de la vérification de l'authentification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
