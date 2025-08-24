export function exportToCsv<T extends object>(filename: string, data: T[]): void {
  if (data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(fieldName => {
        const value = (row as any)[fieldName];
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape commas and quotes
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
