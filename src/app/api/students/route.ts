import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

// Google Sheet Export URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1IoRZZvWUbh_sp3xjkRNf9ZxL5QG0dAazX_BeKKntgWk/export?format=xlsx';

export async function GET() {
  try {
    const response = await fetch(SHEET_URL, { next: { revalidate: 60 } }); // Cache for 60 seconds
    const arrayBuffer = await response.arrayBuffer();
    
    // Parse the Excel file
    const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
    const students = [];

    // Smart Parser for the specific Excel structure
    for (const sheetName of workbook.SheetNames) {
      // Skip summary sheets
      if (sheetName.toLowerCase().includes('docentes') || sheetName.toLowerCase().includes('estxnivel')) continue;

      const sheet = workbook.Sheets[sheetName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      // Scan entire sheet to find student tables
      for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!row) continue;

        for (let c = 0; c < row.length; c++) {
          const cellValue = String(row[c] || '').toUpperCase().trim();
          
          if (cellValue === 'NOMBRE COMPLETO') {
            // We found a table of students! 
            // Now, let's look upwards to find their Teacher, Room, Level, Shift
            let teacher = 'Desconocido', nivel = sheetName, aula = 'Desconocida', turno = 'Desconocido';

            // Scan up to 10 rows above this table, and 2 columns left/right to find metadata
            for(let i = r - 1; i >= Math.max(0, r - 10); i--) {
                const searchRow = data[i];
                if (!searchRow) continue;
                for(let j = Math.max(0, c - 2); j <= c + 2; j++) {
                    const cellStr = String(searchRow[j] || '').toUpperCase().trim();
                    if (cellStr.includes('TEACHER:')) {
                        teacher = searchRow[j+1] || searchRow[j+2] || teacher;
                    }
                    if (cellStr.includes('AULA')) {
                        aula = searchRow[j+1] || searchRow[j+2] || aula;
                    }
                    if (cellStr.includes('TURNO:')) {
                        turno = searchRow[j+1] || searchRow[j+2] || turno;
                    }
                    if (cellStr.includes('NIVEL:')) {
                        nivel = searchRow[j+1] || searchRow[j+2] || nivel;
                    }
                }
            }

            // Extract students going downwards
            for (let s = r + 1; s < data.length; s++) {
                const sRow = data[s];
                if (!sRow) continue;
                const studentName = sRow[c];
                
                // If cell is empty, we reached the end of this list
                if (!studentName || String(studentName).trim() === '' || String(studentName).trim().toUpperCase() === 'N°') {
                    break;
                }

                const course = sRow[c+1] || '';
                
                // Clean up teacher name (often has trailing spaces in Excel)
                teacher = String(teacher).replace('TEACHER:', '').trim();
                aula = String(aula).replace('AULA', '').trim();
                turno = String(turno).replace('TURNO:', '').trim();
                nivel = String(nivel).replace('NIVEL:', '').trim();

                students.push({
                    id: `${sheetName}-${s}-${c}`,
                    name: String(studentName).trim(),
                    course: String(course).trim(),
                    teacher: teacher,
                    level: nivel,
                    room: aula,
                    shift: turno,
                    sheet: sheetName
                });
            }
          }
        }
      }
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching/parsing Excel:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
