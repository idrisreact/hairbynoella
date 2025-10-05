// useProducts.ts
import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useProducts = (url: string): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setProducts(data.products || data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const refetch = () => {
    fetchProducts();
  };

  useEffect(() => {
    if (url) {
      fetchProducts();
    }
  }, [url, fetchProducts]);

  return { products, loading, error, refetch };
};

export default useProducts;