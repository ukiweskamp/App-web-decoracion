import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU es obligatorio.'),
  name: z.string().min(1, 'Nombre es obligatorio.'),
  category: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  supplier: z.string().optional(),
  cost: z.number().min(0),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  reorder_level: z.number().int().min(0),
  location: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Nombre es obligatorio.'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const saleItemSchema = z.object({
    sku: z.string(),
    name: z.string(),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1.'),
    price_at_sale: z.number().min(0),
});

export const saleSchema = z.object({
    sale_date: z.string().min(1, 'La fecha es obligatoria.'),
    customer_id: z.string().optional(),
    customer_name: z.string().min(1, 'El nombre del cliente es obligatorio.'),
    items: z.array(saleItemSchema).min(1, 'La venta debe tener al menos un producto.'),
    total_amount: z.number().min(0),
    notes: z.string().optional(),
});