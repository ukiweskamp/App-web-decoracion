import { NextResponse } from 'next/server';
import { updateProductInSheet, deleteProductFromSheet } from '@/lib/googleSheets';
import { productSchema } from '@/lib/validators';
import { ZodError } from 'zod';

interface RouteParams {
  params: { id: string };
}

// PATCH /api/products/[id] - Actualizar un producto
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    const body = await req.json();
    // Usamos .partial() para permitir actualizaciones parciales
    const validatedData = productSchema.partial().parse(body);

    await updateProductInSheet(id, validatedData);
    return NextResponse.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al actualizar el producto', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Eliminar un producto
export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    await deleteProductFromSheet(id);
    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al eliminar el producto', error: (error as Error).message }, { status: 500 });
  }
}