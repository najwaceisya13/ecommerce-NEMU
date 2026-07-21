"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Loader2, MapPin, Calendar, User, CreditCard } from "lucide-react";

interface OrderItem {
  id: string;
  price: string;
  quantity: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  paymentMethod: "BANK_TRANSFER" | "COD";
  shippingAddress: string;
  total: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        toast.error("Gagal mengambil data pesanan");
      }
    } catch {
      toast.error("Kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        toast.success("Status pesanan diperbarui!");
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={36} className="animate-pulse" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Kelola Pesanan</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Pantau semua transaksi masuk dan kelola status pengirimannya
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
          Belum ada pesanan masuk dari pelanggan.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{
              borderRadius: "20px", overflow: "hidden",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow)",
              background: "white"
            }}>
              {/* Top Banner */}
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
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", fontWeight: 700 }}>ID TRANSAKSI</span>
                    <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "monospace" }}>{order.id}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", fontWeight: 700 }}>TANGGAL MASUK</span>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {updatingId === order.id && <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-accent)" }} />}
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="input-field"
                    style={{
                      padding: "8px 12px", fontSize: "13px", fontWeight: 700, width: "160px",
                      background: 
                        order.status === "COMPLETED" ? "#dcfce7" : 
                        order.status === "PENDING" ? "#fef3c7" : 
                        order.status === "CANCELLED" ? "#fee2e2" : "#dbeafe",
                      color: 
                        order.status === "COMPLETED" ? "#166534" : 
                        order.status === "PENDING" ? "#92400e" : 
                        order.status === "CANCELLED" ? "#991b1b" : "#1e40af",
                      borderColor: "transparent",
                      cursor: "pointer"
                    }}
                  >
                    <option value="PENDING" style={{ background: "white", color: "black" }}>Pending</option>
                    <option value="PROCESSING" style={{ background: "white", color: "black" }}>Processing</option>
                    <option value="SHIPPED" style={{ background: "white", color: "black" }}>Shipped</option>
                    <option value="COMPLETED" style={{ background: "white", color: "black" }}>Completed</option>
                    <option value="CANCELLED" style={{ background: "white", color: "black" }}>Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Main Content */}
              <div style={{ padding: "24px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr",
                  gap: "32px",
                  flexWrap: "wrap"
                }}>
                  {/* Left: items and shipping address */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 700, display: "block", marginBottom: "10px" }}>
                        DAFTAR BARANG
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {order.items.map((item) => (
                          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                            <span style={{ fontWeight: 600 }}>
                              {item.product.name} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>× {item.quantity}</span>
                            </span>
                            <span style={{ fontWeight: 700 }}>
                              {formatPrice(Number(item.price) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 700, marginBottom: "6px" }}>
                        <MapPin size={14} style={{ color: "var(--color-accent)" }} />
                        ALAMAT PENGIRIMAN
                      </div>
                      <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--color-text)" }}>
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {/* Right: User profile and billing summary */}
                  <div style={{
                    borderLeft: "1px solid var(--color-border)",
                    paddingLeft: "32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 700, marginBottom: "8px" }}>
                        <User size={14} />
                        DETAIL PELANGGAN
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 700 }}>{order.user.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{order.user.email}</p>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 700, marginBottom: "8px" }}>
                        <CreditCard size={14} />
                        METODE PEMBAYARAN
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 700 }}>
                        {order.paymentMethod === "BANK_TRANSFER" ? "🏦 Transfer Bank" : "🚚 COD (Cash on Delivery)"}
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "block" }}>TOTAL PENDAPATAN</span>
                      <span style={{ fontSize: "24px", fontWeight: 900, color: "var(--color-accent)" }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
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
