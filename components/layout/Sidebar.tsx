
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HomeIcon, PackageIcon, UsersIcon, SettingsIcon, LogOutIcon, CurrencyDollarIcon } from '../ui/Icons';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Gestor</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/" end className={navLinkClasses}>
          <HomeIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/products" className={navLinkClasses}>
          <PackageIcon className="w-5 h-5 mr-3" />
          Productos
        </NavLink>
        <NavLink to="/customers" className={navLinkClasses}>
          <UsersIcon className="w-5 h-5 mr-3" />
          Clientes
        </NavLink>
        <NavLink to="/sales" className={navLinkClasses}>
          <CurrencyDollarIcon className="w-5 h-5 mr-3" />
          Ventas
        </NavLink>
        <NavLink to="/settings" className={navLinkClasses}>
          <SettingsIcon className="w-5 h-5 mr-3" />
          Configuración
        </NavLink>
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
