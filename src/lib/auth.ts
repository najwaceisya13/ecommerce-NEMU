import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { verifySync } from "otplib";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        // Admin bypass — tidak perlu 2FA
        if (user.role === "ADMIN") {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
          };
        }

        // Jika 2FA sudah aktif, verifikasi OTP wajib
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          if (!credentials.totpCode) return null;

          const isValidTotp = verifySync({
            token: credentials.totpCode as string,
            secret: user.twoFactorSecret,
          });

          if (!isValidTotp) return null;
        }

        // Jika 2FA belum aktif, tolak login (user harus selesaikan setup 2FA dulu)
        if (!user.twoFactorEnabled) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    },
  },
});
