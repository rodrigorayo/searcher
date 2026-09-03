import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

const KARDEX_URL = 'https://docs.google.com/spreadsheets/d/1AARv6ffIfCNMiFBq-jDG75YZoZZS86LD7pR6JNzkH2M/export?format=xlsx';

export async function GET() {
  try {
    const response = await fetch(KARDEX_URL, { next: { revalidate: 60 } });
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
    const kardex = [];

    for (const sheetName of ['Mañana', 'Tarde']) {
      if (!workbook.Sheets[sheetName]) continue;
      
      const sheet = workbook.Sheets[sheetName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        if (!row) continue;
        
        const studentName = String(row[1] || row[2] || '').trim();
        if (!studentName) continue;

        let dateFormatted = String(row[0] || '');
        if (typeof row[0] === 'number') {
           // Convert Excel serial date to readable string
           const parsedDate = xlsx.SSF.parse_date_code(row[0]);
           if (parsedDate) {
              dateFormatted = `${parsedDate.d}/${parsedDate.m}/${parsedDate.y}`;
           }
        }

        kardex.push({
          date: dateFormatted,
          student: studentName.toUpperCase(),
          observation: String(row[3] || '').trim(),
          felicitation: String(row[4] || '').trim(),
          detail: String(row[5] || '').trim(),
          group: String(row[6] || '').trim(),
          teacher: String(row[7] || '').trim(),
        });
      }
    }

    return NextResponse.json(kardex);
  } catch (error) {
    console.error('Error fetching Kardex:', error);
    return NextResponse.json({ error: 'Failed to fetch kardex' }, { status: 500 });
  }
}
