"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        totpCode: show2FA ? totpCode : undefined,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("TOTP_REQUIRED")) {
          setShow2FA(true);
          toast.info("Two-Factor Authentication (2FA) diperlukan. Silakan masukkan kode OTP.");
        } else {
          // Parse next-auth error or show directly
          toast.error(res.error || "Gagal masuk. Periksa email dan password Anda.");
        }
      } else {
        toast.success("Berhasil masuk! Selamat datang.");
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan.");
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
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}>
            <Lock size={24} style={{ color: "white" }} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
            {show2FA ? "Verifikasi 2FA" : "Masuk Akun"}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            {show2FA 
              ? "Masukkan kode 6 digit dari aplikasi authenticator Anda" 
              : "Masukkan email dan kata sandi Anda untuk melanjutkan"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {!show2FA ? (
            <>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={{
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
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                  Kata Sandi
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{
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
            </>
          ) : (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                Kode OTP 2FA
              </label>
              <div style={{ position: "relative" }}>
                <ShieldCheck size={18} style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "var(--color-text-muted)"
                }} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Contoh: 123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  style={{ paddingLeft: "42px", letterSpacing: "4px", fontSize: "18px", fontWeight: 700, textAlign: "center" }}
                />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShow2FA(false);
                  setTotpCode("");
                }}
                style={{
                  background: "none", border: "none", color: "var(--color-accent)",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600, marginTop: "10px",
                  fontFamily: "var(--font-sans)"
                }}
              >
                Kembali ke Login Sandi
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: "14px",
              fontSize: "15px",
              marginTop: "10px",
              borderRadius: "12px",
              background: "var(--color-primary)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Memproses..." : show2FA ? "Verifikasi & Masuk" : "Masuk"}
          </button>
        </form>

        <p style={{ fontSize: "14px", textAlign: "center", marginTop: "24px", color: "var(--color-text-muted)" }}>
          Belum punya akun?{" "}
          <Link href="/register" style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}>
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
