// src/app/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export default async function Home() {
  const session = (await cookies()).get('session')?.value;
  const isValid = await verifySession(session);

  if (isValid) {
    redirect('/dashboard');   // si ya estás logueado, al dashboard
  } else {
    redirect('/login');       // si no, al login
  }
}
