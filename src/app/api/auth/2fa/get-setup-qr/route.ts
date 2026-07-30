import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateURI } from "otplib";
import QRCode from "qrcode";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

// Endpoint untuk mendapatkan QR code setup 2FA bagi user yang belum mengaktifkan 2FA.
// Hanya bisa digunakan jika user punya secret (twoFactorEnabled=false & twoFactorSecret!=null)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, twoFactorSecret: true, twoFactorEnabled: true },
    });

    // Tolak jika user tidak ada, 2FA sudah aktif, atau belum ada secret
    if (!user || user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "QR tidak tersedia" }, { status: 404 });
    }

    const otpAuthUrl = generateURI({
      label: user.email,
      issuer: "NEMU Shop",
      secret: user.twoFactorSecret,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    return NextResponse.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error("get-setup-qr error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
