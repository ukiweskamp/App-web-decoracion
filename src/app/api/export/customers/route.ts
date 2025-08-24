import { NextResponse } from 'next/server';
import { getCustomersFromSheet } from '@/lib/googleSheets';

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
        const customers = await getCustomersFromSheet();
        if (customers.length === 0) {
            return new Response("No hay clientes para exportar.", { status: 200 });
        }

        const headers = Object.keys(customers[0]);
        const csv = arrayToCsv(customers, headers);

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="clientes.csv"`,
                'Content-Type': 'text/csv',
            },
        });

    } catch (error) {
        return NextResponse.json({ message: "Error al exportar clientes" }, { status: 500 });
    }
}
