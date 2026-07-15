"use client";

import ServiceForm, {
  type ServiceFormOutput,
  type ServiceInitialData,
} from "@/components/admin/ServiceForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditServiceClientProps {
  service: ServiceInitialData & { id: string };
}

export default function EditServiceClient({ service }: EditServiceClientProps) {
  const router = useRouter();

  const handleUpdate = async (data: ServiceFormOutput) => {
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: service.id }),
      });

      if (!res.ok) throw new Error("Failed to update service");

      toast.success("Service updated");
      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update service");
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Service</h1>
      <ServiceForm initialData={service} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
