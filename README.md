# Gestor de Inventario y Clientes con Google Sheets

Este proyecto es un backoffice web interno, simple y de costo cero, diseñado para pequeñas empresas. Permite gestionar productos, inventario y clientes utilizando una hoja de cálculo de Google Sheets como base de datos. Está construido con Next.js y pensado para un despliegue sencillo en Vercel.

## Stack Tecnológico

-   **Framework**: Next.js (App Router) con TypeScript
-   **Estilos**: Tailwind CSS
-   **UI Components**: Componentes React simples y sin librerías pesadas.
-   **Base de Datos**: Google Sheets API
-   **Autenticación**: Protección por PIN simple (server-side con middleware)
-   **Validación**: Zod para los payloads de la API.
-   **Despliegue**: Vercel

## Funcionalidades Principales

-   **Gestión de Productos**: CRUD completo (Crear, Leer, Actualizar, Eliminar).
-   **Gestión de Clientes**: CRUD completo.
-   **Gestión de Ventas**: Registro de ventas con descuento automático de stock.
-   **Cálculos Derivados**: Margen de ganancia y alertas visuales (bajo stock, margen negativo).
-   **Seguridad**: Acceso protegido por PIN y webhooks asegurados con clave secreta.
-   **Exportación**: Descarga de datos de productos y clientes en formato CSV.
-   **Automatización**: Endpoints de webhook listos para integrar con Make/n8n.

### ¿Cómo se Calcula la Ganancia Bruta Estimada?

La ganancia bruta es una estimación de tus beneficios antes de descontar otros gastos operativos (alquiler, servicios, etc.). Te da una idea clara de la rentabilidad de tus productos. Se calcula con la siguiente fórmula:

**Ganancia Bruta = `Ingresos Totales` - `Costo Total de Productos Vendidos`**

-   **Ingresos Totales**: Es la suma del `monto total` de todas las ventas realizadas en el periodo de tiempo que hayas filtrado en el Dashboard.
-   **Costo Total de Productos Vendidos**: Para cada venta, el sistema busca el `costo` actual de cada producto vendido (en la hoja `products`) y lo multiplica por la cantidad vendida. Luego, suma estos costos para obtener el total.

*Nota: Se considera una "estimación" porque utiliza el costo actual del producto. Si el costo de un producto cambia con el tiempo, el cálculo usará el valor más reciente. Aún así, es un indicador financiero clave y muy útil.*

---

## SETUP: Guía de Inicio Rápido (5 Pasos)

Sigue estos pasos para tener el proyecto funcionando localmente y desplegado.

### Paso 1: Configurar el Proyecto en Google Cloud

Para que la aplicación pueda leer y escribir en tu Google Sheet, necesitas crear una "Cuenta de Servicio" (Service Account), que es como un usuario robot.

