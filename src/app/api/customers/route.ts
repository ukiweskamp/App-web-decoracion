import { NextResponse } from 'next/server';
import { getCustomersFromSheet, addCustomerToSheet } from '@/lib/googleSheets';
import { customerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// GET /api/customers - Obtener todos los clientes
export async function GET() {
  try {
    const customers = await getCustomersFromSheet();
    return NextResponse.json({ data: customers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al obtener los clientes', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/customers - Crear un nuevo cliente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = customerSchema.parse(body);
    await addCustomerToSheet(validatedData);
    return NextResponse.json({ message: 'Cliente creado exitosamente' }, { status: 201 });
  } catch (error)
   {
    console.error(error);
    if (error instanceof ZodError) {
        return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al crear el cliente', error: (error as Error).message }, { status: 500 });
  }
}