"use client";

import ServiceForm from "@/components/admin/ServiceForm";
import { useRouter } from "next/navigation";

export default function NewServicePage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create service");

      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create service");
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Service</h2>
      <ServiceForm onSubmit={handleCreate} submitLabel="Create Service" />
    </div>
  );
}
