import { db } from "@/lib/db";
import { bookings, services, availabilitySlots } from "@/lib/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { format, startOfDay, endOfDay, startOfMonth, addDays } from "date-fns";
import { formatPrice } from "@/lib/pricing";
import {
  Calendar,
  Clock,
  DollarSign,
  Scissors,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);

  // Today's bookings count
  const todayBookingsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(and(gte(bookings.date, todayStart), lte(bookings.date, todayEnd)));
  const todayBookings = Number(todayBookingsResult[0]?.count || 0);

  // Pending confirmations
  const pendingResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(eq(bookings.status, "pending"));
  const pendingCount = Number(pendingResult[0]?.count || 0);

  // Monthly revenue
  const monthlyRevenueResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.paymentStatus, "succeeded"),
        gte(bookings.paymentDate, monthStart)
      )
    );
  const monthlyRevenue = Number(monthlyRevenueResult[0]?.total || 0);

  // Total services
  const servicesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(services);
  const totalServices = Number(servicesResult[0]?.count || 0);

  // Today's appointments with details
  const todayAppointments = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      date: bookings.date,
      status: bookings.status,
      serviceName: services.name,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(and(gte(bookings.date, todayStart), lte(bookings.date, todayEnd)))
    .orderBy(bookings.date);

  // Recent bookings (last 5)
  const recentBookings = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      date: bookings.date,
      status: bookings.status,
      serviceName: services.name,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  // Upcoming 7 days availability
  const weekEnd = endOfDay(addDays(now, 6));
  const upcomingSlots = await db
    .select({
      id: availabilitySlots.id,
      startTime: availabilitySlots.startTime,
      isBooked: availabilitySlots.isBooked,
      blockedByAdmin: availabilitySlots.blockedByAdmin,
    })
    .from(availabilitySlots)
    .where(
      and(
        gte(availabilitySlots.startTime, todayStart),
        lte(availabilitySlots.startTime, weekEnd)
      )
    )
    .orderBy(availabilitySlots.startTime);

  // Group slots by day
  const slotsByDay: Record<string, { available: number; booked: number; blocked: number }> = {};
  for (let i = 0; i < 7; i++) {
    const dayKey = format(addDays(now, i), "yyyy-MM-dd");
    slotsByDay[dayKey] = { available: 0, booked: 0, blocked: 0 };
  }
  for (const slot of upcomingSlots) {
    const dayKey = format(slot.startTime, "yyyy-MM-dd");
    if (slotsByDay[dayKey]) {
      if (slot.isBooked) {
        slotsByDay[dayKey].booked++;
      } else if (slot.blockedByAdmin) {
        slotsByDay[dayKey].blocked++;
      } else {
        slotsByDay[dayKey].available++;
      }
    }
  }

  const weekDays = Object.entries(slotsByDay).map(([dateStr, counts]) => ({
    date: new Date(dateStr),
    ...counts,
    total: counts.available + counts.booked + counts.blocked,
  }));

  const kpiCards = [
    {
      label: "Today's Bookings",
      value: todayBookings.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Pending Confirmations",
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Monthly Revenue",
      value: formatPrice(monthlyRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      label: "Total Services",
      value: totalServices.toString(),
      icon: Scissors,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="text-gray-500 mt-1">
          {format(now, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-xl border ${card.border} p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.bg} rounded-lg p-2.5`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/availability"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </Link>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Link>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          View All Bookings
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Week Availability Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Availability This Week</h2>
          <Link href="/admin/availability" className="text-xs text-gold-600 hover:text-gold-700 font-medium">
            Manage slots
          </Link>
        </div>
        <div className="p-5">
          {weekDays.every(d => d.total === 0) ? (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No slots set up for this week</p>
              <Link href="/admin/availability" className="text-xs text-gold-600 hover:text-gold-700 font-medium mt-1 inline-block">
                Add availability slots
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {weekDays.map((day) => {
                const isToday = format(day.date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
                const occupancy = day.total > 0 ? Math.round(((day.booked + day.blocked) / day.total) * 100) : 0;
                return (
                  <div
                    key={day.date.toISOString()}
                    className={`text-center rounded-xl p-2 sm:p-3 border transition-colors ${
                      isToday
                        ? "border-gold-300 bg-gold-50/50"
                        : day.total === 0
                        ? "border-gray-100 bg-gray-50/50"
                        : "border-gray-200"
                    }`}
                  >
                    <p className={`text-xs font-medium ${isToday ? "text-gold-700" : "text-gray-500"}`}>
                      {format(day.date, "EEE")}
                    </p>
                    <p className={`text-sm sm:text-base font-bold mt-0.5 ${isToday ? "text-gold-900" : "text-gray-900"}`}>
                      {format(day.date, "d")}
                    </p>
                    {day.total > 0 ? (
                      <div className="mt-2 space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancy >= 80 ? "bg-red-400" : occupancy >= 50 ? "bg-amber-400" : "bg-green-400"
                            }`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          <span className="text-green-600 font-medium">{day.available}</span>
                          {" "}free
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] sm:text-xs text-gray-400">No slots</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Legend */}
          {weekDays.some(d => d.total > 0) && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-xs text-gray-500">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-gray-500">Filling up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-gray-500">Almost full</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Today&apos;s Appointments</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
              {todayAppointments.length} total
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {todayAppointments.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No appointments today</p>
              </div>
            ) : (
              todayAppointments.slice(0, 5).map((appt) => (
                <div key={appt.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 text-xs font-bold">
                      {appt.customerName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appt.customerName}</p>
                      <p className="text-xs text-gray-500">{appt.serviceName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700 font-medium">
                      {format(appt.date, "h:mm a")}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium
                        ${appt.status === "confirmed" ? "bg-green-50 text-green-700" :
                          appt.status === "cancelled" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-gold-600 hover:text-gold-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No bookings yet</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                      {booking.customerName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-xs text-gray-500">{booking.serviceName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {format(booking.date, "MMM d")}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium
                        ${booking.status === "confirmed" ? "bg-green-50 text-green-700" :
                          booking.status === "cancelled" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
