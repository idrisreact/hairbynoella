import { Product } from "@/src/types/products.types";
import Image from "next/image";
import { ChangeEvent } from "react";
import { ProductSearch } from "./product-search";

async function fetchData(): Promise<Product[]> {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function ProductGrid() {
  const products = await fetchData();

  return (
    <div className="w-[80%] mx-auto mt-24">
      <ProductSearch productsData={products} />
    </div>
  );
}
