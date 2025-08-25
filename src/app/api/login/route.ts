import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    const APP_PIN = process.env.APP_PIN?.toString() ?? '';
    if (!APP_PIN) {
      return NextResponse.json(
        { message: 'APP_PIN no está configurado en las variables de entorno' },
        { status: 500 }
      );
    }

    if (typeof pin === 'string' && pin.trim() === APP_PIN) {
      // crea cookie/sesión (implementado en lib/auth)
      await createSession();
      return NextResponse.json({ message: 'Login exitoso' }, { status: 200 });
    }

    return NextResponse.json({ message: 'PIN incorrecto' }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// (Opcional) rechaza otros métodos con 405
export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
export async function PUT()  { return GET(); }
export async function PATCH(){ return GET(); }
export async function DELETE(){ return GET(); }
