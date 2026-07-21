import AdminSidebar from "@/components/admin/AdminSidebar";
import AuthProvider from "@/components/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="admin-layout-container flex min-h-screen" style={{ background: "var(--color-surface-2)" }}>
        <AdminSidebar />

        <main className="flex-1 p-10" style={{ overflowY: "auto", maxHeight: "100vh" }}>
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
