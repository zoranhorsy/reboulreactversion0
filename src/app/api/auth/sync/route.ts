import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/api";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 * Route API qui permet de synchroniser le système d'auth existant avec NextAuth
 * Cette route configure un cookie spécial que NextAuth utilisera pour l'authentification
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le token JWT existant
    const token = getToken();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun token d'authentification trouvé",
        },
        { status: 401 },
      );
    }

    try {
      // Décoder le token pour obtenir les informations utilisateur
      // Nous supposons que le token est un JWT standard
      const decoded = jwt.decode(token);

      if (!decoded || typeof decoded !== "object") {
        return NextResponse.json(
          {
            success: false,
            message: "Token invalide ou non décodable",
          },
          { status: 400 },
        );
      }

      // Créer un cookie NextAuth spécial qui sera utilisé par le CredentialsProvider
      // Ce cookie est une solution temporaire jusqu'à ce que l'utilisateur se connecte via NextAuth
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000); // 24 heures

      // Configurer les cookies pour la session
      cookies().set("next-auth.session-token", token, {
        expires: expirationDate,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return NextResponse.json({
        success: true,
        message: "Session NextAuth synchronisée avec succès",
        user: {
          id: decoded.userId,
          name: decoded.username,
          email: decoded.email || "email@non.disponible",
          is_admin: decoded.is_admin || false,
        },
      });
    } catch (decodeError) {
      console.error("Erreur lors du décodage du token:", decodeError);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors du décodage du token",
          error:
            decodeError instanceof Error
              ? decodeError.message
              : String(decodeError),
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation de l'authentification:",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne lors de la synchronisation",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
