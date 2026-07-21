import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, SlidersHorizontal } from "lucide-react";

async function getProducts(categorySlug?: string, q?: string) {
  let categoryFilter: any = undefined;
  if (categorySlug) {
    const normalized = categorySlug.toLowerCase();
    const possibleSlugs = [normalized];
    if (normalized === "accessories") possibleSlugs.push("aksesoris");
    if (normalized === "aksesoris") possibleSlugs.push("accessories");
    if (normalized === "home") possibleSlugs.push("rumah-dapur", "rumah");
    if (normalized === "sports") possibleSlugs.push("olahraga");

    categoryFilter = {
      OR: [
        { slug: { in: possibleSlugs, mode: "insensitive" } },
        { name: { contains: categorySlug, mode: "insensitive" } },
      ],
    };
  }

  return prisma.product.findMany({
    where: {
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export const metadata = { title: "Semua Produk" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(category, q),
    getCategories(),
  ]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "8px" }}>
          Semua Produk
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "16px" }}>
          {products.length} produk ditemukan
          {q && ` untuk "${q}"`}
          {category && ` dalam kategori "${categories.find(c => c.slug === category)?.name}"`}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        display: "flex", gap: "12px", marginBottom: "40px",
        flexWrap: "wrap", alignItems: "center",
      }}>
        {/* Search */}
        <form method="GET" style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "360px" }}>
          <Search size={16} style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
          }} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari produk..."
            className="input-field"
            style={{ paddingLeft: "40px" }}
          />
          {category && <input type="hidden" name="category" value={category} />}
        </form>

        {/* Category filter */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link
            href="/products"
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              border: `2px solid ${!category ? "var(--color-primary)" : "var(--color-border)"}`,
              background: !category ? "var(--color-primary)" : "transparent",
              color: !category ? "white" : "var(--color-text)",
              transition: "all 0.2s",
            }}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                border: `2px solid ${category === cat.slug ? "var(--color-primary)" : "var(--color-border)"}`,
                background: category === cat.slug ? "var(--color-primary)" : "transparent",
                color: category === cat.slug ? "white" : "var(--color-text)",
                transition: "all 0.2s",
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "100px 24px",
          color: "var(--color-text-muted)",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
          <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
            Produk tidak ditemukan
          </h3>
          <p>Coba kata kunci atau filter yang berbeda</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>
            Lihat Semua Produk
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "24px",
        }}>
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
              <div className="product-card">
                <div style={{
                  width: "100%", aspectRatio: "3/4",
                  background: "linear-gradient(135deg, #f0ede8 0%, #e8e4de 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "72px", position: "relative", overflow: "hidden"
                }}>
                  {product.image && (product.image.startsWith("data:") || product.image.startsWith("http") || product.image.startsWith("/")) ? (
                    <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    product.category.name === "Fashion" ? "👕" : "💻"
                  )}
                  {product.stock === 0 && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        background: "var(--color-accent)",
                        color: "white",
                        padding: "6px 16px",
                        borderRadius: "999px",
                        fontWeight: 700, fontSize: "13px",
                      }}>Habis</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "20px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, color: "var(--color-accent)",
                    textTransform: "uppercase", letterSpacing: "0.5px",
                  }}>
                    {product.category.name}
                  </span>
                  <h2 style={{
                    fontWeight: 700, fontSize: "16px",
                    margin: "6px 0 8px", color: "var(--color-text)",
                  }}>
                    {product.name}
                  </h2>
                  <p style={{
                    fontSize: "13px", color: "var(--color-text-muted)",
                    marginBottom: "16px", lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {product.description}
                  </p>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontWeight: 800, fontSize: "18px", color: "var(--color-primary)" }}>
                      {formatPrice(product.price.toString())}
                    </span>
                    <span style={{
                      fontSize: "12px",
                      color: product.stock > 5 ? "var(--color-text-muted)" : "#dc2626",
                      background: product.stock > 5 ? "var(--color-surface-2)" : "#fee2e2",
                      padding: "4px 8px", borderRadius: "6px", fontWeight: 600,
                    }}>
                      Stok: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
