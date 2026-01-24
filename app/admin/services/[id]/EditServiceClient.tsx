"use client";

import ServiceForm from "@/components/admin/ServiceForm";
import { useRouter } from "next/navigation";

interface EditServiceClientProps {
  service: any;
}

export default function EditServiceClient({ service }: EditServiceClientProps) {
  const router = useRouter();

  const handleUpdate = async (data: any) => {
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: service.id }),
      });

      if (!res.ok) throw new Error("Failed to update service");

      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update service");
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Service</h2>
      <ServiceForm initialData={service} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
