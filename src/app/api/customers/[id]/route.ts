import { NextResponse } from 'next/server';
import { updateCustomerInSheet, deleteCustomerFromSheet } from '@/lib/googleSheets';
import { customerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

interface RouteParams {
  params: { id: string };
}

// PATCH /api/customers/[id] - Actualizar un cliente
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    const body = await req.json();
    const validatedData = customerSchema.partial().parse(body);
    await updateCustomerInSheet(id, validatedData);
    return NextResponse.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error(error);
     if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al actualizar el cliente', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - Eliminar un cliente
export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    await deleteCustomerFromSheet(id);
    return NextResponse.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al eliminar el cliente', error: (error as Error).message }, { status: 500 });
  }
}