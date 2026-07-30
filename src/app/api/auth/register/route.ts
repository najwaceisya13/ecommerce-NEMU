import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 2FA secret langsung saat registrasi
    const twoFactorSecret = generateSecret();
    const otpAuthUrl = generateURI({
      label: email,
      issuer: "NEMU Shop",
      secret: twoFactorSecret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        twoFactorSecret,       // Simpan secret, belum diaktifkan
        twoFactorEnabled: false,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user,
        qrCode: qrCodeDataUrl,
        secret: twoFactorSecret,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
