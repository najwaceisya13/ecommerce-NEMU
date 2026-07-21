"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        toast.error("Gagal memuat kategori");
      }
    } catch {
      toast.error("Kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini? Semua produk di kategori ini juga akan ikut terpengaruh.")) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Kategori berhasil dihapus");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus kategori");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Kategori baru ditambahkan!");
        setName("");
        setModalOpen(false);
        fetchCategories();
      } else {
        toast.error(data.error || "Gagal menambahkan kategori");
      }
    } catch {
      toast.error("Terjadi kesalahan");
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
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>Kelola Kategori</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Buat dan kelola klasifikasi kategori produk fashion Anda
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary btn-accent" style={{ display: "inline-flex", borderRadius: "10px" }}>
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Grid Categories */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px"
      }}>
        {categories.map((category) => (
          <div key={category.id} className="glass-card" style={{
            padding: "24px", borderRadius: "18px",
            border: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "10px",
                background: "var(--color-surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-primary)"
              }}>
                <FolderOpen size={20} />
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: "16px", display: "block" }}>{category.name}</span>
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  {category._count.products} Produk
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(category.id)}
              style={{
                width: 36, height: 36, borderRadius: "8px", border: "1.5px solid #fee2e2",
                background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#dc2626"
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL ADD */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px"
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: "100%", maxWidth: "400px", borderRadius: "20px",
            padding: "28px", boxShadow: "var(--shadow-lg)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>
              Tambah Kategori Baru
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Nama Kategori</label>
                <input
                  type="text" required placeholder="Contoh: Outerwear, Celana, Aksesoris"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
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
                  style={{ padding: "10px 20px", borderRadius: "8px", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
