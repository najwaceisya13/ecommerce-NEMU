"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { User, Mail, Lock, CheckCircle2, ShieldCheck, QrCode, ArrowRight, Smartphone } from "lucide-react";

type Step = "form" | "qr" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");

  // Step 1 - Form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2 & 3 - 2FA data
  const [qrCode, setQrCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // --- STEP 1: Registrasi ---
  const handleRegister = async (e: React.FormEvent) => {
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
        setQrCode(data.qrCode);
        setRegisteredEmail(email);
        toast.success("Akun berhasil dibuat! Sekarang setup 2FA Anda.");
        setStep("qr");
      } else {
        toast.error(data.error || "Gagal mendaftar");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: Verifikasi OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Kode OTP harus 6 digit");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/2fa/setup-on-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, token: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("2FA berhasil diaktifkan! Silakan login.");
        router.push("/login");
      } else {
        toast.error(data.error || "Kode OTP tidak valid");
        setOtpCode("");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setVerifying(false);
    }
  };

  const stepLabels = ["Buat Akun", "Scan QR", "Konfirmasi OTP"];
  const stepIcons = [User, QrCode, ShieldCheck];
  const currentStepIndex = step === "form" ? 0 : step === "qr" ? 1 : 2;

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
        maxWidth: "460px",
        padding: "40px",
        borderRadius: "24px",
      }}>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", gap: "0" }}>
          {stepLabels.map((label, idx) => {
            const Icon = stepIcons[idx];
            const isActive = idx === currentStepIndex;
            const isDone = idx < currentStepIndex;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDone
                      ? "var(--color-success, #22c55e)"
                      : isActive
                      ? "linear-gradient(135deg, var(--color-accent), var(--color-gold))"
                      : "var(--color-surface-2)",
                    border: isActive ? "none" : "2px solid var(--color-border)",
                    transition: "all 0.3s ease",
                  }}>
                    {isDone
                      ? <CheckCircle2 size={18} style={{ color: "white" }} />
                      : <Icon size={16} style={{ color: isActive ? "white" : "var(--color-text-muted)" }} />
                    }
                  </div>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                    whiteSpace: "nowrap",
                  }}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div style={{
                    width: "48px",
                    height: "2px",
                    background: idx < currentStepIndex ? "var(--color-accent)" : "var(--color-border)",
                    margin: "0 6px",
                    marginBottom: "20px",
                    transition: "background 0.3s ease",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ===== STEP 1: Form Registrasi ===== */}
        {step === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "14px",
                background: "linear-gradient(135deg, var(--color-accent), var(--color-gold))",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <User size={24} style={{ color: "white" }} />
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>Buat Akun</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
                Bergabung dengan NEMU hari ini — 2FA otomatis disetup
              </p>
            </div>

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                    type="text" required placeholder="Nama Anda"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="input-field" style={{ paddingLeft: "42px" }}
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
                    type="email" required placeholder="nama@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-field" style={{ paddingLeft: "42px" }}
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
                    type="password" required placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-field" style={{ paddingLeft: "42px" }}
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
                    type="password" required placeholder="••••••••"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field" style={{ paddingLeft: "42px" }}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary btn-accent"
                style={{
                  padding: "14px", fontSize: "15px", marginTop: "8px",
                  borderRadius: "12px", opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {loading ? "Mendaftar..." : (
                  <><span>Daftar & Setup 2FA</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p style={{ fontSize: "14px", textAlign: "center", marginTop: "24px", color: "var(--color-text-muted)" }}>
              Sudah punya akun?{" "}
              <Link href="/login" style={{ fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}>
                Masuk Di Sini
              </Link>
            </p>
          </>
        )}

        {/* ===== STEP 2: Scan QR Code ===== */}
        {step === "qr" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "14px",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <QrCode size={24} style={{ color: "white" }} />
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>Scan QR Code</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px", lineHeight: "1.6" }}>
                Buka aplikasi Google Authenticator atau Authy di HP Anda,<br />
                lalu scan QR code di bawah ini.
              </p>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div style={{
                display: "flex", justifyContent: "center", marginBottom: "24px",
              }}>
                <div style={{
                  padding: "12px",
                  borderRadius: "16px",
                  background: "white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  border: "2px solid var(--color-border)",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code 2FA" style={{ width: 180, height: 180, display: "block" }} />
                </div>
              </div>
            )}

            {/* Instruksi */}
            <div style={{
              background: "var(--color-surface-2)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              border: "1px solid var(--color-border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Smartphone size={16} style={{ color: "var(--color-accent)" }} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Cara Scan:</span>
              </div>
              {[
                "Buka Google Authenticator / Authy di HP",
                "Tap tombol \"+\" atau \"Tambah akun\"",
                "Pilih \"Scan QR Code\"",
                "Arahkan kamera ke QR di atas",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: "var(--color-accent)", color: "white",
                    fontSize: "11px", fontWeight: 700,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</span>
                  <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("otp")}
              className="btn-primary"
              style={{
                width: "100%", padding: "14px", fontSize: "15px",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <span>Sudah Scan, Lanjut</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ===== STEP 3: Konfirmasi OTP ===== */}
        {step === "otp" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "14px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <ShieldCheck size={24} style={{ color: "white" }} />
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>Konfirmasi OTP</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
                Masukkan kode 6 digit dari aplikasi authenticator Anda
                untuk mengaktifkan 2FA.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                    type="text"
                    required
                    maxLength={6}
                    placeholder="_ _ _ _ _ _"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="input-field"
                    style={{
                      paddingLeft: "42px",
                      letterSpacing: "8px",
                      fontSize: "22px",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || otpCode.length !== 6}
                className="btn-primary"
                style={{
                  padding: "14px", fontSize: "15px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  opacity: (verifying || otpCode.length !== 6) ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {verifying ? "Memverifikasi..." : (
                  <><ShieldCheck size={16} /><span>Aktifkan 2FA & Selesai</span></>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep("qr"); setOtpCode(""); }}
                style={{
                  background: "none", border: "none",
                  color: "var(--color-accent)", cursor: "pointer",
                  fontSize: "13px", fontWeight: 600, textAlign: "center",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ← Kembali untuk Scan Ulang
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
