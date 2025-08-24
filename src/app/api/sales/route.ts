import { NextResponse } from 'next/server';
import { getSalesFromSheet, addSaleToSheet } from '@/lib/googleSheets';
import { saleSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/sales - Obtener todas las ventas
export async function GET() {
  try {
    const sales = await getSalesFromSheet();
    return NextResponse.json({ data: sales });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al obtener las ventas', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/sales - Crear una nueva venta
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = saleSchema.parse(body);

    await addSaleToSheet(validatedData);

    return NextResponse.json({ message: 'Venta creada exitosamente' }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Datos de venta inválidos', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al crear la venta', error: (error as Error).message }, { status: 500 });
  }
}