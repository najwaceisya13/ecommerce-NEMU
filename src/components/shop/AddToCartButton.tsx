"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export default function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Produk ditambahkan ke keranjang! 🛒");
      } else if (res.status === 401) {
        toast.error("Silakan login terlebih dahulu");
        window.location.href = "/login";
      } else {
        toast.error(data.error || "Gagal menambahkan ke keranjang");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Quantity selector */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0",
        border: "2px solid var(--color-border)", borderRadius: "12px",
        overflow: "hidden", width: "fit-content",
      }}>
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          style={{
            width: 44, height: 44,
            background: "var(--color-surface-2)", border: "none",
            cursor: "pointer", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          <Minus size={16} />
        </button>
        <span style={{
          width: 56, textAlign: "center",
          fontWeight: 700, fontSize: "16px",
        }}>
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
          disabled={quantity >= stock}
          style={{
            width: 44, height: 44,
            background: "var(--color-surface-2)", border: "none",
            cursor: quantity >= stock ? "not-allowed" : "pointer",
            fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
            opacity: quantity >= stock ? 0.5 : 1,
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={loading || stock === 0}
        className="btn-primary btn-accent"
        style={{
          padding: "16px 32px", fontSize: "16px", borderRadius: "14px",
          opacity: loading || stock === 0 ? 0.7 : 1,
          cursor: loading || stock === 0 ? "not-allowed" : "pointer",
        }}
      >
        <ShoppingCart size={20} />
        {stock === 0 ? "Stok Habis" : loading ? "Menambahkan..." : "Tambah ke Keranjang"}
      </button>
    </div>
  );
}
