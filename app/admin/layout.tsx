import { Toaster } from "sonner";
import { requireAdminPage } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();

  return (
    <AdminShell userName={session.user.name || "Admin"}>
      {children}
      <Toaster richColors position="top-right" />
    </AdminShell>
  );
}
