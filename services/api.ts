import { Product, Customer, Sale, SaleItem } from '../types';

// --- SIMULACIÓN DE BASE DE DATOS (Google Sheets) ---
// En una aplicación real, este módulo usaría la API de Google Sheets para interactuar con el spreadsheet.
// Los datos de ejemplo simulan el contenido de las hojas 'products' y 'customers'.

let mockProducts: Product[] = [
  { id: '1', sku: 'DEC-001', name: 'Lámpara de Escritorio Nórdica', category: 'Iluminación', tags: 'nórdico, minimalista', cost: 1500, price: 3500, stock: 8, reorder_level: 5, location: 'Estante A1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), image_url: 'https://picsum.photos/id/10/400/400' },
  { id: '2', sku: 'DEC-002', name: 'Cojín de Lino', category: 'Textiles', cost: 800, price: 1800, stock: 3, reorder_level: 10, location: 'Caja B2', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), image_url: 'https://picsum.photos/id/20/400/400' },
  { id: '3', sku: 'DEC-003', name: 'Jarrón de Cerámica', category: 'Decoración', cost: 2200, price: 1900, stock: 12, reorder_level: 5, supplier: 'Artesanías Locales', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', sku: 'DEC-004', name: 'Mesa Auxiliar de Roble', category: 'Muebles', cost: 9000, price: 15000, stock: 0, reorder_level: 2, location: 'Depósito', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), image_url: 'https://picsum.photos/id/30/400/400' },
];

let mockCustomers: Customer[] = [
  { id: '1', name: 'Ana Torres', email: 'ana.t@example.com', phone: '1122334455', address: 'Av. Siempre Viva 742', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Carlos Gomez', email: 'c.gomez@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

let mockSales: Sale[] = [];

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
}

// --- API de Productos ---

export const getProducts = async (): Promise<Product[]> => {
    return simulateDelay([...mockProducts]);
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    if (mockProducts.some(p => p.sku.toLowerCase() === productData.sku.toLowerCase())) {
        throw new Error('El SKU ya existe.');
    }
    const newProduct: Product = {
        ...productData,
        id: (mockProducts.length + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return simulateDelay(newProduct);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
        throw new Error('Producto no encontrado.');
    }
    const updatedProduct = {
        ...mockProducts[productIndex],
        ...updates,
        updated_at: new Date().toISOString(),
    };
    mockProducts[productIndex] = updatedProduct;
    return simulateDelay(updatedProduct);
};


export const deleteProduct = async (id: string): Promise<void> => {
    mockProducts = mockProducts.filter(p => p.id !== id);
    return simulateDelay(undefined);
};

// --- API de Clientes ---

export const getCustomers = async (): Promise<Customer[]> => {
    return simulateDelay([...mockCustomers]);
};

export const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const newCustomer: Customer = {
        ...customerData,
        id: (mockCustomers.length + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockCustomers.push(newCustomer);
    return simulateDelay(newCustomer);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    const customerIndex = mockCustomers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
        throw new Error('Cliente no encontrado.');
    }
    const updatedCustomer = {
        ...mockCustomers[customerIndex],
        ...updates,
        updated_at: new Date().toISOString(),
    };
    mockCustomers[customerIndex] = updatedCustomer;
    return simulateDelay(updatedCustomer);
};


export const deleteCustomer = async (id: string): Promise<void> => {
    mockCustomers = mockCustomers.filter(c => c.id !== id);
    return simulateDelay(undefined);
};

// --- API de Ventas ---

export const getSales = async (): Promise<Sale[]> => {
    return simulateDelay([...mockSales]);
};

export const createSale = async (saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<Sale> => {
    // 1. Descontar stock de productos
    for (const item of saleData.items) {
        const productIndex = mockProducts.findIndex(p => p.sku === item.sku);
        if (productIndex !== -1) {
            const currentStock = mockProducts[productIndex].stock;
            if (currentStock < item.quantity) {
                throw new Error(`Stock insuficiente para ${mockProducts[productIndex].name}.`);
            }
            mockProducts[productIndex].stock -= item.quantity;
        } else {
            throw new Error(`Producto con SKU ${item.sku} no encontrado.`);
        }
    }

    // 2. Crear y guardar la nueva venta
    const newSale: Sale = {
        ...saleData,
        id: `sale_${mockSales.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    mockSales.push(newSale);
    return simulateDelay(newSale);
};
