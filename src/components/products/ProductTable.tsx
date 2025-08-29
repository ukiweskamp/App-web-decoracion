import React from 'react';
import { Product } from '@/types';
import Button from '../ui/Button';

const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

interface ProductStatusBadgeProps {
  product: Product;
}
const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ product }) => {
    const margin = product.price - product.cost;
    const isLowStock = product.stock > 0 && product.stock <= product.reorder_level;
    const isOutOfStock = product.stock === 0;

    if (isOutOfStock) {
    return <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">Agotado</span>;
    }
    if (isLowStock) {
    return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Bajo Stock</span>;
    }
    if (margin < 0) {
    return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Margen Negativo</span>;
    }
    // No depender de image_url para el estado
    return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Activo</span>;

};


interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
    
    const calculateMargin = (price: number, cost: number) => {
        if (price === 0) return { amount: 0, percent: 0 };
        const amount = price - cost;
        const percent = (amount / price) * 100;
        return { amount, percent };
    };

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
            {/* Aviso para móviles */}
            <div className="block md:hidden text-xs text-gray-400 px-4 py-2">Desliza la tabla &rarr;</div>
            <table className="w-full min-w-[700px] text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 md:px-6">SKU</th>
                        <th scope="col" className="px-4 py-3 md:px-6">Nombre</th>
                        <th scope="col" className="px-4 py-3 md:px-6 text-right">Stock</th>
                        <th scope="col" className="px-4 py-3 md:px-6 text-right">Costo</th>
                        <th scope="col" className="px-4 py-3 md:px-6 text-right">Precio</th>
                        <th scope="col" className="px-4 py-3 md:px-6 text-right">Margen</th>
                        <th scope="col" className="px-4 py-3 md:px-6">Estado</th>
                        <th scope="col" className="px-4 py-3 md:px-6 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-500">No se encontraron productos.</td>
                        </tr>
                    ) : (
                        products.map((product) => {
                            const margin = calculateMargin(product.price, product.cost);
                            return (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-4 md:px-6 font-mono text-gray-700">{product.sku}</td>
                                    <td className="px-4 py-4 md:px-6 font-medium text-gray-900 flex items-center gap-3">
                                        <img src={product.image_url || `https://via.placeholder.com/40x40/eee/999?text=${product.name.charAt(0)}`} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-4 md:px-6 text-right">{product.stock}</td>
                                    <td className="px-4 py-4 md:px-6 text-right">{CURRENCY_SYMBOL}{product.cost.toLocaleString('es-AR')}</td>
                                    <td className="px-4 py-4 md:px-6 text-right">{CURRENCY_SYMBOL}{product.price.toLocaleString('es-AR')}</td>
                                    <td className={`px-4 py-4 md:px-6 text-right whitespace-nowrap ${margin.amount < 0 ? 'text-red-600' : 'text-green-600'}`}> 
                                        {CURRENCY_SYMBOL}{margin.amount.toLocaleString('es-AR')} ({margin.percent.toFixed(1)}%)
                                    </td>
                                    <td className="px-4 py-4 md:px-6"><ProductStatusBadge product={product} /></td>
                                    <td className="px-4 py-4 md:px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => onEdit(product)}>Editar</Button>
                                            <Button size="sm" variant="danger" onClick={() => onDelete(product.id)}>Borrar</Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
