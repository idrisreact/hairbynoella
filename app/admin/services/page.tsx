import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import ServicesTable from "@/components/admin/ServicesTable";
import type { ActionResult } from "@/components/admin/ActionButton";

async function deleteService(id: string): Promise<ActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    await db.delete(services).where(eq(services.id, id));
    revalidatePath("/admin/services");
    revalidatePath("/services");
    return { success: true, message: "Service deleted" };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, message: "Failed to delete service" };
  }
}

export default async function AdminServicesPage() {
  const allServices = await db.select().from(services).orderBy(desc(services.createdAt));

  // Get unique categories
  const categories = [...new Set(allServices.map(s => s.category))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {allServices.length} total
          </span>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Link>
      </div>

      <ServicesTable
        services={allServices.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: s.price,
          description: s.description,
          duration: s.duration,
        }))}
        categories={categories}
        deleteAction={deleteService}
      />
    </div>
  );
}
