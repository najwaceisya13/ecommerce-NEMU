"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { User, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    if (password.length < 8) {
      toast.error("Password minimal harus 8 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registrasi Berhasil! Silakan masuk.");
        router.push("/login");
      } else {
        toast.error(data.error || "Gagal mendaftar");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, var(--color-surface-2) 0%, #eef1f6 100%)"
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        borderRadius: "24px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-gold))",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}>
            <User size={24} style={{ color: "white" }} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
            Buat Akun
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Bergabung dengan NEMU hari ini secara gratis
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
              Nama Lengkap
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                color: "var(--color-text-muted)"
              }} />
              <input
                type="text"
                required
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                color: "var(--color-text-muted)"
              }} />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
              Kata Sandi (Min. 8 karakter)
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                color: "var(--color-text-muted)"
              }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
              Konfirmasi Kata Sandi
            </label>
            <div style={{ position: "relative" }}>
              <CheckCircle2 size={16} style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                color: "var(--color-text-muted)"
              }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-accent"
            style={{
              padding: "14px",
              fontSize: "15px",
              marginTop: "16px",
              borderRadius: "12px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Mendaftar..." : "Mendaftar"}
          </button>
        </form>

        <p style={{ fontSize: "14px", textAlign: "center", marginTop: "24px", color: "var(--color-text-muted)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}>
            Masuk Di Sini
          </Link>
        </p>
      </div>
    </main>
  );
}
