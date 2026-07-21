"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Clock, ShieldCheck, MapPin, Truck, ChevronRight } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  price: string;
  quantity: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  paymentMethod: "BANK_TRANSFER" | "COD";
  shippingAddress: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <span className="badge badge-warning">Menunggu Pembayaran</span>;
    case "PROCESSING":
      return <span className="badge badge-info">Diproses</span>;
    case "SHIPPED":
      return <span className="badge badge-primary" style={{ background: "rgba(59,130,246,0.1)", color: "#2563eb" }}>Dikirim</span>;
    case "COMPLETED":
      return <span className="badge badge-success">Selesai</span>;
    case "CANCELLED":
      return <span className="badge badge-danger">Dibatalkan</span>;
    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          toast.error("Gagal mengambil riwayat pesanan");
        }
      } catch {
        toast.error("Kesalahan jaringan");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "80px 24px" }}>
        <div className="skeleton" style={{ width: "100%", height: "300px", borderRadius: "16px" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "12px",
          background: "var(--color-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white"
        }}>
          <ClipboardList size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Riwayat Pesanan</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "2px" }}>
            Kelola dan pantau seluruh pesanan belanja Anda
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 24px",
          background: "white", borderRadius: "24px",
          boxShadow: "var(--shadow)",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            Belum Ada Pesanan
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
            Anda belum pernah membuat transaksi belanja di NEMU
          </p>
          <Link href="/products" className="btn-primary" style={{ display: "inline-flex" }}>
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{
              borderRadius: "20px", overflow: "hidden",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow)",
            }}>
              {/* Header */}
              <div style={{
                background: "var(--color-surface-2)",
                padding: "20px 24px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "block" }}>ID PESANAN</span>
                    <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "monospace" }}>{order.id}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "block" }}>TANGGAL</span>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Body */}
              <div style={{ padding: "24px" }}>
                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: "10px",
                        background: "linear-gradient(135deg, #f0ede8, #e8e4de)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "24px", flexShrink: 0
                      }}>
                        👕
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "15px" }}>{item.product.name}</p>
                        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                          {item.quantity} barang × {formatPrice(item.price)}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: "15px" }}>
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr style={{ border: "0", borderTop: "1px dashed var(--color-border)", marginBottom: "20px" }} />

                {/* Footer Info */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px",
                  fontSize: "14px", flexWrap: "wrap"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: 700 }}>
                      <MapPin size={15} style={{ color: "var(--color-accent)" }} />
                      Alamat Pengiriman
                    </div>
                    <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {order.shippingAddress}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "6px" }}>
                      Metode Pembayaran: <strong style={{ color: "var(--color-text)" }}>
                        {order.paymentMethod === "BANK_TRANSFER" ? "🏦 Transfer Bank" : "🚚 COD (Bayar di Tempat)"}
                      </strong>
                    </p>
                    <p style={{ fontSize: "18px", fontWeight: 800 }}>
                      Total Pembayaran: <span style={{ color: "var(--color-accent)", fontSize: "22px" }}>{formatPrice(order.total)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
