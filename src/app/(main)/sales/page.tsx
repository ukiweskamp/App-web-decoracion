'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Sale, Product, Customer } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SalesTable from '@/components/sales/SalesTable';
import SaleForm from '@/components/sales/SaleForm';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [salesRes, productsRes, customersRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/products'),
        fetch('/api/customers'),
      ]);
      const salesData = await salesRes.json();
      const productsData = await productsRes.json();
      const customersData = await customersRes.json();
      setSales(salesData.data || []);
      setProducts(productsData.data || []);
      setCustomers(customersData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar la venta');
      }

      fetchData(); // Recargar todos los datos, incluido el stock de productos
      handleCloseModal();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <Button onClick={handleOpenModal}>Nueva Venta</Button>
      </div>

      {isLoading ? <p>Cargando ventas...</p> : <SalesTable sales={sales} />}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Nueva Venta">
        <SaleForm
          products={products}
          customers={customers}
          onSave={handleSaveSale}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}