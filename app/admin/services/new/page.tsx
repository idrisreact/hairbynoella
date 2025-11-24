"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const serviceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function NewServicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Service</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Service Name</label>
          <input
            {...register("name")}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. Luxury Cut & Finish"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            {...register("category")}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="">Select a category...</option>
            <option value="Hair Styling">Hair Styling</option>
            <option value="Hair Colouring">Hair Colouring</option>
            <option value="Hair Treatments">Hair Treatments</option>
          </select>
          {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Price Display</label>
          <input
            {...register("price")}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. From £50"
          />
          {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            {...register("description")}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-4">
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                className="bg-gold-500 hover:bg-gold-600 text-white"
                disabled={isLoading}
            >
                {isLoading ? "Creating..." : "Create Service"}
            </Button>
        </div>
      </form>
    </div>
  );
}
