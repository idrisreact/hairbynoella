"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Schema for form validation and transformation
const serviceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  // Allow string (from input) or number (from API), transform to number (or null) for submission
  duration: z.union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    })
    .optional(),
  description: z.string().optional(),
});

// Output type (after transformation)
type ServiceFormOutput = z.infer<typeof serviceSchema>;

// Input type (form state)
type ServiceFormValues = {
  name: string;
  category: string;
  price: string;
  duration?: string | number;
  description?: string;
};

interface ServiceFormProps {
  initialData?: any; 
  onSubmit: (data: ServiceFormOutput) => Promise<void>;
  submitLabel: string;
}

export default function ServiceForm({ initialData, onSubmit, submitLabel }: ServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: ServiceFormValues = initialData ? {
    name: initialData.name,
    category: initialData.category,
    price: initialData.price,
    duration: initialData.duration ?? "",
    description: initialData.description ?? "",
  } : {
    name: "",
    category: "",
    price: "",
    duration: "",
    description: "",
  };

  // useForm<InputType, Context, OutputType>
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormValues, any, ServiceFormOutput>({
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: ServiceFormOutput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
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
          <option value="Extensions">Extensions</option>
          <option value="Consultation">Consultation</option>
        </select>
        {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <label className="text-sm font-medium text-gray-700">Duration (Minutes)</label>
          <input
            {...register("duration")}
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. 60"
          />
          {errors.duration && <p className="text-red-500 text-xs">{errors.duration.message}</p>}
        </div>
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
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
