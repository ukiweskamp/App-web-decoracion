import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProductFormProps {
  product: Product | null;
  onSave: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> | Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: '', name: '', category: '', cost: 0, price: 0, stock: 0, 
    reorder_level: parseInt(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD || '5'),
    tags: '', description: '', image_url: '', supplier: '', location: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        cost: product.cost || 0,
        price: product.price || 0,
        stock: product.stock || 0,
        reorder_level: product.reorder_level || 5,
        tags: product.tags || '',
        description: product.description || '',
        image_url: product.image_url || '',
        supplier: product.supplier || '',
        location: product.location || '',
      });
    } else {
       setFormData({
            sku: '', name: '', category: '', cost: 0, price: 0, stock: 0, 
            reorder_level: parseInt(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD || '5'),
            tags: '', description: '', image_url: '', supplier: '', location: ''
        });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku || !formData.name) {
      alert('SKU y Nombre son obligatorios.');
      return;
    }
    
    const isNegativeMargin = formData.price < formData.cost;
    if (isNegativeMargin) {
        if (!window.confirm('El precio de venta es menor que el costo (margen negativo). ¿Deseas continuar?')) {
            return;
        }
    }
    
    if (product) {
        onSave({ ...product, ...formData });
    } else {
        onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="SKU (Código de producto)" name="sku" value={formData.sku} onChange={handleChange} required />
        <Input label="Nombre del Producto" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Categoría" name="category" value={formData.category} onChange={handleChange} />
        <Input label="Etiquetas (separadas por coma)" name="tags" value={formData.tags} onChange={handleChange} />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input label="Costo" name="cost" type="number" value={formData.cost} onChange={handleChange} required step="0.01"/>
        <Input label="Precio de Venta" name="price" type="number" value={formData.price} onChange={handleChange} required step="0.01"/>
        <Input label="Stock Actual" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
        <Input label="Punto de Pedido" name="reorder_level" type="number" value={formData.reorder_level} onChange={handleChange} />
      </div>
       <Input label="URL de la Imagen" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Pegar enlace de Google Drive aquí"/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Proveedor (opcional)" name="supplier" value={formData.supplier} onChange={handleChange} />
        <Input label="Ubicación Interna" name="location" value={formData.location} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Producto</Button>
      </div>
    </form>
  );
};

export default ProductForm;
