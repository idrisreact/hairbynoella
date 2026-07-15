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
export type ServiceFormOutput = z.infer<typeof serviceSchema>;

// Input type (form state)
type ServiceFormValues = {
  name: string;
  category: string;
  price: string;
  duration?: string | number;
  description?: string;
};

export interface ServiceInitialData {
  name: string;
  category: string;
  price: string;
  duration?: number | null;
  description?: string | null;
}

interface ServiceFormProps {
  initialData?: ServiceInitialData;
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
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormValues, unknown, ServiceFormOutput>({
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
        <label htmlFor="service-name" className="text-sm font-medium text-gray-700">
          Service Name
        </label>
        <input
          id="service-name"
          {...register("name")}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "service-name-error" : undefined}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          placeholder="e.g. Luxury Cut & Finish"
        />
        {errors.name && (
          <p id="service-name-error" role="alert" className="text-red-600 text-xs">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="service-category" className="text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="service-category"
          {...register("category")}
          aria-invalid={errors.category ? true : undefined}
          aria-describedby={errors.category ? "service-category-error" : undefined}
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
        >
          <option value="">Select a category...</option>
          <option value="Hair Styling">Hair Styling</option>
          <option value="Hair Colouring">Hair Colouring</option>
          <option value="Hair Treatments">Hair Treatments</option>
          <option value="Extensions">Extensions</option>
          <option value="Consultation">Consultation</option>
        </select>
        {errors.category && (
          <p id="service-category-error" role="alert" className="text-red-600 text-xs">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="service-price" className="text-sm font-medium text-gray-700">
            Price Display
          </label>
          <input
            id="service-price"
            {...register("price")}
            aria-invalid={errors.price ? true : undefined}
            aria-describedby={errors.price ? "service-price-error" : undefined}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            placeholder="e.g. From £50"
          />
          {errors.price && (
            <p id="service-price-error" role="alert" className="text-red-600 text-xs">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="service-duration" className="text-sm font-medium text-gray-700">
            Duration (Minutes)
          </label>
          <input
            id="service-duration"
            {...register("duration")}
            type="number"
            aria-invalid={errors.duration ? true : undefined}
            aria-describedby={errors.duration ? "service-duration-error" : undefined}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            placeholder="e.g. 60"
          />
          {errors.duration && (
            <p id="service-duration-error" role="alert" className="text-red-600 text-xs">
              {errors.duration.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="service-description" className="text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="service-description"
          {...register("description")}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
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
