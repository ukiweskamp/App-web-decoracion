'use client'

import React, { useState, ChangeEvent } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const LOW_STOCK_THRESHOLD = process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD || '5';
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'ARS';

const Settings: React.FC = () => {
  // En una app real, estos valores se leerían y guardarían en la hoja 'settings' de Google Sheets.
  const [lowStock, setLowStock] = useState(LOW_STOCK_THRESHOLD);
  const [currency, setCurrency] = useState(CURRENCY);

  const handleSave = () => {
    // Aquí iría la lógica para guardar en la API/Google Sheets
    alert('Configuración guardada (simulación).\nPara cambiar permanentemente estos valores, actualiza las variables de entorno en Vercel.');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>
      <div className="max-w-2xl">
        <Card title="Preferencias Generales">
            <div className="space-y-6">
                <Input 
                    label="Umbral de Bajo Stock"
                    type="number"
                    value={lowStock}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLowStock(e.target.value)}
                    helpText="Se mostrará una alerta cuando el stock de un producto sea igual o inferior a este valor."
                />
                <Input 
                    label="Moneda"
                    value={currency}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value.toUpperCase())}
                    helpText="Símbolo de moneda a mostrar en la aplicación (ej: ARS, USD)."
                />
                 <div className="flex justify-end pt-4">
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
            </div>
        </Card>
         <Card title="Webhooks para Automatización (Make/n8n)" className="mt-8">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold">Importación Masiva de Productos</h4>
                    <p className="text-sm text-gray-600">Endpoint para agregar múltiples productos a la vez.</p>
                    <code className="text-xs bg-gray-100 p-2 rounded-md block mt-1">POST /api/hooks/import</code>
                </div>
                 <div>
                    <h4 className="font-semibold">Actualización de Stock</h4>
                    <p className="text-sm text-gray-600">Endpoint para ajustar el stock de un producto existente por SKU.</p>
                    <code className="text-xs bg-gray-100 p-2 rounded-md block mt-1">POST /api/hooks/stock</code>
                </div>
                 <p className="text-sm text-gray-500 mt-4">
                    Recuerda configurar el header <code className="text-xs bg-gray-100 p-1 rounded">X-HOOK-KEY</code> con tu clave secreta para autorizar estas operaciones.
                </p>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
