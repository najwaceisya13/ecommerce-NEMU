"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, QrCode, Smartphone, ArrowRight } from "lucide-react";

type LoginStep = "credentials" | "totp" | "setup_qr" | "setup_otp";

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<LoginStep>("credentials");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 2FA setup state (untuk akun yang belum setup 2FA)
  const [setupQrCode, setSetupQrCode] = useState("");
  const [setupOtp, setSetupOtp] = useState("");

  // ─── STEP 1: Cek email + password via endpoint terpisah ───────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/check-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      switch (data.status) {
        case "INVALID_CREDENTIALS":
          toast.error("Email atau password salah");
          break;

        case "2FA_SETUP_REQUIRED":
          setSetupQrCode(data.qrCode);
          setStep("setup_qr");
          toast.info("Scan QR Code untuk mengaktifkan 2FA terlebih dahulu.");
          break;

        case "TOTP_REQUIRED":
          setStep("totp");
          toast.info("Masukkan kode OTP dari aplikasi authenticator Anda.");
          break;

        case "OK": {
          // Admin bypass — langsung buat session tanpa 2FA
          const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
          if (signInRes?.ok) {
            toast.success("Berhasil masuk! Selamat datang.");
            router.push("/");
            router.refresh();
          } else {
            toast.error("Gagal masuk. Coba lagi.");
          }
          break;
        }

        default:
          toast.error("Terjadi kesalahan server. Coba lagi.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2a: Verifikasi OTP (untuk akun yang sudah punya 2FA aktif) ──────
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      // Pre-validasi OTP sebelum signIn() untuk menghindari NextAuth error
      const checkRes = await fetch("/api/auth/check-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totpCode }),
      });

      const checkData = await checkRes.json();

      if (checkData.status === "INVALID_OTP") {
        toast.error("Kode OTP tidak valid atau sudah kedaluwarsa");
        setTotpCode("");
        return;
      }

      if (checkData.status !== "OK") {
        toast.error("Terjadi kesalahan. Coba lagi.");
        return;
      }

      // OTP valid → panggil signIn() untuk buat session
      const res = await signIn("credentials", {
        email,
        password,
        totpCode,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Berhasil masuk! Selamat datang.");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Gagal membuat sesi. Coba lagi.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setVerifying(false);
    }
  };

  // ─── STEP 2b: Aktifkan 2FA setelah scan QR (untuk akun baru / belum setup) ─
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
        body: JSON.stringify({ email, token: setupOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("2FA berhasil diaktifkan! Masukkan kode OTP untuk masuk.");
        // Langsung ke step input OTP — tidak perlu redirect ke mana-mana
        setStep("totp");
        setTotpCode("");
        setSetupOtp("");
        setSetupQrCode("");
      } else {
        toast.error(data.error || "Kode OTP tidak valid. Coba lagi.");
        setSetupOtp("");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setVerifying(false);
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────

  const titles: Record<LoginStep, string> = {
    credentials: "Masuk Akun",
    totp: "Verifikasi 2FA",
    setup_qr: "Setup 2FA",
    setup_otp: "Konfirmasi OTP",
  };

  const subtitles: Record<LoginStep, string> = {
    credentials: "Masukkan email dan kata sandi Anda untuk melanjutkan",
    totp: "Masukkan kode 6 digit dari aplikasi authenticator Anda",
    setup_qr: "Scan QR Code di bawah ini dengan Google Authenticator atau Authy",
    setup_otp: "Masukkan kode OTP untuk mengkonfirmasi aktivasi 2FA",
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
            background: step === "setup_qr" || step === "setup_otp"
              ? "linear-gradient(135deg, var(--color-accent), var(--color-gold))"
              : "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: "16px", transition: "background 0.3s ease",
          }}>
            {step === "totp" || step === "setup_otp"
              ? <ShieldCheck size={24} style={{ color: "white" }} />
              : step === "setup_qr"
              ? <QrCode size={24} style={{ color: "white" }} />
              : <Lock size={24} style={{ color: "white" }} />
            }
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
            {titles[step]}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
            {subtitles[step]}
          </p>
        </div>

        {/* ── FORM: Email & Password ── */}
        {step === "credentials" && (
          <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  type="email" required placeholder="nama@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field" style={{ paddingLeft: "42px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Kata Sandi</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
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
              style={{ padding: "14px", fontSize: "15px", marginTop: "8px", borderRadius: "12px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        )}

        {/* ── FORM: OTP (2FA sudah aktif) ── */}
        {step === "totp" && (
          <form onSubmit={handleVerifyTotp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                Kode OTP dari Authenticator
              </label>
              <div style={{ position: "relative" }}>
                <ShieldCheck size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
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
              disabled={verifying || totpCode.length !== 6}
              className="btn-primary"
              style={{ padding: "14px", fontSize: "15px", borderRadius: "12px", opacity: (verifying || totpCode.length !== 6) ? 0.7 : 1 }}
            >
              {verifying ? "Memverifikasi..." : "Verifikasi & Masuk"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setTotpCode(""); }}
              style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: "13px", fontWeight: 600, textAlign: "center", fontFamily: "var(--font-sans)" }}
            >
              ← Kembali ke Login
            </button>
          </form>
        )}

        {/* ── SETUP 2FA: Tampilkan QR ── */}
        {step === "setup_qr" && (
          <>
            {setupQrCode && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <div style={{ padding: "12px", borderRadius: "16px", background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "2px solid var(--color-border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={setupQrCode} alt="QR Code 2FA" style={{ width: 175, height: 175, display: "block" }} />
                </div>
              </div>
            )}

            <div style={{ background: "var(--color-surface-2)", borderRadius: "12px", padding: "14px", marginBottom: "20px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Smartphone size={15} style={{ color: "var(--color-accent)" }} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Cara Scan:</span>
              </div>
              {["Buka Google Authenticator / Authy", "Tap \"+\" → Scan QR Code", "Arahkan kamera ke QR di atas"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: "var(--color-accent)", color: "white", fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{s}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("setup_otp")}
              className="btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <span>Sudah Scan, Lanjut</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ── SETUP 2FA: Konfirmasi OTP ── */}
        {step === "setup_otp" && (
          <form onSubmit={handleActivate2FA} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                Kode OTP dari Authenticator
              </label>
              <div style={{ position: "relative" }}>
                <ShieldCheck size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
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
              style={{ padding: "14px", fontSize: "15px", borderRadius: "12px", background: "linear-gradient(135deg, #22c55e, #16a34a)", opacity: (verifying || setupOtp.length !== 6) ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {verifying ? "Mengaktifkan..." : <><ShieldCheck size={16} /><span>Aktifkan 2FA & Masuk</span></>}
            </button>

            <button
              type="button"
              onClick={() => { setStep("setup_qr"); setSetupOtp(""); }}
              style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: "13px", fontWeight: 600, textAlign: "center", fontFamily: "var(--font-sans)" }}
            >
              ← Kembali untuk Scan Ulang
            </button>
          </form>
        )}

        {/* Footer */}
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
