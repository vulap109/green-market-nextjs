import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { normalizeAuthRole, verifyPassword } from "@/lib/auth/login";

function readCredential(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Mật khẩu",
          type: "password"
        }
      },
      async authorize(credentials) {
        const email = readCredential(credentials?.email).toLowerCase();
        const password = readCredential(credentials?.password);

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            email: true,
            fullName: true,
            id: true,
            passwordHash: true,
            role: true,
            status: true
          }
        });

        if (!user?.passwordHash || user.status.toLowerCase() !== "active") {
          return null;
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        await prisma.user
          .update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }
          })
          .catch(() => null);

        return {
          email: user.email,
          id: user.id.toString(),
          name: user.fullName,
          role: normalizeAuthRole(user.role)
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeAuthRole(user.role);
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : token.sub ?? "";
        session.user.role = normalizeAuthRole(typeof token.role === "string" ? token.role : null);
      }

      return session;
    }
  },
  session: {
    maxAge: 60 * 60 * 24 * 7,
    strategy: "jwt"
  },
  trustHost: true
});
