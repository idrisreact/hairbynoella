"use client";

import { ChangeEvent, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { CustomInput } from "../ui/input";
import { Product } from "@/src/types/products.types";

interface ProductSearchProps {
  productsData: Product[];
}

export const ProductSearch = ({ productsData }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Memoize categories to avoid recalculation
  const categories = useMemo(() => {
    return [...new Set(productsData.map((product) => product.category))];
  }, [productsData]);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [productsData, searchTerm, selectedCategory]);

  const truncateText = (text: string, maxLength: number): string => {
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <CustomInput
            label="Search products"
            onChange={handleSearchChange}
            value={searchTerm}
            placeholder="Search by title or description..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="category-select">
            Category
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border-2 rounded-md p-2 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div aria-live="polite" className="text-sm text-gray-600">
        {filteredProducts.length} product
        {filteredProducts.length !== 1 ? "s" : ""} found
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-col p-6 border-2 rounded-lg hover:shadow-md transition-shadow"
          >
            <Image
              src={product.image}
              width={300}
              height={200}
              alt={`${product.title} product image`}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
            <p className="text-gray-600 text-sm flex-1">
              {truncateText(product.description, 100)}
            </p>
            <p className="text-xl font-bold mt-2">${product.price}</p>
          </article>
        ))}
      </div>
    </div>
  );
};
