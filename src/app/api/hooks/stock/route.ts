import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductsFromSheet, updateProductInSheet } from '@/lib/googleSheets';
import { Product } from '@/types';

const stockUpdateSchema = z.object({
  sku: z.string().min(1),
  delta: z.number().int(),
});

export async function POST(req: NextRequest) {
  // 1. Autorización
  const authHeader = req.headers.get('x-hook-key');
  if (authHeader !== process.env.WEBHOOK_SECRET_KEY) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    // 2. Validación del Payload
    const body = await req.json();
    const { sku, delta } = stockUpdateSchema.parse(body);

    // 3. Lógica de Negocio
    const products = await getProductsFromSheet();
    const productToUpdate = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());

    if (!productToUpdate) {
      return NextResponse.json({ message: `Producto con SKU '${sku}' no encontrado.` }, { status: 404 });
    }

    const newStock = (productToUpdate.stock || 0) + delta;
    if (newStock < 0) {
        return NextResponse.json({ message: 'La operación resultaría en stock negativo.' }, { status: 400 });
    }

    await updateProductInSheet(productToUpdate.id, { stock: newStock });

    // 4. Respuesta
    return NextResponse.json({
      message: 'Stock actualizado exitosamente',
      sku: productToUpdate.sku,
      oldStock: productToUpdate.stock,
      newStock,
    });

  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Payload inválido', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}