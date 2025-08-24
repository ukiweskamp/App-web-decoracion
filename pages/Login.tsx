
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
        if (login(pin)) {
          navigate('/');
        } else {
          setError('El PIN es incorrecto. Inténtalo de nuevo.');
        }
        setLoading(false);
    }, 500);
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
};

export default Login;