import { Workbook } from 'exceljs';

export function toCSV(rows: any[], columns?: string[]): Buffer {
  const items = rows || [];
  const cols = columns && columns.length ? columns : Object.keys(items[0] || {});
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = cols.join(',');
  const lines = items.map((row) => cols.map((c) => escape((row as any)[c])).join(','));
  const csv = [header, ...lines].join('\n');
  const bom = '\uFEFF';
  return Buffer.from(bom + csv, 'utf8');
}

export async function toXLSX(rows: any[], sheetName = 'Export'): Promise<Buffer> {
  const wb = new Workbook();
  const ws = wb.addWorksheet(sheetName);
  const items = rows || [];
  const cols = Object.keys(items[0] || {});
  ws.columns = cols.map((c) => ({ header: c, key: c }));
  for (const row of items) ws.addRow(row);
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
