'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ProductForm from '@/components/products/ProductForm';
import ProductTable from '@/components/products/ProductTable';
import { exportToCsv } from '@/utils/csv';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al obtener los productos');
      const data = await res.json();
      setProducts(data.data);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> | Product) => {
    try {
      const isEditing = 'id' in productData && productData.id;
      const url = isEditing ? `/api/products/${productData.id}` : '/api/products';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar el producto');
      }

      fetchProducts();
      handleCloseModal();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar el producto');
        fetchProducts();
      } catch (err) {
        alert('Error al eliminar el producto.');
      }
    }
  };
  
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter(p => p.stock === 0);
    }
    return filtered;
  }, [products, searchTerm, stockFilter]);

  const handleExport = () => {
    exportToCsv('productos', filteredProducts);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <div className="flex items-center gap-4">
            <Button onClick={handleExport} variant="secondary">Exportar CSV</Button>
            <Button onClick={() => handleOpenModal()}>Nuevo Producto</Button>
        </div>
      </div>

      <div className="mb-4">
        <Input 
          placeholder="Buscar por nombre, SKU o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:w-64"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={stockFilter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setStockFilter('all')}
        >
          Todos
        </Button>
        <Button
          type="button"
          variant={stockFilter === 'in-stock' ? 'primary' : 'secondary'}
          onClick={() => setStockFilter('in-stock')}
        >
          Con stock
        </Button>
        <Button
          type="button"
          variant={stockFilter === 'out-of-stock' ? 'primary' : 'secondary'}
          onClick={() => setStockFilter('out-of-stock')}
        >
          Agotados
        </Button>
      </div>

      {isLoading && <p>Cargando productos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <ProductTable 
            products={filteredProducts} 
            onEdit={handleOpenModal} 
            onDelete={handleDeleteProduct}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};
