// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getProductsFromSheet, addProductToSheet } from '@/lib/googleSheets';
import { productSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// Helpers de normalización
function toNumber(n: unknown, fallback = 0): number {
  const v = typeof n === 'string' ? Number(n) : (n as number);
  return Number.isFinite(v) ? v : fallback;
}
function toString(s: unknown, fallback = ''): string {
  if (s === null || s === undefined) return fallback;
  return String(s);
}

// GET /api/products - Obtener todos los productos
export async function GET() {
  try {
    const products = await getProductsFromSheet();
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return NextResponse.json(
      { message: 'Error al obtener los productos', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Normalización: garantizamos strings/números (sin undefined)
    const normalized = {
      sku: toString(validatedData.sku).trim(),
      name: toString(validatedData.name).trim(),
      category: toString(validatedData.category, ''),
      tags: toString(validatedData.tags, ''),
      description: toString(validatedData.description, ''),
      image_url: toString(validatedData.image_url, ''),
      supplier: toString(validatedData.supplier, ''),
      cost: toNumber(validatedData.cost, 0),
      price: toNumber(validatedData.price, 0),
      stock: toNumber(validatedData.stock, 0),
      reorder_level: toNumber(validatedData.reorder_level, 0),
      location: toString(validatedData.location, ''),
    };

    if (!normalized.sku) {
      return NextResponse.json({ message: 'El campo sku es obligatorio' }, { status: 400 });
    }
    if (!normalized.name) {
      return NextResponse.json({ message: 'El campo name es obligatorio' }, { status: 400 });
    }

    // Crear producto en Google Sheets (tipo correcto para addProductToSheet)
    await addProductToSheet(normalized as Parameters<typeof addProductToSheet>[0]);

    return NextResponse.json({ message: 'Producto creado exitosamente' }, { status: 201 });
  } catch (error) {
    console.error('[PRODUCTS_POST_ERROR]', error);
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Error al crear el producto', error: (error as Error).message },
      { status: 500 }
    );
  }
}
