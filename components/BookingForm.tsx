"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  date: z.date({ required_error: "Please select a date" }),
  slotId: z.string().min(1, "Please select a time slot"),
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: number;
}

interface Slot {
    id: string;
    startTime: string;
}

export default function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get("serviceId");

  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const selectedDate = watch("date");
  const selectedSlotId = watch("slotId");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch available dates for the current month (and next month for better UX)
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(addMonths(currentMonth, 1)); // Fetch 2 months of data

        const startStr = format(start, "yyyy-MM-dd");
        const endStr = format(end, "yyyy-MM-dd");

        const res = await fetch(`/api/availability/dates?startDate=${startStr}&endDate=${endStr}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableDates(new Set(data.dates));
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
      }
    };
    fetchAvailableDates();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlots([]);
            setValue("slotId", ""); // Reset slot selection
            try {
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const res = await fetch(`/api/availability?date=${dateStr}`);
                if (res.ok) {
                    const data = await res.json();
                    setSlots(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }
  }, [selectedDate, setValue]);

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      router.push("/book/success");
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-xl border border-gold-100">
      
      {/* Service Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Service</label>
        {loadingServices ? (
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md"></div>
        ) : (
            <select
            {...register("serviceId")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-white"
            >
            <option value="">-- Choose a Service --</option>
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <optgroup key={category} label={category}>
                {categoryServices.map((service) => (
                    <option key={service.id} value={service.id}>
                    {service.name} ({service.price})
                    </option>
                ))}
                </optgroup>
            ))}
            </select>
        )}
        {errors.serviceId && <p className="text-red-500 text-xs">{errors.serviceId.message}</p>}
      </div>

      {/* Date Selection */}
      <div className="space-y-2 flex flex-col">
        <label className="text-sm font-medium text-gray-700">Select Date</label>
        <p className="text-xs text-gray-500">Dates with available slots are highlighted in gold</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal py-6 border-gray-300",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setValue("date", date as Date)}
              onMonthChange={(month) => setCurrentMonth(month)}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return true;

                // Disable dates without availability
                const dateStr = format(date, "yyyy-MM-dd");
                return !availableDates.has(dateStr);
              }}
              modifiers={{
                available: (date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return availableDates.has(dateStr);
                }
              }}
              modifiersClassNames={{
                available: "bg-gold-100 font-semibold text-gold-900 hover:bg-gold-200"
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
      </div>

      {/* Slot Selection */}
      {selectedDate && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Time</label>
            {loadingSlots ? (
                <div className="flex gap-2">
                    <div className="h-10 w-20 bg-gray-100 animate-pulse rounded-md"></div>
                    <div className="h-10 w-20 bg-gray-100 animate-pulse rounded-md"></div>
                </div>
            ) : slots.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No available slots for this date.</p>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {slots.map((slot) => (
                        <button
                            key={slot.id}
                            type="button"
                            onClick={() => setValue("slotId", slot.id)}
                            className={cn(
                                "py-2 px-4 rounded-md border text-sm font-medium transition-all",
                                selectedSlotId === slot.id 
                                    ? "bg-gold-500 text-white border-gold-500" 
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gold-300 hover:bg-gold-50"
                            )}
                        >
                            {format(new Date(slot.startTime), "h:mm a")}
                        </button>
                    ))}
                </div>
            )}
            <input type="hidden" {...register("slotId")} />
            {errors.slotId && <p className="text-red-500 text-xs">{errors.slotId.message}</p>}
          </div>
      )}

      {/* Personal Details */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-serif text-lg text-gray-800">Your Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                {...register("customerName")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                placeholder="Jane Doe"
                />
                {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                {...register("customerPhone")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                placeholder="+44 7123 456789"
                />
                {errors.customerPhone && <p className="text-red-500 text-xs">{errors.customerPhone.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
            {...register("customerEmail")}
            type="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            placeholder="jane@example.com"
            />
            {errors.customerEmail && <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
            {...register("notes")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            rows={3}
            placeholder="Any specific requests or allergies?"
            />
        </div>
      </div>

      {submitError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {submitError}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming Booking...
            </>
        ) : (
            "Confirm Booking"
        )}
      </Button>
    </form>
  );
}
