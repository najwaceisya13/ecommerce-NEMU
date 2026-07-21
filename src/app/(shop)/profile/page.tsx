"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Shield, ShieldAlert, ShieldCheck, User, Mail, Calendar, KeyRound, Copy, Check } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 2FA Setup states
  const [setupMode, setSetupMode] = useState(false);
  const [disableMode, setDisableMode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      } else {
        toast.error("Gagal memuat data profil");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleStart2FA = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setSetupMode(true);
      } else {
        toast.error(data.error || "Gagal menginisiasi 2FA");
      }
    } catch {
      toast.error("Gagal melakukan inisiasi 2FA");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify2FA = async (enable: boolean) => {
    if (otpCode.length !== 6) {
      toast.error("Kode OTP harus 6 digit angka");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: otpCode,
          action: enable ? "enable" : "disable"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(enable ? "2FA Berhasil diaktifkan!" : "2FA dinonaktifkan.");
        setSetupMode(false);
        setDisableMode(false);
        setOtpCode("");
        setQrCode("");
        setSecret("");
        fetchProfile();
      } else {
        toast.error(data.error || "Kode OTP salah");
      }
    } catch {
      toast.error("Gagal memverifikasi OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret key disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px" }}>
        <div className="skeleton" style={{ width: "100%", height: "350px", borderRadius: "16px" }} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Page Header */}
      <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "32px" }}>Profil Pengguna</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Profile Card */}
        <div style={{
          background: "white", borderRadius: "20px",
          padding: "32px", boxShadow: "var(--shadow)",
          border: "1px solid var(--color-border)",
          display: "flex", gap: "32px", alignItems: "center",
          flexWrap: "wrap",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "32px", fontWeight: 700,
          }}>
            {profile.name[0].toUpperCase()}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <User size={16} style={{ color: "var(--color-text-muted)" }} />
              <span style={{ fontWeight: 700, fontSize: "18px" }}>{profile.name}</span>
              <span className="badge badge-neutral" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                {profile.role}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--color-text-muted)", fontSize: "14px" }}>
              <Mail size={16} />
              <span>{profile.email}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--color-text-muted)", fontSize: "14px" }}>
              <Calendar size={16} />
              <span>
                Terdaftar: {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Security 2FA Card */}
        <div style={{
          background: "white", borderRadius: "20px",
          padding: "32px", boxShadow: "var(--shadow)",
          border: "1px solid var(--color-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            {profile.twoFactorEnabled ? (
              <div style={{
                width: 40, height: 40, borderRadius: "10px",
                background: "rgba(34,197,94,0.1)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#22c55e"
              }}>
                <ShieldCheck size={22} />
              </div>
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: "10px",
                background: "rgba(239,68,68,0.1)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#ef4444"
              }}>
                <ShieldAlert size={22} />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                Autentikasi Dua Faktor (2FA)
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginTop: "2px" }}>
                Tambahkan lapisan keamanan ekstra dengan OTP 6 digit
              </p>
            </div>
          </div>

          {!setupMode && !disableMode ? (
            <div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-text-muted)", marginBottom: "24px" }}>
                Ketika aktif, Anda akan diminta memasukkan kode verifikasi dari aplikasi Authenticator (seperti Google Authenticator) setiap kali masuk ke akun Anda.
              </p>
              
              {profile.twoFactorEnabled ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#166534" }}>
                    🟢 2FA saat ini AKTIF di akun Anda.
                  </span>
                  <button
                    onClick={() => setDisableMode(true)}
                    className="btn-primary"
                    style={{ background: "#dc2626", borderRadius: "10px", padding: "10px 20px" }}
                  >
                    Nonaktifkan 2FA
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#991b1b" }}>
                    🔴 2FA saat ini NONAKTIF di akun Anda.
                  </span>
                  <button
                    onClick={handleStart2FA}
                    disabled={actionLoading}
                    className="btn-primary btn-accent"
                    style={{ borderRadius: "10px", padding: "10px 20px" }}
                  >
                    {actionLoading ? "Memproses..." : "Aktifkan 2FA"}
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* SETUP 2FA MODE */}
          {setupMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px", alignItems: "center" }}>
                <div style={{
                  background: "white", padding: "8px", borderRadius: "12px",
                  border: "1px solid var(--color-border)", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="2FA QR Code" style={{ width: "100%", height: "auto" }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>Langkah 1: Pindai Kode QR</h3>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "12px" }}>
                    Buka aplikasi Google Authenticator, tap ikon <strong>+</strong>, dan pilih <strong>Scan a QR code</strong>.
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    Atau masukkan kode rahasia secara manual jika tidak dapat memindai:
                  </p>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "var(--color-surface-2)", padding: "6px 12px",
                    borderRadius: "8px", border: "1px solid var(--color-border)",
                    marginTop: "8px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700
                  }}>
                    <span>{secret}</span>
                    <button onClick={copySecret} style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", color: "var(--color-text-muted)"
                    }}>
                      {copied ? <Check size={14} style={{ color: "#22c55e" }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid var(--color-border)" }} />

              <div>
                <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "12px" }}>Langkah 2: Masukkan Kode Konfirmasi</h3>
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                  Masukkan kode OTP 6 digit yang dihasilkan aplikasi Authenticator untuk mengonfirmasi.
                </p>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="input-field"
                    style={{ maxWidth: "160px", letterSpacing: "2px", fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                  />
                  <button
                    onClick={() => handleVerify2FA(true)}
                    disabled={actionLoading}
                    className="btn-primary"
                    style={{ padding: "12px 24px", borderRadius: "10px" }}
                  >
                    {actionLoading ? "Memverifikasi..." : "Verifikasi & Aktifkan"}
                  </button>
                  <button
                    onClick={() => {
                      setSetupMode(false);
                      setOtpCode("");
                    }}
                    style={{
                      background: "none", border: "none", color: "var(--color-text-muted)",
                      cursor: "pointer", fontSize: "14px", fontWeight: 600
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DISABLE 2FA MODE */}
          {disableMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.3s ease" }}>
              <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Konfirmasi Penonaktifan 2FA</h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
                Masukkan kode OTP 6 digit dari aplikasi Authenticator untuk menonaktifkan 2FA di akun Anda.
              </p>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  style={{ maxWidth: "160px", letterSpacing: "2px", fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                />
                <button
                  onClick={() => handleVerify2FA(false)}
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ background: "#dc2626", padding: "12px 24px", borderRadius: "10px" }}
                >
                  {actionLoading ? "Memproses..." : "Nonaktifkan Sekarang"}
                </button>
                <button
                  onClick={() => {
                    setDisableMode(false);
                    setOtpCode("");
                  }}
                  style={{
                    background: "none", border: "none", color: "var(--color-text-muted)",
                    cursor: "pointer", fontSize: "14px", fontWeight: 600
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
