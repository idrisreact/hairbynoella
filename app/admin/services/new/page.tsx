"use client";

import ServiceForm, { type ServiceFormOutput } from "@/components/admin/ServiceForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewServicePage() {
  const router = useRouter();

  const handleCreate = async (data: ServiceFormOutput) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create service");

      toast.success("Service created");
      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create service");
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Service</h1>
      <ServiceForm onSubmit={handleCreate} submitLabel="Create Service" />
    </div>
  );
}
