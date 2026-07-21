"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      if (resProd.ok && resCat.ok) {
        const dataProd = await resProd.json();
        const dataCat = await resCat.json();
        setProducts(dataProd.products);
        setCategories(dataCat.categories);
      } else {
        toast.error("Gagal mengambil data");
      }
    } catch {
      toast.error("Kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setPrice("");
    setStock("");
    setImage("/products/tshirt.jpg"); // default placeholder image
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategoryId(product.category.id);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImage(product.image);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Produk berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus produk");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const payload = {
      name,
      slug,
      categoryId,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      image,
    };

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}` 
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingProduct ? "Produk diperbarui!" : "Produk ditambahkan!");
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || "Gagal menyimpan produk");
      }
    } catch {
      toast.error("Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Kelola Produk</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Tambah, edit, dan kelola semua stok produk e-commerce Anda
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary btn-accent" style={{ display: "inline-flex", borderRadius: "10px" }}>
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {/* Table Products */}
      <div className="glass-card" style={{
        padding: "32px", borderRadius: "24px",
        border: "1px solid var(--color-border)",
      }}>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)" }}>
            Belum ada produk tersedia. Silakan tambah produk baru.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>PRODUK</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>KATEGORI</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>HARGA</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>STOK</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700, textAlign: "right" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "8px",
                        background: "linear-gradient(135deg, #f0ede8, #e8e4de)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", overflow: "hidden", flexShrink: 0
                      }}>
                        {product.image && (product.image.startsWith("data:") || product.image.startsWith("http") || product.image.startsWith("/")) ? (
                          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "👕"
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, display: "block" }}>{product.name}</span>
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{product.slug}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                        {product.category.name}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 700 }}>{formatPrice(product.price)}</td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      <span style={{
                        fontWeight: 700,
                        color: product.stock > 5 ? "var(--color-text)" : "#dc2626",
                        background: product.stock > 5 ? "var(--color-surface-2)" : "#fee2e2",
                        padding: "4px 8px", borderRadius: "6px"
                      }}>
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => openEditModal(product)}
                          style={{
                            width: 36, height: 36, borderRadius: "8px", border: "1.5px solid var(--color-border)",
                            background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--color-text)"
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            width: 36, height: 36, borderRadius: "8px", border: "1.5px solid #fee2e2",
                            background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#dc2626"
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ADD / EDIT */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px"
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: "100%", maxWidth: "560px", borderRadius: "24px",
            padding: "32px", boxShadow: "var(--shadow-lg)"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Nama Produk</label>
                <input
                  type="text" required placeholder="Contoh: Kemeja Flanel Premium"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Kategori</label>
                  <select
                    value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                    className="input-field" required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Foto Produk (Upload File)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Ukuran file gambar maksimal 5MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="input-field"
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* Preview Gambar */}
              {image && (
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "var(--color-text-muted)", fontWeight: 600 }}>Pratinjau Gambar</label>
                  <div style={{ width: "100%", height: "120px", borderRadius: "12px", border: "1.5px dashed var(--color-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
                    <img src={image} alt="Preview" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Harga (Rp)</label>
                  <input
                    type="number" required placeholder="Contoh: 150000"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Stok</label>
                  <input
                    type="number" required placeholder="10"
                    value={stock} onChange={(e) => setStock(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Deskripsi Produk</label>
                <textarea
                  required placeholder="Tuliskan deskripsi lengkap mengenai detail produk..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field" rows={4} style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  style={{
                    background: "none", border: "none", color: "var(--color-text-muted)",
                    fontWeight: 600, cursor: "pointer", fontSize: "14px"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="btn-primary"
                  style={{ padding: "12px 24px", borderRadius: "10px", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
