import { google } from 'googleapis';
import { Product, Customer, Sale, SaleItem } from '@/types';

// Configuración de la autenticación
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Helper para convertir filas de Sheets a objetos
function rowsToObjects<T>(rows: any[][], headers: string[]): T[] {
  return rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj as T;
  });
}

async function getSheetData(range: string) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values || [];
}

async function findRowIndex(sheetName: string, id: string): Promise<number> {
    const ids = (await getSheetData(`${sheetName}!A2:A`)).flat();
    const rowIndex = ids.indexOf(id);
    if (rowIndex === -1) throw new Error(`ID no encontrado en la hoja ${sheetName}: ${id}`);
    return rowIndex + 2; // +2 porque es 1-based y la data empieza en la fila 2
}

async function findRowIndexBySku(sku: string): Promise<number> {
    const skus = (await getSheetData('products!B2:B')).flat();
    const rowIndex = skus.findIndex(s => s.toLowerCase() === sku.toLowerCase());
    if (rowIndex === -1) throw new Error(`SKU no encontrado: ${sku}`);
    return rowIndex + 2;
}


// Helper para obtener el sheetId por nombre, necesario para borrar filas
async function getSheetIdByName(sheetName: string): Promise<number | null> {
    const response = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId ?? null;
}

// --- API de Productos ---
const PRODUCT_HEADERS = ['id','sku','name','category','tags','description','image_url','supplier','cost','price','stock','reorder_level','location','created_at','updated_at'];
const PRODUCTS_RANGE = 'products!A2:O';

export async function getProductsFromSheet(): Promise<Product[]> {
    const rows = await getSheetData(PRODUCTS_RANGE);
    return rowsToObjects<Product>(rows, PRODUCT_HEADERS).map(p => ({
        ...p,
        cost: parseFloat(p.cost as any) || 0,
        price: parseFloat(p.price as any) || 0,
        stock: parseInt(p.stock as any, 10) || 0,
        reorder_level: parseInt(p.reorder_level as any, 10) || 0,
    }));
}

export async function addProductToSheet(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const newId = `prod_${new Date().getTime()}`;
    const timestamp = new Date().toISOString();
    const newRow = [
        newId, product.sku, product.name, product.category, product.tags, product.description,
        product.image_url, product.supplier, product.cost, product.price, product.stock,
        product.reorder_level, product.location, timestamp, timestamp
    ];
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'products!A:A',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [newRow],
        },
    });
}

export async function updateProductInSheet(id: string, updates: Partial<Product>) {
    const rowIndex = await findRowIndex('products', id);
    const existingData = (await getSheetData(`products!A${rowIndex}:O${rowIndex}`))[0];
    
    const updatedRow = PRODUCT_HEADERS.map((header, index) => {
        return header in updates ? (updates as any)[header] : existingData[index];
    });
    
    // Actualizar `updated_at`
    const updatedAtIndex = PRODUCT_HEADERS.indexOf('updated_at');
    updatedRow[updatedAtIndex] = new Date().toISOString();
    
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `products!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [updatedRow] },
    });
}

export async function deleteProductFromSheet(id: string) {
    const sheetId = await getSheetIdByName('products');
    if (sheetId === null) throw new Error("Hoja 'products' no encontrada.");
    const rowIndex = await findRowIndex('products', id);
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId, 
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1,
                        endIndex: rowIndex,
                    },
                },
            }],
        },
    });
}


// --- API de Clientes ---
const CUSTOMER_HEADERS = ['id','name','email','phone','address','notes','created_at','updated_at'];
const CUSTOMERS_RANGE = 'customers!A2:H';

export async function getCustomersFromSheet(): Promise<Customer[]> {
    const rows = await getSheetData(CUSTOMERS_RANGE);
    return rowsToObjects<Customer>(rows, CUSTOMER_HEADERS);
}

export async function addCustomerToSheet(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    const newId = `cust_${new Date().getTime()}`;
    const timestamp = new Date().toISOString();
    const newRow = [
        newId, customer.name, customer.email, customer.phone, customer.address,
        customer.notes, timestamp, timestamp
    ];
     await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'customers!A:A',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [newRow] },
    });
}

export async function updateCustomerInSheet(id: string, updates: Partial<Customer>) {
    const rowIndex = await findRowIndex('customers', id);
    const existingData = (await getSheetData(`customers!A${rowIndex}:H${rowIndex}`))[0];
    
    const updatedRow = CUSTOMER_HEADERS.map((header, index) => {
        return header in updates ? (updates as any)[header] : existingData[index];
    });
    updatedRow[CUSTOMER_HEADERS.indexOf('updated_at')] = new Date().toISOString();
    
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `customers!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [updatedRow] },
    });
}

export async function deleteCustomerFromSheet(id: string) {
    const sheetId = await getSheetIdByName('customers');
    if (sheetId === null) throw new Error("Hoja 'customers' no encontrada.");
    const rowIndex = await findRowIndex('customers', id);
    
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{
            deleteDimension: {
                range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex - 1,
                    endIndex: rowIndex,
                },
            },
        }]},
    });
}

// --- API de Ventas ---
const SALES_HEADERS = ['id', 'sale_date', 'customer_id', 'customer_name', 'items', 'total_amount', 'notes', 'created_at', 'updated_at'];
const SALES_RANGE = 'sales!A2:I';

export async function getSalesFromSheet(): Promise<Sale[]> {
    const rows = await getSheetData(SALES_RANGE);
    const sales = rowsToObjects<any>(rows, SALES_HEADERS);
    return sales.map(s => ({
        ...s,
        items: JSON.parse(s.items || '[]'),
        total_amount: parseFloat(s.total_amount) || 0,
    }));
}

export async function addSaleToSheet(saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    // 1. Agregar la venta a la hoja 'sales'
    const newId = `sale_${new Date().getTime()}`;
    const timestamp = new Date().toISOString();
    const newRow = [
        newId,
        saleData.sale_date,
        saleData.customer_id,
        saleData.customer_name,
        JSON.stringify(saleData.items),
        saleData.total_amount,
        saleData.notes,
        timestamp,
        timestamp,
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'sales!A:A',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [newRow] },
    });

    // 2. Actualizar el stock de cada producto vendido
    const products = await getProductsFromSheet();
    const productMap = new Map(products.map(p => [p.sku, p]));
    
    for (const item of saleData.items) {
        const product = productMap.get(item.sku);
        if (product) {
            const newStock = product.stock - item.quantity;
            if (newStock < 0) {
                console.warn(`Alerta: La venta del producto ${item.sku} resultó en stock negativo (${newStock}).`);
            }
            // Encuentra la fila del producto por SKU para actualizarla.
            const productRowIndex = await findRowIndexBySku(item.sku);
            const stockColumnIndex = PRODUCT_HEADERS.indexOf('stock');
            const stockColumnLetter = String.fromCharCode('A'.charCodeAt(0) + stockColumnIndex);
            
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `products!${stockColumnLetter}${productRowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[newStock]] },
            });

        } else {
            console.error(`Error: No se encontró el producto con SKU ${item.sku} para actualizar el stock.`);
        }
    }
}