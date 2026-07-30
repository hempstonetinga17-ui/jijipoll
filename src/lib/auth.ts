import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      phoneNumber?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    phoneNumber?: string | null
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret_for_build_only",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phoneNumber: { label: "Phone Number", type: "text" },
        action: { label: "Action", type: "text" } // "login" or "register"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          if (credentials.action === 'register') {
            // Check if user exists
            const existingUser = await prisma.user.findFirst({
              where: {
                OR: [
                  { email: credentials.email as string },
                  ...(credentials.phoneNumber ? [{ phoneNumber: credentials.phoneNumber as string }] : [])
                ]
              }
            });

            if (existingUser) throw new Error("User already exists with this email or phone");

            const passwordHash = await bcrypt.hash(credentials.password as string, 10);
            const user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                passwordHash,
                phoneNumber: (credentials.phoneNumber as string) || null,
                role: "AGENT"
              }
            });
            return user;
          }

          // Otherwise, normal login
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user || !user.passwordHash) return null

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isPasswordValid) return null

          return user
        } catch (error) {
          console.error("Auth Error:", error);
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, ensure the user exists in our DB
      if (account?.provider === "google" && user.email) {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email }
          })
          if (!existing) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name ?? null,
                image: user.image ?? null,
                role: "AGENT",
                status: "ACTIVE",
              }
            })
            user.id = newUser.id
            ;(user as any).role = newUser.role
          } else {
            user.id = existing.id
            ;(user as any).role = existing.role
          }
        } catch (err) {
          console.error("signIn callback error:", err)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, populate token from user object
      if (user) {
        token["id"] = user.id
        token["role"] = (user as any).role ?? "AGENT"
        token["phoneNumber"] = (user as any).phoneNumber ?? null
        token["email"] = user.email
      }
      // Always re-verify the DB id using email to prevent stale Google IDs
      // This runs on every request where the token is refreshed
      if (!token["id"] || (account?.provider === "google" && token["email"])) {
        try {
          const email = token["email"] as string | undefined
          if (email) {
            const dbUser = await prisma.user.findUnique({ where: { email } })
            if (dbUser) {
              token["id"] = dbUser.id
              token["role"] = dbUser.role
              token["phoneNumber"] = dbUser.phoneNumber ?? null
            }
          }
        } catch (err) {
          console.error("jwt DB lookup error:", err)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phoneNumber = token.phoneNumber as string | null
      }
      return session
    }
  }
})

