'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        // Mandamos a "/" y dejamos que la home redirija según sesión
        router.push('/');
        router.refresh();
      } else {
        let msg = 'El PIN es incorrecto.';
        try {
          const data = await res.json();
          msg = data?.message || msg;
        } catch {}
        setError(msg);
      }
    } catch {
      setError('Ocurrió un error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Acceso Interno
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Ingresa tu PIN para continuar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="pin"
            name="pin"
            type="password"
            label="PIN de Acceso"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            placeholder="••••"
            error={error}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
