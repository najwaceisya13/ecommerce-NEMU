import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifySync } from "otplib";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, action } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA belum di-setup" }, { status: 400 });
    }

    const isValid = verifySync({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Kode OTP tidak valid" }, { status: 400 });
    }

    if (action === "enable") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: true },
      });
      return NextResponse.json({ message: "2FA berhasil diaktifkan" });
    }

    if (action === "disable") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
      });
      return NextResponse.json({ message: "2FA berhasil dinonaktifkan" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
