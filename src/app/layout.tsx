import type { Metadata } from "next";
import "./global.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "NEMU — Temukan Apa Aja, Belanja Sesukamu",
    template: "%s | NEMU",
  },
  description: "NEMU — platform belanja online terpercaya. Temukan apa aja, belanja sesukamu dengan aman berkat perlindungan 2FA.",
  keywords: ["nemu", "belanja online", "ecommerce", "produk premium", "fashion", "electronics", "temukan apa aja"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
