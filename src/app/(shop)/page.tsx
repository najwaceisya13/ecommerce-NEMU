import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight, ShieldCheck, Truck, Star, Zap,
  RefreshCw, Headphones, ChevronRight, Tag, Flame
} from "lucide-react";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    take: 8,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

const CATEGORY_ICONS: Record<string, { emoji: string; bg: string; color: string }> = {
  Fashion:    { emoji: "👕", bg: "#fff3e8", color: "#f47c20" },
  Electronics:{ emoji: "💻", bg: "#e8f4ff", color: "#2563eb" },
  Aksesoris:  { emoji: "💍", bg: "#fdf4ff", color: "#9333ea" },
  Rumah:      { emoji: "🏠", bg: "#f0fdf4", color: "#16a34a" },
  Olahraga:   { emoji: "⚽", bg: "#fefce8", color: "#ca8a04" },
  Kecantikan: { emoji: "💄", bg: "#fff1f2", color: "#e11d48" },
};

const PROMO_BANNERS = [
  {
    title: "UP TO 40% OFF",
    subtitle: "Promo Spesial Akhir Bulan",
    desc: "Diskon besar untuk semua kategori. Jangan sampai kehabisan!",
    bg: "linear-gradient(120deg, #0f1923 0%, #1a2d45 60%, #f47c20 100%)",
    badge: "Flash Sale",
    badgeBg: "#f47c20",
    href: "/products?sale=true",
    cta: "Belanja Sekarang",
  },
  {
    title: "Gratis Ongkir",
    subtitle: "Untuk Seluruh Indonesia",
    desc: "Pembelian di atas Rp 200.000 gratis ongkir ke seluruh wilayah.",
    bg: "linear-gradient(120deg, #162032 0%, #1e3a5f 60%, #2563eb 100%)",
    badge: "Terbatas",
    badgeBg: "#2563eb",
    href: "/products",
    cta: "Lihat Produk",
  },
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div>
      {/* ===== ANNOUNCEMENT TICKER ===== */}
      <div style={{ background: "var(--color-accent)", color: "white", fontSize: 13, fontWeight: 600, padding: "8px 0", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[
              "🔥 Flash Sale Setiap Hari — Diskon s.d. 40%",
              "🚚 Gratis Ongkir Pembelian Min. Rp200rb",
              "🔐 Belanja Aman dengan 2FA Authentication",
              "⭐ 10.000+ Pelanggan Puas — Rating 4.9/5",
              "🎁 Voucher Diskon untuk Member Baru",
              "📦 Pengiriman Express 1-2 Hari",
              "🔥 Flash Sale Setiap Hari — Diskon s.d. 40%",
              "🚚 Gratis Ongkir Pembelian Min. Rp200rb",
              "🔐 Belanja Aman dengan 2FA Authentication",
              "⭐ 10.000+ Pelanggan Puas — Rating 4.9/5",
              "🎁 Voucher Diskon untuk Member Baru",
              "📦 Pengiriman Express 1-2 Hari",
            ].map((text, i) => (
              <span key={i} style={{ marginRight: 56 }}>{text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section style={{ background: "var(--color-primary)", position: "relative", overflow: "hidden", padding: "0 24px", minHeight: "520px" }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,124,32,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", minHeight: 520, position: "relative", zIndex: 1 }}>
          {/* LEFT: copy */}
          <div className="animate-fade-in" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(244,124,32,0.15)", border: "1px solid rgba(244,124,32,0.35)", borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
              <Flame size={13} style={{ color: "var(--color-accent)" }} />
              <span style={{ color: "var(--color-accent)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Koleksi Terbaru 2025
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em" }}>
              TEMUKAN APA AJA,{" "}
              <span style={{ color: "var(--color-accent)" }}>BELANJA</span>{" "}
              SESUKAMU.
            </h1>

            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
              NEMU hadir untuk memudahkan kamu menemukan semua yang kamu butuhkan —
              dari fashion, elektronik, hingga aksesoris. Aman, cepat, terpercaya.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/products" className="btn-primary" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 8 }}>
                Belanja Sekarang <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-primary btn-outline-white" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 8 }}>
                Daftar Gratis
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, marginTop: 48, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { num: "500+", label: "Produk" },
                { num: "10K+", label: "Pelanggan" },
                { num: "4.9★", label: "Rating" },
                { num: "24/7", label: "Support" },
              ].map(({ num, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1 }}>{num}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 4, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: hero image */}
          <div className="animate-fade-in-right" style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", position: "relative", height: "100%", minHeight: 420 }}>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 360, height: 360, borderRadius: "50%", background: "var(--color-accent)", zIndex: 0 }} />
            <div className="animate-float" style={{ position: "relative", zIndex: 1, paddingBottom: 24 }}>
              <Image
                src="/hero-products.png"
                alt="Featured Products"
                width={400}
                height={380}
                style={{ objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
              />
            </div>
            {/* Floating badges */}
            <div className="glass-dark" style={{ position: "absolute", top: 40, left: 0, borderRadius: 12, padding: "12px 16px", zIndex: 2 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Flash Deal</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>40% OFF</div>
              <div style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 700 }}>Today Only</div>
            </div>
            <div className="glass-dark" style={{ position: "absolute", bottom: 80, left: 20, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, zIndex: 2 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={16} fill="white" color="white" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>4.9 / 5.0</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>10K+ Ulasan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <section style={{ background: "white", borderBottom: "1px solid var(--color-border)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            { icon: <Truck size={20} />, title: "Gratis Ongkir", desc: "Pembelian min. Rp 200rb" },
            { icon: <ShieldCheck size={20} />, title: "Aman & Terpercaya", desc: "2FA + enkripsi data" },
            { icon: <RefreshCw size={20} />, title: "Retur 30 Hari", desc: "Garansi uang kembali" },
            { icon: <Headphones size={20} />, title: "24/7 Support", desc: "Chat kapan saja" },
          ].map(({ icon, title, desc }, idx) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", borderRight: idx < 3 ? "1px solid var(--color-border)" : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{title}</p>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section style={{ padding: "60px 24px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="section-label"><Tag size={11} />Kategori</div>
              <h2 className="section-title">SHOP BY CATEGORY</h2>
            </div>
            <Link href="/products" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-accent)", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              Lihat Semua <ChevronRight size={15} />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
              {categories.map((cat) => {
                const meta = CATEGORY_ICONS[cat.name] ?? { emoji: "🛍️", bg: "#f5f6fa", color: "var(--color-accent)" };
                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`} className="category-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", background: meta.bg, textDecoration: "none", border: `1.5px solid ${meta.color}22` }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                      {meta.emoji}
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: meta.color, textAlign: "center", marginBottom: 4 }}>{cat.name}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{cat._count.products} Produk</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
              {Object.entries(CATEGORY_ICONS).map(([name, meta]) => (
                <Link key={name} href="/products" className="category-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", background: meta.bg, textDecoration: "none", border: `1.5px solid ${meta.color}22` }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                    {meta.emoji}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: meta.color, textAlign: "center", marginBottom: 4 }}>{name}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Lihat Produk</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== PROMO BANNERS ===== */}
      <section style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {PROMO_BANNERS.map((b) => (
            <Link
              key={b.title}
              href={b.href}
              className="promo-banner"
              style={{ display: "block", background: b.bg, borderRadius: 16, padding: "36px 36px", textDecoration: "none", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", bottom: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
              <span style={{ display: "inline-block", background: b.badgeBg, color: "white", borderRadius: 999, padding: "3px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
                {b.badge}
              </span>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{b.subtitle}</p>
              <h3 style={{ fontSize: 32, fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 10 }}>{b.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 24, maxWidth: 280 }}>{b.desc}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-accent)", color: "white", padding: "10px 22px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                {b.cta} <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section style={{ padding: "0 24px 60px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "48px 0 28px", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="section-label"><Flame size={11} />Terlaris</div>
              <h2 className="section-title">BEST SELLERS</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 6 }}>Produk favorit yang paling banyak dibeli</p>
            </div>
            <Link href="/products" className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }}>
              Lihat Semua <ArrowRight size={15} />
            </Link>
          </div>

          {bestSellers.length === 0 ? <EmptyProducts /> : <ProductGrid products={bestSellers} />}
        </div>
      </section>

      {/* ===== PROMO STRIP ===== */}
      <section style={{ background: "linear-gradient(100deg, #0f1923 0%, #f47c20 100%)", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "white", lineHeight: 1 }}>
              UP TO <span style={{ color: "var(--color-gold)" }}>40%</span> OFF
            </div>
            <div style={{ borderLeft: "2px solid rgba(255,255,255,0.2)", paddingLeft: 20 }}>
              <p style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 16 }}>BEST SELLER LIST</p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Promo berlaku hari ini saja</p>
            </div>
          </div>
          <Link href="/products?sale=true" className="btn-primary" style={{ background: "white", color: "var(--color-accent)", padding: "14px 36px", fontSize: 15, fontWeight: 800, borderRadius: 8 }}>
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="section-label" style={{ background: "#e8f4ff", color: "#2563eb" }}><Zap size={11} />Baru</div>
              <h2 className="section-title">NEW ARRIVALS</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 6 }}>Koleksi terbaru yang baru saja masuk</p>
            </div>
            <Link href="/products" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-accent)", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              Lihat Semua <ChevronRight size={15} />
            </Link>
          </div>

          {newArrivals.length === 0
            ? (bestSellers.length === 0 ? <EmptyProducts /> : <ProductGrid products={bestSellers} />)
            : <ProductGrid products={newArrivals} />}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section style={{ padding: "60px 24px", background: "var(--color-primary)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label" style={{ background: "rgba(244,124,32,0.15)", color: "var(--color-accent)", margin: "0 auto 12px" }}>Kenapa Kami?</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "white", marginBottom: 12 }}>TRUSTED BY THOUSANDS</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Kami berkomitmen memberikan pengalaman belanja terbaik</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { icon: <ShieldCheck size={28} />, title: "Keamanan 2FA", desc: "Akun Anda terlindungi dengan autentikasi dua faktor." },
              { icon: <Truck size={28} />, title: "Pengiriman Cepat", desc: "Estimasi 1–3 hari kerja ke seluruh Indonesia." },
              { icon: <Star size={28} />, title: "Produk Premium", desc: "Semua produk telah melalui seleksi kualitas ketat." },
              { icon: <Headphones size={28} />, title: "CS 24/7", desc: "Tim kami siap membantu kapan saja Anda butuhkan." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="feature-dark-card">
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(244,124,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", margin: "0 auto 18px" }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{ padding: "80px 24px", background: "var(--color-accent)", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <ShieldCheck size={40} style={{ color: "white", marginBottom: 16 }} />
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "white", lineHeight: 1.15, marginBottom: 16 }}>
            Belanja Aman dengan 2FA
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.75, marginBottom: 36 }}>
            Daftar sekarang dan nikmati perlindungan akun terbaik dengan autentikasi dua faktor.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary btn-dark" style={{ padding: "14px 36px", fontSize: 15, borderRadius: 10 }}>
              Buat Akun Gratis <ArrowRight size={18} />
            </Link>
            <Link href="/products" className="btn-primary btn-outline-white" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 10 }}>
              Jelajahi Produk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Sub-components ─── */

function ProductGrid({
  products,
}: {
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
      {products.map((product, idx) => (
        <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
          <div className="product-card">
            {/* Image */}
            <div
              style={{
                width: "100%", aspectRatio: "4/3",
                background: idx % 4 === 0
                  ? "linear-gradient(135deg, #fff3e8, #ffe0c4)"
                  : idx % 4 === 1
                  ? "linear-gradient(135deg, #e8f4ff, #bfdbfe)"
                  : idx % 4 === 2
                  ? "linear-gradient(135deg, #f0fdf4, #bbf7d0)"
                  : "linear-gradient(135deg, #fdf4ff, #e9d5ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 60, position: "relative", overflow: "hidden",
              }}
            >
              {product.image && (product.image.startsWith("data:") || product.image.startsWith("http") || product.image.startsWith("/")) ? (
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                product.category.name === "Fashion" ? "👕" : product.category.name === "Electronics" ? "💻" : "🛍️"
              )}
              <span style={{ position: "absolute", top: 10, left: 10, background: "var(--color-accent)", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em", zIndex: 1 }}>
                NEW
              </span>
            </div>

            <div style={{ padding: "14px 16px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {product.category.name}
              </span>
              <h3 style={{ fontWeight: 700, fontSize: 14, marginTop: 4, marginBottom: 6, color: "var(--color-text)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"], lineHeight: 1.4 }}>
                {product.name}
              </h3>

              {/* Stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 1 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>(4.8)</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: "var(--color-accent)" }}>
                  {formatPrice(product.price.toString())}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)", background: "var(--color-surface-2)", padding: "3px 8px", borderRadius: 6, fontWeight: 500 }}>
                  Stok: {product.stock}
                </span>
              </div>

              {/* Add to cart — CSS hover via .add-to-cart-btn */}
              <div className="add-to-cart-btn">
                + Tambah ke Keranjang
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyProducts() {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--color-text-muted)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
      <p style={{ fontWeight: 600 }}>Belum ada produk tersedia.</p>
      <p style={{ fontSize: 13, marginTop: 6 }}>Tambahkan produk melalui halaman admin.</p>
    </div>
  );
}
