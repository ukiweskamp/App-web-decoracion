import { NextResponse } from 'next/server';
import { getProductsFromSheet, addProductToSheet } from '@/lib/googleSheets';
import { productSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/products - Obtener todos los productos
export async function GET() {
  try {
    const products = await getProductsFromSheet();
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al obtener los productos', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = productSchema.parse(body);
    
    // Aquí podrías verificar si el SKU ya existe
    // const products = await getProductsFromSheet();
    // if (products.some(p => p.sku === validatedData.sku)) {
    //   return NextResponse.json({ message: 'El SKU ya existe' }, { status: 409 });
    // }

    await addProductToSheet(validatedData);
    return NextResponse.json({ message: 'Producto creado exitosamente' }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al crear el producto', error: (error as Error).message }, { status: 500 });
  }
}