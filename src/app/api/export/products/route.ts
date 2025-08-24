import { NextResponse } from 'next/server';
import { getProductsFromSheet } from '@/lib/googleSheets';

function arrayToCsv(data: any[], headers: string[]): string {
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(fieldName => {
                const value = row[fieldName];
                const stringValue = value === null || value === undefined ? '' : String(value);
                const escaped = stringValue.replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
}

export async function GET() {
    try {
        const products = await getProductsFromSheet();
        if (products.length === 0) {
            return new Response("No hay productos para exportar.", { status: 200 });
        }
        
        const headers = Object.keys(products[0]);
        const csv = arrayToCsv(products, headers);

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="productos.csv"`,
                'Content-Type': 'text/csv',
            },
        });

    } catch (error) {
        return NextResponse.json({ message: "Error al exportar productos" }, { status: 500 });
    }
}
