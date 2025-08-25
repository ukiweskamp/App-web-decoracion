'use client'

// ...existing code...

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, PackageIcon, UsersIcon, SettingsIcon, LogOutIcon, CurrencyDollarIcon } from '../ui/Icons';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    <>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-md p-2 shadow"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay para móvil */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden" onClick={() => setOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`z-50 md:z-40 ${open ? 'block' : 'hidden'} md:block fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex-shrink-0`}
      >
        <div className="flex flex-col items-center w-full px-4 border-b pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Espacio Delfina</h1>
          <img
            src="/favicon.svg"
            alt="Logo Espacio Delfina"
            className="w-24 h-24 md:w-40 md:h-40 object-contain"
            style={{ maxWidth: '160px', maxHeight: '160px' }}
          />
        </div>
        {/* Botón cerrar solo en móvil */}
        <div className="absolute top-4 right-4 md:hidden">
          <button className="p-2" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                onClick={() => setOpen(false)}
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
    </>
  );
}