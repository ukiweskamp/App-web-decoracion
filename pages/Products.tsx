
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/products/ProductForm';
import ProductTable from '../components/products/ProductTable';
import { exportToCsv } from '../utils/csv';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
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
      if ('id' in productData && productData.id) {
        await updateProduct(productData.id, productData);
      } else {
        await createProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      alert(`Error al guardar el producto: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Error al eliminar el producto.');
      }
    }
  };
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

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
        />
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

export default Products;