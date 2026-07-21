"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    image: string;
    stock: number;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch {
      toast.error("Gagal memuat keranjang");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (res.ok) fetchCart();
    else toast.error("Gagal mengupdate keranjang");
  };

  const deleteItem = async (itemId: string) => {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) {
      toast.success("Item dihapus dari keranjang");
      fetchCart();
    } else {
      toast.error("Gagal menghapus item");
    }
  };

  const total = cart?.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  ) ?? 0;

  if (loading) return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div className="skeleton" style={{ width: "100%", height: "400px", borderRadius: "16px" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "40px" }}>
        Keranjang Belanja 🛒
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "100px 24px",
          background: "white", borderRadius: "24px",
          boxShadow: "var(--shadow)",
        }}>
          <div style={{ fontSize: "80px", marginBottom: "24px" }}>🛒</div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
            Keranjang Kosong
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "32px" }}>
            Belum ada produk di keranjang Anda
          </p>
          <Link href="/products" className="btn-primary btn-accent" style={{
            padding: "14px 28px", fontSize: "15px", display: "inline-flex",
          }}>
            <ShoppingBag size={18} />
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }}>
          {/* Cart items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                boxShadow: "var(--shadow)",
              }}>
                {/* Image */}
                <div style={{
                  width: 100, height: 100, borderRadius: "12px", flexShrink: 0,
                  background: "linear-gradient(135deg, #f0ede8, #e8e4de)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "40px",
                }}>
                  👕
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <Link href={`/products/${item.product.slug}`} style={{
                    fontWeight: 700, fontSize: "16px",
                    textDecoration: "none", color: "var(--color-text)",
                  }}>
                    {item.product.name}
                  </Link>
                  <p style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "18px", marginTop: "4px" }}>
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Quantity */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0",
                  border: "1.5px solid var(--color-border)", borderRadius: "10px", overflow: "hidden",
                }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: 36, height: 36, border: "none",
                      background: "var(--color-surface-2)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    style={{
                      width: 36, height: 36, border: "none",
                      background: "var(--color-surface-2)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: item.quantity >= item.product.stock ? 0.4 : 1,
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: "right", minWidth: "120px" }}>
                  <p style={{ fontWeight: 800, fontSize: "16px" }}>
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    width: 40, height: 40, borderRadius: "10px",
                    border: "1.5px solid #fee2e2", background: "transparent",
                    cursor: "pointer", color: "#dc2626",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{
            background: "white", borderRadius: "20px",
            padding: "28px", boxShadow: "var(--shadow)",
            height: "fit-content", position: "sticky", top: "90px",
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>
              Ringkasan Pesanan
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {cart.items.map((item) => (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "14px", color: "var(--color-text-muted)",
                }}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "16px", marginBottom: "24px",
              display: "flex", justifyContent: "space-between",
              fontWeight: 800, fontSize: "20px",
            }}>
              <span>Total</span>
              <span style={{ color: "var(--color-primary)" }}>{formatPrice(total)}</span>
            </div>

            <Link href="/checkout" className="btn-primary btn-accent" style={{
              width: "100%", padding: "16px", fontSize: "16px",
              borderRadius: "14px", justifyContent: "center",
            }}>
              Lanjut Checkout
              <ArrowRight size={18} />
            </Link>

            <Link href="/products" style={{
              display: "block", textAlign: "center", marginTop: "12px",
              color: "var(--color-text-muted)", textDecoration: "none",
              fontSize: "14px",
            }}>
              Lanjut Belanja
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
