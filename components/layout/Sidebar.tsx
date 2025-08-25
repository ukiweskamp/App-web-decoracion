'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  PackageIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  CurrencyDollarIcon,
} from '../ui/Icons';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  const linkClasses = (href: string) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive(href) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
    }`;

  const handleLogout = async () => {
    try {
      // Si existe el endpoint, limpia la cookie de sesión en el servidor
      await fetch('/api/logout', { method: 'POST' });
    } catch (_) {
      // no-op: aunque falle, navegamos igual
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Gestor</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/dashboard" className={linkClasses('/dashboard')}>
          <HomeIcon className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        <Link href="/products" className={linkClasses('/products')}>
          <PackageIcon className="w-5 h-5 mr-3" />
          Productos
        </Link>

        <Link href="/customers" className={linkClasses('/customers')}>
          <UsersIcon className="w-5 h-5 mr-3" />
          Clientes
        </Link>

        <Link href="/sales" className={linkClasses('/sales')}>
          <CurrencyDollarIcon className="w-5 h-5 mr-3" />
          Ventas
        </Link>

        <Link href="/settings" className={linkClasses('/settings')}>
          <SettingsIcon className="w-5 h-5 mr-3" />
          Configuración
        </Link>
      </nav>

      <div className="px-4 py-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-200 transition-colors duration-200"
        >
          <LogOutIcon className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