1.  **Ve a la [Consola de Google Cloud](https://console.cloud.google.com/)**.
2.  **Crea un Nuevo Proyecto**: Dale un nombre descriptivo, como "Mi Gestor de Inventario".
3.  **Habilita la API de Google Sheets**:
    -   En el buscador, escribe "Google Sheets API" y selecciónala.
    -   Haz clic en el botón **HABILITAR**.
4.  **Crea una Cuenta de Servicio**:
    -   Ve a `IAM y administración` > `Cuentas de servicio`.
    -   Haz clic en **CREAR CUENTA DE SERVICIO**.
    -   Dale un nombre (ej. `sheets-editor`) y una descripción. Haz clic en **CREAR Y CONTINUAR**.
    -   En "Roles", selecciona `Básico > Editor`. Haz clic en **CONTINUAR** y luego en **LISTO**.
5.  **Genera la Clave JSON**:
    -   Busca tu nueva cuenta de servicio en la lista y haz clic en ella.
    -   Ve a la pestaña `CLAVES`.
    -   Haz clic en `AGREGAR CLAVE` > `Crear clave nueva`.
    -   Selecciona **JSON** y haz clic en **CREAR**. Se descargará un archivo `.json`. **¡Guárdalo bien, es tu secreto!**

### Paso 2: Preparar la Hoja de Cálculo (Google Sheet)

1.  **Crea una nueva Hoja de Cálculo en [Google Sheets](https://sheets.new)**.
2.  **Crea 4 Pestañas (Hojas)** en la parte inferior con los nombres exactos: `products`, `customers`, `sales`, `settings`.
3.  **Añade las Cabeceras EXACTAS** en la primera fila de cada hoja. **Es crucial que coincidan 100%**.

    **Hoja `products`:**
    ```
    id,sku,name,category,tags,description,image_url,supplier,cost,price,stock,reorder_level,location,created_at,updated_at
    ```

    **Hoja `customers`:**
    ```
    id,name,email,phone,address,notes,created_at,updated_at
    ```
    
    **Hoja `sales`:**
    ```
    id,sale_date,customer_id,customer_name,items,total_amount,notes,created_at,updated_at
    ```

    **Hoja `settings` (Opcional por ahora):**
    ```
    key,value
    ```

4.  **Comparte la Hoja con la Cuenta de Servicio**:
    -   Abre el archivo `.json` que descargaste. Busca el valor de `client_email`. Se verá como `sheets-editor@mi-proyecto-12345.iam.gserviceaccount.com`.
    -   En tu Google Sheet, haz clic en el botón **Compartir** (arriba a la derecha).
    -   Pega el email de la cuenta de servicio en el campo de texto.
    -   Asegúrate de darle permisos de **Editor**.
    -   Haz clic en **Enviar**.

### Paso 3: Configurar el Código Localmente

1.  **Clona el repositorio y entra en la carpeta**:
    ```bash
    git clone <URL_DEL_REPO>
    cd <NOMBRE_DEL_REPO>
    ```
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
3.  **Configura las Variables de Entorno**:
    -   Copia `.env.example` a un nuevo archivo llamado `.env.local`:
        ```bash
        cp .env.example .env.local
        ```
    -   Abre `.env.local` y rellena los valores:

        -   `APP_PIN`: El PIN que usarás para entrar.
        -   `GOOGLE_SHEETS_SPREADSHEET_ID`: El ID de tu hoja. Lo sacas de la URL: `.../spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`.
        -   `GOOGLE_SERVICE_ACCOUNT_EMAIL`: El `client_email` del archivo JSON.
        -   `GOOGLE_PRIVATE_KEY`: Abre el archivo JSON y copia todo el contenido de `private_key`. **Importante:** Debe estar en una sola línea. Reemplaza los saltos de línea `\n` por `\\n`.
        -   `NEXT_PUBLIC_...`: Configura valores por defecto para la UI.
        -   `WEBHOOK_SECRET_KEY`: Una clave secreta para proteger tus webhooks. Inventa una.

4.  **Inicia la aplicación**:
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador. ¡Listo para usar!

### Paso 4: Desplegar en Vercel

1.  **Sube tu código a un repositorio de GitHub**.
2.  **Crea una cuenta en [Vercel](https://vercel.com/)** y conéctala con tu GitHub.
3.  **Crea un Nuevo Proyecto**: Importa tu repositorio desde GitHub.
4.  **Configura las Variables de Entorno**:
    -   En el panel de tu proyecto en Vercel, ve a `Settings > Environment Variables`.
    -   Añade **todas** las variables de tu archivo `.env.local`. Vercel las protegerá y las usará en el servidor.
5.  **Despliega**: Haz clic en el botón `Deploy`. Vercel construirá y desplegará tu aplicación automáticamente.

### Paso 5: Usar Webhooks para Automatización (Make/n8n)

Los webhooks son endpoints de API que permiten a servicios externos (como Make o n8n) enviar datos a tu aplicación.

-   **Endpoint de Importación Masiva**: `POST {TU_URL}/api/hooks/import`
-   **Endpoint de Actualización de Stock**: `POST {TU_URL}/api/hooks/stock`

Para usarlos, debes incluir un `header` de autorización en tu petición HTTP:
`X-HOOK-KEY: <tu_clave_secreta_del_env>`

**Ejemplo de Payload para Importación Masiva (`/api/hooks/import`)**:
```json
{
  "products": [
    {
      "sku": "DEC-101",
      "name": "Vela Aromática Grande",
      "price": 3000,
      "cost": 1200,
      "stock": 15,
      "category": "Velas"
    },
    {
      "sku": "DEC-102",
      "name": "Marco de Fotos de Madera",
      "price": 2500,
      "cost": 900,
      "stock": 20,
      "category": "Decoración"
    }
  ]
}
```

**Ejemplo de Payload para Actualizar Stock (`/api/hooks/stock`)**:
Ajusta el stock del producto con el SKU `DEC-101`, sumándole `5` unidades.
```json
{
  "sku": "DEC-101",
  "delta": 5
}
```
Para restar stock, usa un número negativo (ej. `"delta": -1`).