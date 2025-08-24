'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, PackageIcon, UsersIcon, SettingsIcon, LogOutIcon, CurrencyDollarIcon } from '../ui/Icons';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: HomeIcon },
    { href: '/products', label: 'Productos', icon: PackageIcon },
    { href: '/customers', label: 'Clientes', icon: UsersIcon },
    { href: '/sales', label: 'Ventas', icon: CurrencyDollarIcon },
    { href: '/settings', label: 'Configuración', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Gestor</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = (href === '/' && pathname === href) || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Link>
          );
        })}
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
}