import React, { useState, useEffect } from "react";

export const ProductList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <span>Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <h2>Unable to load products</h2>
        <p>{error}</p>
        <button onClick={handleRetry} aria-label="Retry loading products">
          Try Again
        </button>
      </div>
    );
  }
  return (
    <div className="product-grid">
      <h1>Products ({products.length})</h1>
      <ul className="product-list" aria-label="Available products" role="list">
        {products.map((product) => (
          <li key={product.id} className="product-card" role="listitem">
            <img src={product.image} alt={product.name} loading="lazy" />
            <h2>{product.name}</h2>
            <p className="price">
              <span className="sr-only">Price:</span>${product.price}
            </p>
            <p className="stock" aria-live="polite">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
