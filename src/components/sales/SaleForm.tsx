import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Customer, Sale, SaleItem } from '@/types';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

interface SaleFormProps {
  products: Product[];
  customers: Customer[];
  onSave: (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ products, customers, onSave, onCancel }) => {
  const [customerId, setCustomerId] = useState<string>('');
  const [customerInput, setCustomerInput] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [editingPriceSku, setEditingPriceSku] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [productToAdd, setProductToAdd] = useState<string>('');
  const [productInput, setProductInput] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [error, setError] = useState('');
  const customerInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const availableProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 && !items.some(item => item.sku === p.sku));
  }, [products, items]);

  // Filtrado nativo para clientes y productos
  const filteredCustomers = useMemo(() => {
    if (!customerInput.trim()) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(customerInput.toLowerCase()));
  }, [customers, customerInput]);

  const filteredProducts = useMemo(() => {
    if (!productInput.trim()) return availableProducts;
    return availableProducts.filter(p => p.name.toLowerCase().includes(productInput.toLowerCase()));
  }, [availableProducts, productInput]);

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
        return;
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
  <form onSubmit={handleSubmit} className="space-y-6 p-2 sm:p-4">
      <div className="relative">
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <input
          id="customer"
          ref={customerInputRef}
          type="text"
          autoComplete="off"
          placeholder="Buscar cliente..."
          value={customerInput || (customerId ? customers.find(c => c.id === customerId)?.name : '')}
          onChange={e => {
            setCustomerInput(e.target.value);
            setShowCustomerDropdown(true);
            setCustomerId('');
          }}
          onFocus={() => setShowCustomerDropdown(true)}
          onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 100)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {showCustomerDropdown && filteredCustomers.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow max-h-48 overflow-auto mt-1">
            {filteredCustomers.map(c => (
              <li
                key={c.id}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                onMouseDown={() => {
                  setCustomerId(c.id);
                  setCustomerInput(c.name);
                  setShowCustomerDropdown(false);
                }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Añadir Producto</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={productInputRef}
            type="text"
            autoComplete="off"
            placeholder="Buscar producto..."
            value={productInput || (productToAdd ? availableProducts.find(p => p.sku === productToAdd)?.name : '')}
            onChange={e => {
              setProductInput(e.target.value);
              setShowProductDropdown(true);
              setProductToAdd('');
            }}
            onFocus={() => setShowProductDropdown(true)}
            onBlur={() => setTimeout(() => setShowProductDropdown(false), 100)}
            className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="button" variant="secondary" onClick={handleAddItem} disabled={!productToAdd}>Añadir</Button>
        </div>
        {showProductDropdown && filteredProducts.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow max-h-48 overflow-auto mt-1">
            {filteredProducts.map(p => (
              <li
                key={p.sku}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                onMouseDown={() => {
                  setProductToAdd(p.sku);
                  setProductInput(p.name);
                  setShowProductDropdown(false);
                }}
              >
                {p.name} (Stock: {p.stock})
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {items.length > 0 && (
    <div className="space-y-2 border rounded-md p-3">
      {items.map(item => (
        <div key={item.sku} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex-grow">{item.name}</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              type="number"
              className="w-20 text-center"
              value={item.quantity}
              onChange={e => handleQuantityChange(item.sku, parseInt(e.target.value) || 1)}
              min={1}
              max={products.find(p => p.sku === item.sku)?.stock || 1}
            />
            {editingPriceSku === item.sku ? (
              <input
                type="number"
                className="w-24 px-2 py-1 border rounded text-right"
                value={tempPrice}
                min={0}
                onChange={e => setTempPrice(e.target.value)}
                onBlur={() => {
                  const price = parseFloat(tempPrice);
                  if (!isNaN(price) && price >= 0) {
                    setItems(prev => prev.map(it => it.sku === item.sku ? { ...it, price_at_sale: price } : it));
                  }
                  setEditingPriceSku(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const price = parseFloat(tempPrice);
                    if (!isNaN(price) && price >= 0) {
                      setItems(prev => prev.map(it => it.sku === item.sku ? { ...it, price_at_sale: price } : it));
                    }
                    setEditingPriceSku(null);
                  } else if (e.key === 'Escape') {
                    setEditingPriceSku(null);
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="flex items-center gap-1">
                {CURRENCY_SYMBOL}{item.price_at_sale.toLocaleString('es-AR')}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-blue-600"
                  title="Editar precio"
                  onClick={() => {
                    setEditingPriceSku(item.sku);
                    setTempPrice(item.price_at_sale.toString());
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414 1.414l-4.242 1.414 1.414-4.242a4 4 0 011.414-1.414z" />
                  </svg>
                </button>
              </span>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center font-semibold rounded-md bg-transparent text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-400 px-3 py-1.5 text-xs"
              onClick={() => handleRemoveItem(item.sku)}
              aria-label="Eliminar producto"
            >
              X
            </button>
          </div>
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

  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Venta</Button>
      </div>
    </form>
  );
};

export default SaleForm;