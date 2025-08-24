import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (pin === process.env.APP_PIN) {
      await createSession();
      return NextResponse.json({ message: 'Login exitoso' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'PIN incorrecto' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
