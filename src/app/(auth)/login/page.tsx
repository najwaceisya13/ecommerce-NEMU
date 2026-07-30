"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, QrCode, Smartphone, ArrowRight } from "lucide-react";

type LoginStep = "credentials" | "totp" | "setup2fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<LoginStep>("credentials");
  const [loading, setLoading] = useState(false);

  // State untuk 2FA setup (akun lama yang belum setup 2FA)
  const [setupQrCode, setSetupQrCode] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupOtp, setSetupOtp] = useState("");
  const [setupStep, setSetupStep] = useState<"qr" | "otp">("qr");
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        totpCode: step === "totp" ? totpCode : undefined,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("TOTP_REQUIRED")) {
          // User sudah punya 2FA aktif → minta kode OTP
          setStep("totp");
          toast.info("Masukkan kode OTP dari aplikasi authenticator Anda.");
        } else if (res.error.includes("2FA_SETUP_REQUIRED")) {
          // Akun lama belum setup 2FA → wajib setup sekarang
          const parts = res.error.split("::");
          const qrData = parts[1] || "";
          const userEmail = parts[2] || email;

          setSetupQrCode(qrData);
          setSetupEmail(userEmail);
          setStep("setup2fa");
          setSetupStep("qr");
          toast.info("Akun Anda perlu mengaktifkan 2FA. Silakan scan QR Code.");
        } else {
          toast.error(res.error || "Gagal masuk. Periksa email dan password Anda.");
        }
      } else {
        toast.success("Berhasil masuk! Selamat datang.");
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Aktifkan 2FA untuk akun lama (setelah QR di-scan dan OTP dikonfirmasi)
  const handleActivate2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupOtp.length !== 6) {
      toast.error("Kode OTP harus 6 digit");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/2fa/setup-on-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: setupEmail, token: setupOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("2FA berhasil diaktifkan! Silakan login kembali dengan kode OTP.");
        // Reset ke form login biasa
        setStep("credentials");
        setSetupOtp("");
        setSetupQrCode("");
        setTotpCode("");
        // Langsung coba login lagi supaya minta OTP
        const loginRes = await signIn("credentials", {
          email: setupEmail,
          password,
          redirect: false,
        });
        // Sekarang harusnya TOTP_REQUIRED
        if (loginRes?.error?.includes("TOTP_REQUIRED")) {
          setStep("totp");
          toast.info("Masukkan kode OTP dari authenticator untuk masuk.");
        }
      } else {
        toast.error(data.error || "Kode OTP tidak valid");
        setSetupOtp("");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setVerifying(false);
    }
  };

  // ===== UI =====
  const getTitle = () => {
    if (step === "totp") return "Verifikasi 2FA";
    if (step === "setup2fa") return setupStep === "qr" ? "Setup 2FA" : "Konfirmasi OTP";
    return "Masuk Akun";
  };

  const getSubtitle = () => {
    if (step === "totp") return "Masukkan kode 6 digit dari aplikasi authenticator Anda";
    if (step === "setup2fa" && setupStep === "qr") return "Scan QR Code dengan Google Authenticator untuk mengamankan akun Anda";
    if (step === "setup2fa" && setupStep === "otp") return "Masukkan kode OTP untuk mengkonfirmasi aktivasi 2FA";
    return "Masukkan email dan kata sandi Anda untuk melanjutkan";
  };

  const getIcon = () => {
    if (step === "totp") return <ShieldCheck size={24} style={{ color: "white" }} />;
    if (step === "setup2fa") return <QrCode size={24} style={{ color: "white" }} />;
    return <Lock size={24} style={{ color: "white" }} />;
  };

  const getIconBg = () => {
    if (step === "setup2fa") return "linear-gradient(135deg, var(--color-accent), var(--color-gold))";
    return "linear-gradient(135deg, var(--color-primary), var(--color-accent))";
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
        maxWidth: "440px",
        padding: "40px",
        borderRadius: "24px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "14px",
            background: getIconBg(),
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: "16px",
            transition: "background 0.3s ease",
          }}>
            {getIcon()}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
            {getTitle()}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
            {getSubtitle()}
          </p>
        </div>

        {/* ===== FORM: Email & Password ===== */}
        {step === "credentials" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                  type="email" required placeholder="nama@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field" style={{ paddingLeft: "42px" }}
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
                  type="password" required placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field" style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ padding: "14px", fontSize: "15px", marginTop: "10px", borderRadius: "12px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        )}

        {/* ===== FORM: Masukkan OTP (2FA sudah aktif) ===== */}
        {step === "totp" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                  type="text" required maxLength={6} placeholder="_ _ _ _ _ _"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  style={{ paddingLeft: "42px", letterSpacing: "8px", fontSize: "22px", fontWeight: 700, textAlign: "center" }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="btn-primary"
              style={{
                padding: "14px", fontSize: "15px", marginTop: "4px", borderRadius: "12px",
                opacity: (loading || totpCode.length !== 6) ? 0.7 : 1
              }}
            >
              {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setTotpCode(""); }}
              style={{
                background: "none", border: "none", color: "var(--color-accent)",
                cursor: "pointer", fontSize: "13px", fontWeight: 600,
                textAlign: "center", fontFamily: "var(--font-sans)",
              }}
            >
              ← Kembali ke Login
            </button>
          </form>
        )}

        {/* ===== 2FA SETUP (akun lama) — Sub-step: QR ===== */}
        {step === "setup2fa" && setupStep === "qr" && (
          <>
            {/* QR Code */}
            {setupQrCode && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <div style={{
                  padding: "12px", borderRadius: "16px", background: "white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "2px solid var(--color-border)",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={setupQrCode} alt="QR Code 2FA" style={{ width: 170, height: 170, display: "block" }} />
                </div>
              </div>
            )}

            {/* Instruksi */}
            <div style={{
              background: "var(--color-surface-2)", borderRadius: "12px",
              padding: "14px", marginBottom: "20px", border: "1px solid var(--color-border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Smartphone size={15} style={{ color: "var(--color-accent)" }} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Cara Scan:</span>
              </div>
              {[
                "Buka Google Authenticator / Authy",
                "Tap \"+\" → Scan QR Code",
                "Arahkan kamera ke QR di atas",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: "var(--color-accent)", color: "white",
                    fontSize: "10px", fontWeight: 700,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{s}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSetupStep("otp")}
              className="btn-primary"
              style={{
                width: "100%", padding: "14px", fontSize: "15px", borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <span>Sudah Scan, Lanjut</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ===== 2FA SETUP (akun lama) — Sub-step: OTP ===== */}
        {step === "setup2fa" && setupStep === "otp" && (
          <form onSubmit={handleActivate2FA} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                Kode OTP dari Authenticator
              </label>
              <div style={{ position: "relative" }}>
                <ShieldCheck size={18} style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "var(--color-text-muted)"
                }} />
                <input
                  type="text" required maxLength={6} placeholder="_ _ _ _ _ _"
                  value={setupOtp}
                  onChange={(e) => setSetupOtp(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  style={{ paddingLeft: "42px", letterSpacing: "8px", fontSize: "22px", fontWeight: 700, textAlign: "center" }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying || setupOtp.length !== 6}
              className="btn-primary"
              style={{
                padding: "14px", fontSize: "15px", borderRadius: "12px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                opacity: (verifying || setupOtp.length !== 6) ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {verifying ? "Mengaktifkan..." : (
                <><ShieldCheck size={16} /><span>Aktifkan 2FA & Masuk</span></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setSetupStep("qr"); setSetupOtp(""); }}
              style={{
                background: "none", border: "none", color: "var(--color-accent)",
                cursor: "pointer", fontSize: "13px", fontWeight: 600,
                textAlign: "center", fontFamily: "var(--font-sans)",
              }}
            >
              ← Kembali untuk Scan Ulang
            </button>
          </form>
        )}

        {/* Footer link */}
        {step === "credentials" && (
          <p style={{ fontSize: "14px", textAlign: "center", marginTop: "24px", color: "var(--color-text-muted)" }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}>
              Daftar Sekarang
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
