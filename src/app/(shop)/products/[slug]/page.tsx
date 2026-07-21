import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { ArrowLeft, Star, Shield, Truck } from "lucide-react";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Breadcrumb */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "40px", fontSize: "14px",
        color: "var(--color-text-muted)",
      }}>
        <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Beranda</Link>
        <span>/</span>
        <Link href="/products" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Produk</Link>
        <span>/</span>
        <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{product.name}</span>
      </div>

      {/* Back button */}
      <Link href="/products" style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        color: "var(--color-text-muted)", textDecoration: "none",
        marginBottom: "32px", fontSize: "14px",
        transition: "color 0.2s",
      }}>
        <ArrowLeft size={16} />
        Kembali ke Produk
      </Link>

      <div className="detail-grid" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "64px",
        alignItems: "start",
      }}>
        {/* Product Image */}
        <div>
          <div style={{
            borderRadius: "24px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #f8f5f0 0%, #ece8e2 100%)",
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "120px",
            boxShadow: "var(--shadow-lg)",
          }}>
            {product.image && (product.image.startsWith("data:") || product.image.startsWith("http") || product.image.startsWith("/")) ? (
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              product.category.name === "Fashion" ? "👕" : "💻"
            )}
          </div>

          {/* Thumbnails (decorative) */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                width: 80, height: 80, borderRadius: "12px",
                background: "linear-gradient(135deg, #f0ede8, #e8e4de)",
                border: i === 1 ? "2px solid var(--color-primary)" : "2px solid transparent",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
              }}>
                {product.category.name === "Fashion" ? "👕" : "💻"}
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <span style={{
            fontSize: "12px", fontWeight: 700, color: "var(--color-accent)",
            textTransform: "uppercase", letterSpacing: "1px",
          }}>
            {product.category.name}
          </span>

          <h1 style={{
            fontSize: "36px", fontWeight: 900, marginTop: "12px",
            marginBottom: "16px", lineHeight: 1.2,
          }}>
            {product.name}
          </h1>

          {/* Rating (decorative) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={16} fill="#f5a623" style={{ color: "#f5a623" }} />
            ))}
            <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>(128 ulasan)</span>
          </div>

          <p style={{
            fontSize: "40px", fontWeight: 900, color: "var(--color-primary)",
            marginBottom: "24px",
          }}>
            {formatPrice(product.price.toString())}
          </p>

          <p style={{
            fontSize: "16px", lineHeight: 1.7, color: "var(--color-text-muted)",
            marginBottom: "32px",
          }}>
            {product.description}
          </p>

          {/* Stock info */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "8px 16px", borderRadius: "999px",
            background: product.stock > 10 ? "#dcfce7" : product.stock > 0 ? "#fef3c7" : "#fee2e2",
            color: product.stock > 10 ? "#166534" : product.stock > 0 ? "#92400e" : "#991b1b",
            fontSize: "14px", fontWeight: 600, marginBottom: "32px",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: product.stock > 10 ? "#22c55e" : product.stock > 0 ? "#f59e0b" : "#ef4444",
            }} />
            {product.stock > 10 ? `Stok tersedia: ${product.stock}` :
             product.stock > 0 ? `Stok tersisa: ${product.stock}` :
             "Stok habis"}
          </div>

          {/* Add to cart */}
          <AddToCartButton productId={product.id} stock={product.stock} />

          {/* Guarantees */}
          <div style={{
            marginTop: "40px", display: "flex", flexDirection: "column", gap: "16px",
            borderTop: "1px solid var(--color-border)", paddingTop: "32px",
          }}>
            {[
              { icon: <Truck size={18} />, text: "Gratis ongkir untuk pembelian di atas Rp 200.000" },
              { icon: <Shield size={18} />, text: "Garansi produk asli 100%" },
              { icon: <Star size={18} />, text: "Pembayaran aman & terenkripsi" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "var(--color-accent)", flexShrink: 0 }}>{icon}</div>
                <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
