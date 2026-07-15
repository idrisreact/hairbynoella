"use client";

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import ActionButton, { type ActionResult } from "@/components/admin/ActionButton";

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string | null;
  duration: number | null;
}

interface ServicesTableProps {
  services: Service[];
  categories: string[];
  deleteAction: (id: string) => Promise<ActionResult>;
}

export default function ServicesTable({ services, categories, deleteAction }: ServicesTableProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredServices = activeCategory === "All"
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div role="group" aria-label="Filter services by category" className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("All")}
          aria-pressed={activeCategory === "All"}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400
            ${activeCategory === "All"
              ? "bg-gold-500 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          All
          <span className="ml-1.5 text-xs opacity-75">({services.length})</span>
        </button>
        {categories.map((cat) => {
          const count = services.filter(s => s.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400
                ${activeCategory === cat
                  ? "bg-gold-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <caption className="sr-only">
              Services with category, price, duration and actions
            </caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service, index) => (
                <tr
                  key={service.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{service.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{service.price}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-600">
                      {service.duration ? `${service.duration} min` : "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gold-600 hover:bg-gold-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                        aria-label={`Edit ${service.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <ActionButton
                        action={() => deleteAction(service.id)}
                        confirm={{
                          title: "Delete service?",
                          description: `This permanently removes "${service.name}". This cannot be undone.`,
                          actionLabel: "Delete",
                        }}
                        aria-label={`Delete ${service.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Delete
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                    No services in this category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
