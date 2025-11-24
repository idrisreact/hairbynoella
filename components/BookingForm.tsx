"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Service {
  id: string;
  name: string;
  price: string;
  category: string;
}

export default function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get("serviceId");
  
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: preSelectedServiceId || "",
    },
  });

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        setServices(data);
        
        if (preSelectedServiceId) {
            // Verify if the pre-selected service exists in the fetched list (optional but good for UX)
            const exists = data.find((s: Service) => s.id === preSelectedServiceId);
            if (exists) {
                setValue("serviceId", preSelectedServiceId);
            }
        }
      } catch (err) {
        console.error(err);
        setError("Could not load services. Please try again later.");
      }
    }
    fetchServices();
  }, [preSelectedServiceId, setValue]);

  const onSubmit = async (data: BookingFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Combine date and time into a single ISO string
      const dateTime = new Date(`${data.date}T${data.time}`);
      
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          date: dateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      router.push("/book/success");
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Group services by category for the dropdown
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-gold-400/20">
      <h2 className="text-3xl font-serif font-bold text-dark-400 mb-6 text-center">Book Your Appointment</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Select Service</label>
          <select
            {...register("serviceId")}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
          >
            <option value="">-- Choose a Service --</option>
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <optgroup key={category} label={category}>
                {categoryServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.serviceId && (
            <p className="text-red-500 text-xs">{errors.serviceId.message}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-500">Date</label>
            <input
              type="date"
              {...register("date")}
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-red-500 text-xs">{errors.date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-500">Time</label>
            <input
              type="time"
              {...register("time")}
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            {errors.time && (
              <p className="text-red-500 text-xs">{errors.time.message}</p>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-dark-400 border-b border-dark-100 pb-2">Your Details</h3>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-dark-500">Full Name</label>
                <input
                type="text"
                {...register("customerName")}
                className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                placeholder="Jane Doe"
                />
                {errors.customerName && (
                <p className="text-red-500 text-xs">{errors.customerName.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-500">Email</label>
                    <input
                    type="email"
                    {...register("customerEmail")}
                    className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                    placeholder="jane@example.com"
                    />
                    {errors.customerEmail && (
                    <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-500">Phone (Optional)</label>
                    <input
                    type="tel"
                    {...register("customerPhone")}
                    className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                    placeholder="+44 7123 456789"
                    />
                </div>
            </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-500">Special Requests / Notes</label>
          <textarea
            {...register("notes")}
            className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 min-h-[100px]"
            placeholder="Any allergies or specific requirements?"
          />
        </div>

        <Button 
            type="submit" 
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 text-lg"
            disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </form>
    </div>
  );
}
