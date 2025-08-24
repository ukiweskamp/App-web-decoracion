
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer } from '../types';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import CustomerForm from '../components/customers/CustomerForm';
import { exportToCsv } from '../utils/csv';

const CustomerTable: React.FC<{customers: Customer[]; onEdit: (c: Customer) => void; onDelete: (id: string) => void}> = ({ customers, onEdit, onDelete }) => {
    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-max text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nombre</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Teléfono</th>
                        <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">No se encontraron clientes.</td></tr>
                    ) : (
                        customers.map((customer) => (
                            <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                <td className="px-6 py-4">{customer.email || '-'}</td>
                                <td className="px-6 py-4">{customer.phone || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => onEdit(customer)}>Editar</Button>
                                        <Button size="sm" variant="danger" onClick={() => onDelete(customer.id)}>Borrar</Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'> | Customer) => {
    try {
      if ('id' in data) {
        await updateCustomer(data.id, data);
      } else {
        await createCustomer(data);
      }
      fetchCustomers();
      handleCloseModal();
    } catch (err) {
      alert(`Error al guardar cliente: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Confirmas la eliminación de este cliente?')) {
      await deleteCustomer(id);
      fetchCustomers();
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <div className="flex items-center gap-4">
            <Button onClick={() => exportToCsv('clientes', filteredCustomers)} variant="secondary">Exportar CSV</Button>
            <Button onClick={() => handleOpenModal()}>Nuevo Cliente</Button>
        </div>
      </div>
      <Input placeholder="Buscar por nombre o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-4"/>
      
      {isLoading ? <p>Cargando...</p> : <CustomerTable customers={filteredCustomers} onEdit={handleOpenModal} onDelete={handleDelete} />}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Customers;