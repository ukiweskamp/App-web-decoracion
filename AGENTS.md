# AGENTS.md

Guía operativa para agentes que trabajen en este repositorio.

## 1) Contexto del proyecto

- App web interna de inventario/clientes/ventas.
- Stack principal: **Next.js 14 (App Router) + TypeScript + Tailwind + Zod + Google Sheets API**.
- Persistencia: Google Sheets (no hay base SQL).
- Autenticación: PIN + sesión JWT (cookie `session`).

## 2) Estructura relevante

- `src/app/`:
  - Rutas UI y API (`src/app/api/**`).
  - Grupos como `(main)` para páginas protegidas.
- `src/lib/`:
  - `googleSheets.ts`: capa de acceso a datos.
  - `validators.ts`: contratos Zod de entrada.
  - `auth.ts`: sesión/JWT.
- `src/middleware.ts`:
  - Protege rutas de UI y excluye `/api`.
- `src/components/`:
  - Componentes por dominio (`products`, `customers`, `sales`, etc.).

## 3) Comandos de trabajo

```bash
npm install
npm run dev
npm run lint
npm run build
```

Notas:
- No hay suite de tests automatizados en el repo actualmente.
- Para cambios de API o modelo de datos, correr al menos `npm run lint` y `npm run build`.

## 4) Variables de entorno críticas

Definidas/consumidas por el código:

- `APP_PIN`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (con saltos `\n` escapados)
- `WEBHOOK_SECRET_KEY`
- `NEXT_PUBLIC_CURRENCY_SYMBOL`
- `NEXT_PUBLIC_LOW_STOCK_THRESHOLD`
- `NEXT_PUBLIC_CURRENCY`

Regla: **nunca** subir secretos o archivos `.env*` al repositorio.

## 5) Convenciones para cambios

1. **Validación primero**  
   Si agregas/cambias campos de entrada, actualiza `src/lib/validators.ts`.

2. **Mantener tipos alineados**  
   Sincroniza cambios con `src/types/index.ts` cuando corresponda.

3. **Google Sheets: respetar cabeceras y orden**  
   En `src/lib/googleSheets.ts` existen arreglos de headers (`PRODUCT_HEADERS`, `CUSTOMER_HEADERS`, `SALES_HEADERS`) que definen el mapeo de columnas.  
   Si cambian, debes ajustar lectura/escritura y estructura esperada de la hoja.

4. **Rutas API con manejo de error consistente**  
   Usar `NextResponse.json(...)` con mensajes claros y códigos HTTP correctos.

5. **No romper autenticación/middleware**  
   Revisar impacto en `src/lib/auth.ts` y `src/middleware.ts` ante cambios de sesión/login.

6. **Importaciones**  
   Preferir alias `@/*` (configurado en `tsconfig.json`) para mantener consistencia.

## 6) Checklist antes de cerrar cambios

- [ ] Compila y lint sin errores (`npm run lint`, `npm run build`).
- [ ] Si tocaste API:
  - [ ] Validación Zod actualizada.
  - [ ] Tipos y mapping de Sheets alineados.
  - [ ] Respuestas y códigos HTTP correctos.
- [ ] Si tocaste ventas/stock:
  - [ ] Confirmar que el descuento/actualización de stock sigue funcionando.
- [ ] Si tocaste auth:
  - [ ] Login/logout y redirecciones del middleware verificadas.

