import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CustomerFormProps {
  customer: Customer | null;
  onSave: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'> | Customer) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    } else {
        setFormData({ name: '', email: '', phone: '', address: '', notes: '' });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('El nombre es obligatorio.');
      return;
    }
    onSave(customer ? { ...customer, ...formData } : formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 sm:p-4">
      <Input label="Nombre Completo" name="name" value={formData.name} onChange={handleChange} required />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
        <Input label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <Input label="Dirección" name="address" value={formData.address} onChange={handleChange} />
       <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Cliente</Button>
      </div>
    </form>
  );
};

export default CustomerForm;
