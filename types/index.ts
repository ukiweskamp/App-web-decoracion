export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  tags?: string;
  description?: string;
  image_url?: string;
  supplier?: string;
  cost: number;
  price: number;
  stock: number;
  reorder_level: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  sku: string;
  name: string;
  quantity: number;
  price_at_sale: number;
}

export interface Sale {
  id: string;
  sale_date: string;
  customer_id?: string;
  customer_name: string;
  items: SaleItem[];
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
