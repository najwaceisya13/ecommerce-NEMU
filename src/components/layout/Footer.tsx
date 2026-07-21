"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Share2, MessageCircle, Users, Play } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-primary)", color: "rgba(255,255,255,0.7)" }}>
      {/* Top band */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--color-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>N</span>
              </div>
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: "-0.03em" }}>
                  NE<span style={{ color: "var(--color-accent)" }}>MU</span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em", fontWeight: 500 }}>
                  Temukan Apa Aja, Belanja Sesukamu
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 280, marginBottom: 24 }}>
              Platform belanja online terpercaya yang memudahkan kamu
              menemukan apa saja — dengan keamanan 2FA dan pengiriman cepat.
            </p>

            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <Phone size={13} />, text: "+62 812-3456-7890" },
                { icon: <Mail size={13} />, text: "support@famsworld.id" },
                { icon: <MapPin size={13} />, text: "Jakarta Selatan, Indonesia" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "var(--color-accent)" }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Navigasi
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { href: "/products", label: "Semua Produk" },
                { href: "/products?sale=true", label: "Flash Sale 🔥" },
                { href: "/cart", label: "Keranjang Belanja" },
                { href: "/orders", label: "Riwayat Pesanan" },
                { href: "/profile", label: "Profil Saya" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      fontSize: 13,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--color-accent)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Keamanan
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                "🔐 Two-Factor Auth (2FA)",
                "🔒 Password Bcrypt",
                "🛡️ JWT Session Secure",
                "☁️ Neon Cloud DB",
                "✅ SSL / HTTPS",
              ].map((item) => (
                <li key={item} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Pembayaran
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                "🏦 Transfer Bank",
                "🚚 COD (Cash on Delivery)",
                "💳 Virtual Account",
                "📱 E-Wallet",
              ].map((item) => (
                <li key={item} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  {item}
                </li>
              ))}
            </ul>

            {/* Socials */}
            <div style={{ marginTop: 24 }}>
              <p style={{ color: "white", fontWeight: 600, fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Ikuti Kami
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { icon: <Share2 size={16} />, label: "Instagram" },
                  { icon: <Users size={16} />, label: "Facebook" },
                  { icon: <MessageCircle size={16} />, label: "Twitter" },
                  { icon: <Play size={16} />, label: "YouTube" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    title={label}
                    style={{
                      width: 34, height: 34,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-accent)";
                      (e.currentTarget as HTMLElement).style.color = "white";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            maxWidth: 1280, margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            © 2025 NEMU. Hak cipta dilindungi undang-undang.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Kebijakan Privasi", "Syarat & Ketentuan", "Bantuan"].map((t) => (
              <Link
                key={t}
                href="#"
                style={{
                  fontSize: 12, color: "rgba(255,255,255,0.4)",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")
                }
              >
                {t}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Dibangun dengan Next.js · Neon · NextAuth 2FA
          </p>
        </div>
      </div>
    </footer>
  );
}
