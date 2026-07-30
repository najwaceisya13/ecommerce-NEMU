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
          throw new Error("Email dan password diperlukan");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Email atau password salah");
        }

        // Jika user belum setup 2FA sama sekali → generate secret dulu, lalu wajib setup
        if (!user.twoFactorEnabled && !user.twoFactorSecret) {
          const { generateSecret } = await import("otplib");
          const secret = generateSecret();

          // Simpan secret ke database (belum aktif)
          await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret },
          });

          // Hanya kirim email — QR diambil via endpoint /api/auth/2fa/get-setup-qr
          throw new Error(`2FA_SETUP_REQUIRED::${user.email}`);
        }

        // Jika 2FA sudah setup (secret ada) tapi belum diaktifkan
        if (!user.twoFactorEnabled && user.twoFactorSecret) {
          // Hanya kirim email — QR diambil via endpoint /api/auth/2fa/get-setup-qr
          throw new Error(`2FA_SETUP_REQUIRED::${user.email}`);
        }

        // Jika 2FA diaktifkan, verifikasi OTP
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          if (!credentials.totpCode) {
            throw new Error("TOTP_REQUIRED");
          }
          const isValidTotp = verifySync({
            token: credentials.totpCode as string,
            secret: user.twoFactorSecret,
          });
          if (!isValidTotp) {
            throw new Error("Kode 2FA tidak valid");
          }
        }

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
