"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Calendar as CalendarIcon, Ban, Check, Clock, Loader2 } from "lucide-react";

interface Slot {
  id: string;
  startTime: string;
  isBooked: boolean;
  blockedByAdmin: boolean;
}

export default function AdminAvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // Single slot form
  const [selectedTime, setSelectedTime] = useState("10:00");

  // Bulk creation form
  const [bulkForm, setBulkForm] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: addDays(new Date(), 7).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    interval: 60,
    daysOfWeek: [1, 2, 3, 4, 5] as number[],
  });

  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/availability?date=${selectedDate}&admin=true`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.sort((a: Slot, b: Slot) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ));
      } else {
        setError("Failed to fetch slots");
      }
    } catch (err) {
      setError("Network error while fetching slots");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

  const addSingleSlot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: dateTime.toISOString() }),
      });

      if (res.ok) {
        await fetchSlots();
        setSelectedTime("10:00");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add slot");
      }
    } catch (err) {
      setError("Network error while creating slot");
    } finally {
      setIsLoading(false);
    }
  };

  const createBulkSlots = async () => {
    setBulkLoading(true);
    setError(null);
    setBulkSuccess(null);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true, ...bulkForm }),
      });

      if (res.ok) {
        const data = await res.json();
        setBulkSuccess(`Successfully created ${data.count} slots`);
        await fetchSlots();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create bulk slots");
      }
    } catch (err) {
      setError("Network error while creating bulk slots");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleBlockStatus = async (id: string, currentBlockStatus: boolean) => {
    setError(null);
    try {
      const res = await fetch("/api/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, blockedByAdmin: !currentBlockStatus }),
      });

      if (res.ok) {
        await fetchSlots();
      } else {
        setError("Failed to toggle block status");
      }
    } catch (err) {
      setError("Network error while updating slot");
    }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/availability?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSlots(slots.filter((s) => s.id !== id));
      } else {
        setError("Failed to delete slot");
      }
    } catch (err) {
      setError("Network error while deleting slot");
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setBulkForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  const daysOfWeek = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ];

  const getSlotStatusColor = (slot: Slot) => {
    if (slot.isBooked) return "bg-blue-50 border-blue-200";
    if (slot.blockedByAdmin) return "bg-red-50 border-red-200";
    return "bg-green-50 border-green-200";
  };

  const getSlotStatusIcon = (slot: Slot) => {
    if (slot.isBooked) return <Check className="w-4 h-4 text-blue-600" />;
    if (slot.blockedByAdmin) return <Ban className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-green-600" />;
  };

  const getSlotStatusText = (slot: Slot) => {
    if (slot.isBooked) return <span className="text-xs text-blue-600 font-medium">Booked</span>;
    if (slot.blockedByAdmin) return <span className="text-xs text-red-600 font-medium">Blocked</span>;
    return <span className="text-xs text-green-600 font-medium">Available</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
        <p className="text-gray-500 mt-1">Create time slots, block times, and manage your calendar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Forms */}
        <div className="lg:col-span-1 space-y-5">
          {/* Tab Selector */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "single"
                  ? "bg-gold-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Single Slot
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "bulk"
                  ? "bg-gold-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Bulk Create
            </button>
          </div>

          {/* Single Slot Form */}
          {activeTab === "single" && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold-500" />
                Add Single Slot
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                  />
                </div>
                <Button
                  onClick={addSingleSlot}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Creation Form */}
          {activeTab === "bulk" && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gold-500" />
                Bulk Create Slots
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={bulkForm.startDate}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={bulkForm.endDate}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={bulkForm.startTime}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={bulkForm.endTime}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Interval (minutes)
                  </label>
                  <select
                    value={bulkForm.interval}
                    onChange={(e) => setBulkForm(prev => ({ ...prev, interval: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Days of Week</label>
                  <div className="flex flex-wrap gap-1.5">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDayOfWeek(day.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          bulkForm.daysOfWeek.includes(day.value)
                            ? "bg-gold-500 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {bulkSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                    {bulkSuccess}
                  </div>
                )}

                <Button
                  onClick={createBulkSlots}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white rounded-lg"
                  disabled={bulkLoading || bulkForm.daysOfWeek.length === 0}
                >
                  {bulkLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Create Bulk Slots
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status Legend</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-green-50 border border-green-200 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-red-50 border border-red-200 flex items-center justify-center">
                  <Ban className="w-3 h-3 text-red-600" />
                </div>
                <span className="text-sm text-gray-700">Blocked</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Check className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slots List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {format(new Date(selectedDate), "EEEE, MMM d, yyyy")}
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                {slots.length} slots
              </span>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No slots for this date</p>
                <p className="text-gray-400 text-xs mt-1">Create slots using the forms on the left</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between px-4 py-3 border rounded-xl transition-all ${getSlotStatusColor(slot)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getSlotStatusIcon(slot)}
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(slot.startTime), "h:mm a")}
                        </span>
                        <div>{getSlotStatusText(slot)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!slot.isBooked && (
                        <button
                          onClick={() => toggleBlockStatus(slot.id, slot.blockedByAdmin)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            slot.blockedByAdmin
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          title={slot.blockedByAdmin ? "Unblock slot" : "Block slot"}
                        >
                          {slot.blockedByAdmin ? "Unblock" : "Block"}
                        </button>
                      )}
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete slot"
                        disabled={slot.isBooked}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
