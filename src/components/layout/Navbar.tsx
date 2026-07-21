"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart, Package, User, LogOut, Shield,
  Search, Phone, MapPin, ChevronDown, Menu, X,
  Heart, Bell
} from "lucide-react";
import { useState, useEffect } from "react";

const FALLBACK_NAV_CATEGORIES = [
  { label: "Semua Produk", href: "/products" },
  { label: "Fashion", href: "/products?category=fashion" },
  { label: "Electronics", href: "/products?category=electronics" },
  { label: "Aksesoris", href: "/products?category=aksesoris" },
  { label: "Rumah & Dapur", href: "/products?category=rumah-dapur" },
  { label: "Olahraga", href: "/products?category=olahraga" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [dbCategories, setDbCategories] = useState<{ label: string; href: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories && data.categories.length > 0) {
          const fetched = [
            { label: "Semua Produk", href: "/products" },
            ...data.categories.map((c: { name: string; slug: string }) => ({
              label: c.name,
              href: `/products?category=${c.slug}`,
            })),
          ];
          setDbCategories(fetched);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = dbCategories.length > 0 ? dbCategories : FALLBACK_NAV_CATEGORIES;

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {/* ─── Top Bar ─── */}
      <div
        style={{
          background: "var(--color-primary)",
          color: "rgba(255,255,255,0.75)",
          fontSize: "12px",
          padding: "7px 24px",
        }}
      >
        <div
          className="top-info-bar"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={12} />
              +62 812-3456-7890
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={12} />
              Gratis Ongkir Min. Rp200rb
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {session ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>
                  Halo,{" "}
                  <strong style={{ color: "white" }}>
                    {session.user.name?.split(" ")[0]}
                  </strong>
                </span>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    style={{
                      color: "var(--color-gold)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontWeight: 600,
                    }}
                  >
                    <Shield size={12} />
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "var(--font-sans)",
                    padding: 0,
                  }}
                >
                  <LogOut size={12} />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "white")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.75)")
                  }
                >
                  Masuk
                </Link>
                <span style={{ opacity: 0.3 }}>|</span>
                <Link
                  href="/register"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "white")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.75)")
                  }
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Navbar ─── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid var(--color-border)",
          padding: "0 24px",
        }}
      >
        <div
          className="navbar-main-row"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            height: 72,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{ color: "var(--color-accent)", fontWeight: 900, fontSize: 18 }}
              >
                N
              </span>
            </div>
            <div style={{ lineHeight: 1 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 22,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                NE<span style={{ color: "var(--color-accent)" }}>MU</span>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.04em",
                  fontWeight: 500,
                }}
              >
                Temukan Apa Aja, Belanja Sesukamu
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <div
            className="navbar-search-box"
            style={{
              flex: 1,
              maxWidth: 560,
              display: "flex",
              border: "2px solid var(--color-primary)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <input
              type="text"
              placeholder="Cari produk, merek, dan kategori..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 16px",
                border: "none",
                outline: "none",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                color: "var(--color-text)",
              }}
            />
            <button
              style={{
                background: "var(--color-accent)",
                border: "none",
                padding: "0 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "white",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "var(--font-sans)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--color-accent-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--color-accent)")
              }
            >
              <Search size={16} />
              Cari
            </button>
          </div>

          {/* Right Icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            {session && (
              <>
                <NavIconBtn href="/profile" label="Akun" icon={<User size={20} />} />
                <NavIconBtn href="/orders" label="Pesanan" icon={<Package size={20} />} />
                <NavIconBtn
                  href="/cart"
                  label="Keranjang"
                  icon={<ShoppingCart size={20} />}
                  badge="3"
                  highlight
                />
              </>
            )}
            {!session && (
              <>
                <Link
                  href="/login"
                  className="btn-primary btn-dark"
                  style={{ padding: "9px 20px", fontSize: 13 }}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                  style={{ padding: "9px 20px", fontSize: 13 }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Category Nav ─── */}
      <nav
        style={{
          background: "var(--color-primary)",
          padding: "0 24px",
        }}
      >
        <div
          className="nav-scroll-categories"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* All Categories button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 20px",
              background: "var(--color-accent)",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            <Menu size={16} />
            Semua Kategori
            <ChevronDown size={14} />
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "13px 16px",
                color: "rgba(255,255,255,0.82)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "white";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.82)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          <Link
            href="/products?sale=true"
            style={{
              padding: "13px 16px",
              color: "var(--color-gold)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            🔥 Flash Sale
          </Link>
        </div>
      </nav>
    </header>
  );
}

function NavIconBtn({
  href,
  label,
  icon,
  badge,
  highlight,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "6px 12px",
        borderRadius: 8,
        textDecoration: "none",
        color: highlight ? "var(--color-accent)" : "var(--color-text)",
        fontSize: 10,
        fontWeight: 600,
        transition: "all 0.2s",
        position: "relative",
        background: highlight ? "var(--color-accent-light)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!highlight)
          (e.currentTarget as HTMLElement).style.background =
            "var(--color-surface-2)";
      }}
      onMouseLeave={(e) => {
        if (!highlight)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 6,
            background: "var(--color-accent)",
            color: "white",
            fontSize: 9,
            fontWeight: 800,
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </span>
      )}
      {icon}
      {label}
    </Link>
  );
}
