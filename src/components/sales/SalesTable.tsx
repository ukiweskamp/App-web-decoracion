import React from 'react';
import { Sale } from '@/types';

const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

interface SalesTableProps {
  sales: Sale[];
}

const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full min-w-max text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">ID Venta</th>
            <th scope="col" className="px-6 py-3">Fecha</th>
            <th scope="col" className="px-6 py-3">Cliente</th>
            <th scope="col" className="px-6 py-3">Items</th>
            <th scope="col" className="px-6 py-3 text-right">Monto Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                No se han registrado ventas.
              </td>
            </tr>
          ) : (
            sales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()).map((sale) => (
              <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-600">{sale.id}</td>
                <td className="px-6 py-4">{new Date(sale.sale_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{sale.customer_name}</td>
                <td className="px-6 py-4">
                    <ul className="text-xs">
                        {sale.items.map(item => (
                            <li key={item.sku}>{item.quantity} x {item.name}</li>
                        ))}
                    </ul>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-800">
                  {CURRENCY_SYMBOL}
                  {sale.total_amount.toLocaleString('es-AR')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;