import { prisma } from "@/lib/prisma";
import { ShoppingBag, FolderOpen, ClipboardList, Wallet, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [productCount, categoryCount, orderCount, orders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return {
    productCount,
    categoryCount,
    orderCount,
    totalRevenue,
    recentOrders: orders,
  };
}

function formatPrice(price: any) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      title: "Total Produk",
      value: stats.productCount,
      icon: <ShoppingBag size={24} style={{ color: "var(--color-accent)" }} />,
      bg: "rgba(233,69,96,0.1)",
      link: "/admin/products"
    },
    {
      title: "Total Kategori",
      value: stats.categoryCount,
      icon: <FolderOpen size={24} style={{ color: "var(--color-gold)" }} />,
      bg: "rgba(245,166,37,0.1)",
      link: "/admin/categories"
    },
    {
      title: "Total Pesanan",
      value: stats.orderCount,
      icon: <ClipboardList size={24} style={{ color: "#3b82f6" }} />,
      bg: "rgba(59,130,246,0.1)",
      link: "/admin/orders"
    },
    {
      title: "Total Pendapatan",
      value: formatPrice(stats.totalRevenue),
      icon: <Wallet size={24} style={{ color: "#10b981" }} />,
      bg: "rgba(16,185,129,0.1)",
      link: "/admin/orders"
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-primary)" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Ikhtisar performa bisnis dan operasional e-commerce
        </p>
      </div>

      {/* Grid Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px"
      }}>
        {cards.map((card, i) => (
          <div key={i} className="glass-card" style={{
            padding: "28px", borderRadius: "20px",
            border: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            transition: "transform 0.2s",
          }}>
            <div>
              <span style={{ color: "var(--color-text-muted)", fontSize: "14px", fontWeight: 600 }}>{card.title}</span>
              <p style={{ fontSize: "28px", fontWeight: 900, marginTop: "12px", color: "var(--color-primary)" }}>{card.value}</p>
              <Link href={card.link} style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "12px", fontWeight: 700, color: "var(--color-accent)",
                textDecoration: "none", marginTop: "16px"
              }}>
                Kelola data <ArrowUpRight size={12} />
              </Link>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: "14px",
              background: card.bg, display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="glass-card" style={{
        padding: "32px", borderRadius: "24px",
        border: "1px solid var(--color-border)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Pesanan Terbaru</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginTop: "2px" }}>
              5 transaksi terakhir dari pelanggan Anda
            </p>
          </div>
          <Link href="/admin/orders" className="btn-primary btn-outline" style={{ padding: "8px 16px", fontSize: "13px" }}>
            Lihat Semua Pesanan
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)" }}>
            Belum ada pesanan masuk.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>ID PESANAN</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>PELANGGAN</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>STATUS</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>METODE</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>TOTAL</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>TANGGAL</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 700, fontFamily: "monospace" }}>{order.id.slice(0, 8)}...</td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      <span style={{ fontWeight: 600, display: "block" }}>{order.user.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{order.user.email}</span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      {order.status === "PENDING" && <span className="badge badge-warning">Pending</span>}
                      {order.status === "PROCESSING" && <span className="badge badge-info">Processing</span>}
                      {order.status === "SHIPPED" && <span className="badge badge-primary" style={{ background: "rgba(59,130,246,0.1)", color: "#2563eb" }}>Shipped</span>}
                      {order.status === "COMPLETED" && <span className="badge badge-success">Completed</span>}
                      {order.status === "CANCELLED" && <span className="badge badge-danger">Cancelled</span>}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600 }}>{order.paymentMethod}</td>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 700 }}>{formatPrice(order.total.toString())}</td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "var(--color-text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
