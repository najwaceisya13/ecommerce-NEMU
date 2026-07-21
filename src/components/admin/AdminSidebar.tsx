"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Users, ArrowLeft } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/products", label: "Produk", icon: <ShoppingBag size={18} /> },
    { href: "/admin/categories", label: "Kategori", icon: <FolderOpen size={18} /> },
    { href: "/admin/orders", label: "Pesanan", icon: <ClipboardList size={18} /> },
  ];

  return (
    <aside className="admin-sidebar-nav" style={{
      width: "260px",
      borderRight: "1px solid var(--color-border)",
      background: "var(--color-primary)",
      color: "rgba(255, 255, 255, 0.7)",
      padding: "32px 24px",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      position: "sticky",
      top: 0
    }}>
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "10px",
          background: "linear-gradient(135deg, var(--color-accent), var(--color-gold))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: "16px" }}>A</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: "20px", color: "white" }}>
          Admin<span style={{ color: "var(--color-accent)" }}>Panel</span>
        </span>
      </div>

      {/* Nav Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                transition: "all 0.2s",
                borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.7)";
                }
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Shop Link */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.5)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "white";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.5)";
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Toko
        </Link>
      </div>
    </aside>
  );
}
