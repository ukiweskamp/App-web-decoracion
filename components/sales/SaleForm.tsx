
import React, { useState, useMemo } from 'react';
import { Product, Customer, Sale, SaleItem } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CURRENCY_SYMBOL } from '../../constants';

interface SaleFormProps {
  products: Product[];
  customers: Customer[];
  onSave: (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ products, customers, onSave, onCancel }) => {
  const [customerId, setCustomerId] = useState<string>('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [productToAdd, setProductToAdd] = useState<string>('');
  const [error, setError] = useState('');

  const availableProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 && !items.some(item => item.sku === p.sku));
  }, [products, items]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price_at_sale * item.quantity, 0);
  }, [items]);

  const handleAddItem = () => {
    const product = products.find(p => p.sku === productToAdd);
    if (product) {
      setItems(prev => [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          quantity: 1,
          price_at_sale: product.price,
        },
      ]);
      setProductToAdd('');
    }
  };

  const handleRemoveItem = (sku: string) => {
    setItems(prev => prev.filter(item => item.sku !== sku));
  };

  const handleQuantityChange = (sku: string, quantity: number) => {
    const product = products.find(p => p.sku === sku);
    if (product && quantity > product.stock) {
        alert(`Stock insuficiente. Solo quedan ${product.stock} unidades de ${product.name}.`);
        quantity = product.stock;
    }

    setItems(prev =>
      prev.map(item =>
        item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!customerId) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    if (items.length === 0) {
      setError('Debes añadir al menos un producto a la venta.');
      return;
    }
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        setError('Cliente no válido.');
        return;
    }

    onSave({
        sale_date: new Date().toISOString(),
        customer_id: customerId,
        customer_name: customer.name,
        items: items,
        total_amount: totalAmount,
        notes: notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <select
          id="customer"
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>Selecciona un cliente...</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Añadir Producto</label>
        <div className="flex gap-2">
            <select
                value={productToAdd}
                onChange={e => setProductToAdd(e.target.value)}
                className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            >
                <option value="" disabled>Selecciona un producto...</option>
                {availableProducts.map(p => <option key={p.sku} value={p.sku}>{p.name} (Stock: {p.stock})</option>)}
            </select>
            <Button type="button" variant="secondary" onClick={handleAddItem} disabled={!productToAdd}>Añadir</Button>
        </div>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-2 border rounded-md p-3">
            {items.map(item => (
                <div key={item.sku} className="flex items-center gap-4">
                    <span className="flex-grow">{item.name}</span>
                     <Input 
                        type="number"
                        className="w-20 text-center"
                        value={item.quantity}
                        onChange={e => handleQuantityChange(item.sku, parseInt(e.target.value) || 1)}
                        min={1}
                        max={products.find(p => p.sku === item.sku)?.stock || 1}
                     />
                     <span>x {CURRENCY_SYMBOL}{item.price_at_sale.toLocaleString('es-AR')}</span>
                     <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(item.sku)}>X</Button>
                </div>
            ))}
        </div>
      )}

       <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
        <textarea name="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm"/>
      </div>
      
       <div className="text-right">
            <p className="text-lg font-bold">Total: {CURRENCY_SYMBOL}{totalAmount.toLocaleString('es-AR')}</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Venta</Button>
      </div>
    </form>
  );
};

export default SaleForm;
