import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySync } from "otplib";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
});

// Endpoint ini digunakan saat registrasi (sebelum user punya session)
// Verifikasi OTP dan aktifkan 2FA berdasarkan email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      );
    }

    const { email, token } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA secret belum dibuat" }, { status: 400 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA sudah aktif" }, { status: 400 });
    }

    const isValid = verifySync({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Kode OTP tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    // Aktifkan 2FA
    await prisma.user.update({
      where: { email },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ message: "2FA berhasil diaktifkan! Silakan login." });
  } catch (error) {
    console.error("Setup-on-register 2FA error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
