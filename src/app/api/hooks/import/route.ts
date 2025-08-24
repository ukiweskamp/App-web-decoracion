import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductsFromSheet, addProductToSheet } from '@/lib/googleSheets';
import { productSchema } from '@/lib/validators';

const importSchema = z.object({
  products: z.array(productSchema),
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
    const { products: newProducts } = importSchema.parse(body);
    
    if (newProducts.length === 0) {
        return NextResponse.json({ message: 'No hay productos para importar' }, { status: 400 });
    }

    // 3. Lógica de Negocio
    const existingProducts = await getProductsFromSheet();
    const existingSkus = new Set(existingProducts.map(p => p.sku.toLowerCase()));
    
    const productsToAdd = newProducts.filter(p => !existingSkus.has(p.sku.toLowerCase()));
    const skippedCount = newProducts.length - productsToAdd.length;

    for (const product of productsToAdd) {
        await addProductToSheet(product);
    }
    
    // 4. Respuesta
    return NextResponse.json({
      message: 'Importación completada',
      added: productsToAdd.length,
      skipped: skippedCount,
    });

  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Payload inválido', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}