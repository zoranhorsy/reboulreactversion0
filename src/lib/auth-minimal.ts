import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptionsMinimal: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Version ultra-simple pour test
        if (credentials?.email === "test@test.com" && credentials?.password === "test") {
          return {
            id: "1",
            email: credentials.email,
            username: "Test User",
            is_admin: false,
          };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
}; 