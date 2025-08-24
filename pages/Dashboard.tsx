import React, { useState, useEffect, useMemo } from 'react';
import { Product, Customer, Sale } from '../types';
import { getProducts, getCustomers, getSales } from '../services/api';
import Card from '../components/ui/Card';
import { CURRENCY_SYMBOL } from '../constants';

type FilterPeriod = 'all_time' | 'today' | 'last_7_days' | 'this_month' | 'last_month' | 'this_year';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all_time');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, customersData, salesData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getSales()
        ]);
        setProducts(productsData);
        setCustomers(customersData);
        setSales(salesData);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSales = useMemo(() => {
    if (filterPeriod === 'all_time') {
      return sales;
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      saleDate.setHours(0, 0, 0, 0); // Normalizar a medianoche

      switch (filterPeriod) {
        case 'today':
          return saleDate.getTime() === today.getTime();
        
        case 'last_7_days': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6); // Incluye hoy
          return saleDate >= sevenDaysAgo;
        }

        case 'this_month':
          return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();

        case 'last_month': {
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
        }
          
        case 'this_year':
          return saleDate.getFullYear() === today.getFullYear();
          
        default:
          return true;
      }
    });
  }, [sales, filterPeriod]);


  const stats = useMemo(() => {
    const productCostMap = new Map(products.map(p => [p.sku, p.cost]));

    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total_amount, 0);
    const totalCostOfGoods = filteredSales.reduce((acc, sale) => {
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
      totalSales: filteredSales.length,
      totalRevenue,
      grossProfit,
      totalStockValue,
      lowStockItems,
      outOfStockItems
    };
  }, [products, customers, filteredSales]);

  if (isLoading) {
    return <div className="text-center p-8">Cargando dashboard...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
            <label htmlFor="filterPeriod" className="text-sm font-medium">Filtrar:</label>
            <select
                id="filterPeriod"
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