'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface Product {
  id: number;
  name: string;
  price: number;
}

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (e) {
      setError('Failed to fetch products: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedProduct = await response.json();
      setProducts([...products, addedProduct]);
    } catch (e) {
      setError('Failed to add product: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { products, error, loading, fetchProducts, addProduct };
};

export default function ApiTest() {
  const { products, error, loading, fetchProducts, addProduct } = useProducts();

  const handleAddProduct = () => {
    const newProduct = {
      name: 'Test Product',
      price: 99.99,
    };
    addProduct(newProduct);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <Button onClick={fetchProducts} className="mb-4">Fetch Products</Button>
      <Button onClick={handleAddProduct} className="mb-4 ml-2">Add Test Product</Button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(products, null, 2)}
      </pre>
    </div>
  )
}

