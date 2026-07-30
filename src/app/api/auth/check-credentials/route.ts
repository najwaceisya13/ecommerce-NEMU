import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
});

// Endpoint pre-validasi sebelum signIn() dipanggil.
// Mengembalikan status 2FA user tanpa membuat session.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ status: "INVALID_CREDENTIALS" }, { status: 400 });
    }

    const { email, password, totpCode } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ status: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ status: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    // User belum punya secret sama sekali → generate & simpan secret, tampilkan QR
    if (!user.twoFactorEnabled && !user.twoFactorSecret) {
      const secret = generateSecret();
      const otpAuthUrl = generateURI({ label: user.email, issuer: "NEMU Shop", secret });
      const qrCode = await QRCode.toDataURL(otpAuthUrl);

      await prisma.user.update({ where: { email }, data: { twoFactorSecret: secret } });

      return NextResponse.json({ status: "2FA_SETUP_REQUIRED", qrCode });
    }

    // User punya secret tapi belum aktifkan 2FA → tampilkan QR yang sama
    if (!user.twoFactorEnabled && user.twoFactorSecret) {
      const otpAuthUrl = generateURI({
        label: user.email,
        issuer: "NEMU Shop",
        secret: user.twoFactorSecret,
      });
      const qrCode = await QRCode.toDataURL(otpAuthUrl);

      return NextResponse.json({ status: "2FA_SETUP_REQUIRED", qrCode });
    }

    // 2FA aktif, tapi OTP belum diberikan → minta OTP
    if (user.twoFactorEnabled && user.twoFactorSecret && !totpCode) {
      return NextResponse.json({ status: "TOTP_REQUIRED" });
    }

    // 2FA aktif, verifikasi OTP
    if (user.twoFactorEnabled && user.twoFactorSecret && totpCode) {
      const isValidOtp = verifySync({ token: totpCode, secret: user.twoFactorSecret });
      if (!isValidOtp) {
        return NextResponse.json({ status: "INVALID_OTP" }, { status: 400 });
      }
      return NextResponse.json({ status: "OK" });
    }

    return NextResponse.json({ status: "INVALID_CREDENTIALS" }, { status: 401 });
  } catch (error) {
    console.error("check-credentials error:", error);
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}
