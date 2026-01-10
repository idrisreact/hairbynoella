import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

// Types
export interface Service {
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

interface AvailableDatesResponse {
  dates: string[];
}

interface BookingData {
  serviceId: string;
  date: Date | string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

// API functions
const fetchServices = async (): Promise<Service[]> => {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
};

const fetchSlots = async (date: string): Promise<Slot[]> => {
  const res = await fetch(`/api/availability?date=${date}`);
  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
};

const fetchAvailableDates = async (
  startDate: string,
  endDate: string
): Promise<AvailableDatesResponse> => {
  const res = await fetch(
    `/api/availability/dates?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch available dates");
  return res.json();
};

const createBooking = async (data: BookingData) => {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create booking");
  }

  return res.json();
};

// Hooks
export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });
};

export const useSlots = (date: Date | null) => {
  return useQuery({
    queryKey: ["slots", date ? format(date, "yyyy-MM-dd") : null],
    queryFn: () => fetchSlots(format(date!, "yyyy-MM-dd")),
    enabled: !!date, // Only fetch when date is selected
  });
};

export const useAvailableDates = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["availableDates", startDate, endDate],
    queryFn: () => fetchAvailableDates(startDate, endDate),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (data, variables) => {
      // Invalidate slots query for the booked date
      const dateStr =
        typeof variables.date === "string"
          ? variables.date
          : format(variables.date, "yyyy-MM-dd");
      queryClient.invalidateQueries({ queryKey: ["slots", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["availableDates"] });
    },
  });
};
