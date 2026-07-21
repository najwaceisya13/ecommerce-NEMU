"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, CreditCard, Truck, CheckCircle } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: { name: string; price: string; image: string };
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: "",
    paymentMethod: "BANK_TRANSFER" as "BANK_TRANSFER" | "COD",
  });

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        if (!data.cart || data.cart.items.length === 0) {
          router.push("/cart");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const total = cart?.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  ) ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shippingAddress.trim()) {
      toast.error("Alamat pengiriman wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Pesanan berhasil dibuat! 🎉");
        router.push("/orders");
      } else {
        toast.error(data.error || "Gagal membuat pesanan");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 24px" }}>
      <div className="skeleton" style={{ height: "500px", borderRadius: "16px" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>Checkout</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "40px" }}>
        Lengkapi informasi pengiriman Anda
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
          {/* Left: Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Shipping Address */}
            <div style={{
              background: "white", borderRadius: "20px",
              padding: "28px", boxShadow: "var(--shadow)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--color-accent), #c0392b)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MapPin size={18} style={{ color: "white" }} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Alamat Pengiriman</h2>
              </div>

              <textarea
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                placeholder="Masukkan alamat lengkap (jalan, kelurahan, kecamatan, kota, provinsi, kode pos)"
                rows={4}
                className="input-field"
                style={{ resize: "vertical", lineHeight: 1.6 }}
                required
              />
            </div>

            {/* Payment Method */}
            <div style={{
              background: "white", borderRadius: "20px",
              padding: "28px", boxShadow: "var(--shadow)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "10px",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CreditCard size={18} style={{ color: "white" }} />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Metode Pembayaran</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  {
                    value: "BANK_TRANSFER",
                    label: "Transfer Bank",
                    desc: "BCA, Mandiri, BNI, BRI",
                    icon: "🏦",
                  },
                  {
                    value: "COD",
                    label: "Cash on Delivery",
                    desc: "Bayar saat barang tiba",
                    icon: "🚚",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      border: `2px solid ${form.paymentMethod === method.value ? "var(--color-primary)" : "var(--color-border)"}`,
                      background: form.paymentMethod === method.value ? "rgba(26,26,46,0.04)" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={() => setForm({ ...form, paymentMethod: method.value as "BANK_TRANSFER" | "COD" })}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: "28px" }}>{method.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: "15px" }}>{method.label}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{method.desc}</p>
                    </div>
                    {form.paymentMethod === method.value && (
                      <CheckCircle size={20} style={{ color: "var(--color-primary)" }} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div style={{ height: "fit-content", position: "sticky", top: "90px" }}>
            <div style={{
              background: "white", borderRadius: "20px",
              padding: "28px", boxShadow: "var(--shadow)",
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
                Ringkasan Pesanan
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                {cart?.items.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "14px" }}>{item.product.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>× {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "14px" }}>
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  <span>Ongkir</span>
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>GRATIS</span>
                </div>
              </div>

              <div style={{
                borderTop: "2px solid var(--color-border)", paddingTop: "16px",
                display: "flex", justifyContent: "space-between",
                fontWeight: 800, fontSize: "20px", marginBottom: "24px",
              }}>
                <span>Total</span>
                <span style={{ color: "var(--color-primary)" }}>{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-accent"
                style={{
                  width: "100%", padding: "16px", fontSize: "16px",
                  borderRadius: "14px", justifyContent: "center",
                  opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Memproses..." : `Buat Pesanan • ${formatPrice(total)}`}
              </button>

              <p style={{
                textAlign: "center", fontSize: "12px",
                color: "var(--color-text-muted)", marginTop: "12px",
              }}>
                🔒 Transaksi aman & terenkripsi
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
