// src/app/api/hooks/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductsFromSheet, addProductToSheet } from '@/lib/googleSheets';
import { productSchema } from '@/lib/validators';

// Schema del payload entrante
const importSchema = z.object({
  products: z.array(productSchema),
});

export async function POST(req: NextRequest) {
  // 1) Autorización por header (si configuraste WEBHOOK_SECRET_KEY)
  const key = req.headers.get('x-hook-key');
  if (process.env.WEBHOOK_SECRET_KEY && key !== process.env.WEBHOOK_SECRET_KEY) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    // 2) Validación del payload
    const body = await req.json().catch(() => ({}));
    const parsed = importSchema.parse(body);
    const newProducts = parsed.products;

    if (!newProducts?.length) {
      return NextResponse.json(
        { message: 'No hay productos para importar' },
        { status: 400 }
      );
    }

    // 3) Obtener existentes y calcular cuáles agregar (por SKU case-insensitive)
    const existingProducts = await getProductsFromSheet();
    const existingSkus = new Set(
      existingProducts.map(p => String(p.sku ?? '').toLowerCase())
    );

    const productsToAddRaw = newProducts.filter(
      (p) => !existingSkus.has(String(p.sku).toLowerCase())
    );
    const skippedCount = newProducts.length - productsToAddRaw.length;

    // 4) Normalizar campos opcionales -> strings/números (evita undefined)
    //    y castear al tipo que espera addProductToSheet (primer parámetro)
    const productsToAdd = productsToAddRaw.map((p) => {
      const normalized = {
        sku: String(p.sku ?? '').trim(),
        name: String(p.name ?? '').trim(),
        category: p.category ?? '',
        tags: p.tags ?? '',
        description: p.description ?? '',
        image_url: p.image_url ?? '',
        supplier: p.supplier ?? '',
        cost: Number(p.cost ?? 0),
        price: Number(p.price ?? 0),
        stock: Number(p.stock ?? 0),
        reorder_level: Number(p.reorder_level ?? 0),
        location: p.location ?? '',
      };

      // Aseguramos que sku y name vengan completos
      if (!normalized.sku) throw new Error('Falta sku en un producto');
      if (!normalized.name) throw new Error('Falta name en un producto');

      // Tip: castear al tipo del primer parámetro de addProductToSheet
      return normalized as Parameters<typeof addProductToSheet>[0];
    });

    // 5) Insertar uno por uno
    for (const product of productsToAdd) {
      await addProductToSheet(product);
    }

    // 6) Respuesta
    return NextResponse.json({
      message: 'Importación completada',
      added: productsToAdd.length,
      skipped: skippedCount,
    });

  } catch (error: any) {
    // Errores de validación Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Payload inválido', errors: error.issues },
        { status: 400 }
      );
    }

    // Otro error
    console.error('[IMPORT_WEBHOOK_ERROR]', error);
    return NextResponse.json(
      { message: error?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
