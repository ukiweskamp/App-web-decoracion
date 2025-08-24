'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Customer, Sale } from '@/types';
import Card from '@/components/ui/Card';

const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, customersRes, salesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/customers'),
          fetch('/api/sales'),
        ]);
        const productsData = await productsRes.json();
        const customersData = await customersRes.json();
        const salesData = await salesRes.json();

        setProducts(productsData.data || []);
        setCustomers(customersData.data || []);
        setSales(salesData.data || []);

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const productCostMap = new Map(products.map(p => [p.sku, p.cost]));

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total_amount, 0);
    const totalCostOfGoods = sales.reduce((acc, sale) => {
        const saleCost = sale.items.reduce((itemAcc, item) => {
            const cost = productCostMap.get(item.sku) || 0;
            return itemAcc + (cost * item.quantity);
        }, 0);
        return acc + saleCost;
    }, 0);
    
    const grossProfit = totalRevenue - totalCostOfGoods;

    const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reorder_level).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;

    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalSales: sales.length,
      totalRevenue,
      grossProfit,
      totalStockValue,
      lowStockItems,
      outOfStockItems
    };
  }, [products, customers, sales]);

  if (isLoading) {
    return <div className="text-center p-8">Cargando dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Ingresos Totales">
           <p className="text-4xl font-bold text-green-600">{CURRENCY_SYMBOL}{stats.totalRevenue.toLocaleString('es-AR')}</p>
        </Card>
        <Card title="Ganancia Bruta Estimada">
           <p className="text-4xl font-bold text-blue-600">{CURRENCY_SYMBOL}{stats.grossProfit.toLocaleString('es-AR')}</p>
        </Card>
        <Card title="Ventas Realizadas">
            <p className="text-4xl font-bold">{stats.totalSales}</p>
        </Card>
         <Card title="Clientes Registrados">
            <p className="text-4xl font-bold">{stats.totalCustomers}</p>
        </Card>
        <Card title="Valor de Inventario (Costo)">
           <p className="text-4xl font-bold">{CURRENCY_SYMBOL}{stats.totalStockValue.toLocaleString('es-AR')}</p>
        </Card>
         <Card title="Productos Totales">
          <p className="text-4xl font-bold">{stats.totalProducts}</p>
        </Card>
        <Card title="Items con Bajo Stock">
            <p className="text-4xl font-bold text-yellow-600">{stats.lowStockItems}</p>
        </Card>
         <Card title="Items Agotados">
            <p className="text-4xl font-bold text-red-600">{stats.outOfStockItems}</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;