import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://reboul-store-api-production.up.railway.app";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" }, // Pour recevoir le token de l'API
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Si nous avons déjà un token (de l'AuthContext), on l'utilise
          if (credentials.token) {
            try {
              // Vérifier le token avec l'API
              const response = await axios.get(`${API_URL}/auth/me`, {
                headers: {
                  Authorization: `Bearer ${credentials.token}`,
                },
              });

              const user = response.data;
              return {
                id: user.id.toString(),
                email: user.email,
                username: user.username,
                is_admin: user.is_admin || false,
                token: credentials.token,
                avatar_url: user.avatar_url,
              };
            } catch (error) {
              console.error("Error verifying token:", error);
              return null;
            }
          }

          // Sinon, on fait une nouvelle connexion
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, token } = response.data;

          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            is_admin: user.is_admin || false,
            token: token,
            avatar_url: user.avatar_url,
          };
        } catch (error) {
          console.error("Error authorizing user:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.is_admin = user.is_admin;
        token.token = user.token;
        token.avatar_url = user.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.is_admin = token.is_admin as boolean;
        session.user.token = token.token as string;
        session.user.avatar_url = token.avatar_url as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/connexion",
    signOut: "/",
    error: "/connexion",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
};
