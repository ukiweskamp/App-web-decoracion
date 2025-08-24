

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sale, Product, Customer } from '../types';
import { getSales, getProducts, getCustomers, createSale } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SalesTable from '../components/sales/SalesTable';
import SaleForm from '../components/sales/SaleForm';
import Input from '../components/ui/Input';

type FilterPeriod = 'all_time' | 'today' | 'last_7_days' | 'this_month' | 'last_month' | 'this_year';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for filters
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all_time');
  const [filterClient, setFilterClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [salesData, productsData, customersData] = await Promise.all([
        getSales(),
        getProducts(),
        getCustomers(),
      ]);
      setSales(salesData);
      setProducts(productsData);
      setCustomers(customersData);
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
      await createSale(saleData);
      fetchData(); // Recargar todos los datos para reflejar el nuevo stock y la nueva venta
      handleCloseModal();
    } catch (err)      {
      alert(`Error al guardar la venta: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const filteredSales = useMemo(() => {
    let tempSales = sales;

    // 1. Filtrar por periodo de tiempo
    if (filterPeriod !== 'all_time') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      tempSales = tempSales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        saleDate.setHours(0, 0, 0, 0);

        switch (filterPeriod) {
          case 'today': return saleDate.getTime() === today.getTime();
          case 'last_7_days': {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);
            return saleDate >= sevenDaysAgo;
          }
          case 'this_month': return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
          case 'last_month': {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
          }
          case 'this_year': return saleDate.getFullYear() === today.getFullYear();
          default: return true;
        }
      });
    }

    // 2. Filtrar por cliente seleccionado
    if (filterClient) {
      tempSales = tempSales.filter(sale => sale.customer_id === filterClient);
    }
    
    // 3. Filtrar por término de búsqueda
    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        tempSales = tempSales.filter(sale =>
            sale.id.toLowerCase().includes(lowercasedFilter) ||
            sale.customer_name.toLowerCase().includes(lowercasedFilter) ||
            sale.items.some(item => item.name.toLowerCase().includes(lowercasedFilter))
        );
    }

    return tempSales;
  }, [sales, filterPeriod, filterClient, searchTerm]);


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <Button onClick={handleOpenModal}>Nueva Venta</Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              placeholder="Buscar por cliente, ID, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Todos los clientes</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="all_time">Desde siempre</option>
                <option value="today">Hoy</option>
                <option value="last_7_days">Últimos 7 días</option>
                <option value="this_month">Este mes</option>
                <option value="last_month">Mes pasado</option>
                <option value="this_year">Este año</option>
            </select>
        </div>
      </div>

      {isLoading ? <p>Cargando ventas...</p> : <SalesTable sales={filteredSales} />}

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
};

export default Sales;
