import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Custom CSV splitter (handles quoted commas)
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  result.push(cur.trim());
  return result.map(v => v.replace(/^"|"$/g, ''));
}

function parseCSVText(text: string): any[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCSVLine(line);
    const row: any = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? null; });
    return row;
  });
}

function parseJSONBuffer(buf: Buffer): any[] {
  const text = buf.toString('utf-8');
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function parseXLSX(buf: Buffer): any[] {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { defval: null }) as any[];
}

// PDF: extract table-like lines, return as rows with best-guess columns
async function parsePDF(buf: Buffer): Promise<any[]> {
  const data = await pdfParse(buf);
  const lines = data.text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // Heuristic: find lines with multiple whitespace-separated tokens (table rows)
  const tableLines = lines.filter(l => l.split(/\s{2,}/).length >= 2);
  if (tableLines.length === 0) {
    // Fallback: return raw lines as single-column rows
    return lines.map(l => ({ raw_text: l }));
  }

  // Use first line as headers
  const headers = tableLines[0].split(/\s{2,}/);
  return tableLines.slice(1).map(line => {
    const cols = line.split(/\s{2,}/);
    const row: any = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? null; });
    return row;
  });
}

// Word: extract table rows → JSON, fallback to paragraphs
async function parseWord(buf: Buffer): Promise<any[]> {
  const result = await mammoth.extractRawText({ buffer: buf });
  const lines = result.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const tableLines = lines.filter(l => l.split(/\t|\s{2,}/).length >= 2);
  if (tableLines.length === 0) {
    return lines.map(l => ({ raw_text: l }));
  }

  const headers = tableLines[0].split(/\t|\s{2,}/);
  return tableLines.slice(1).map(line => {
    const cols = line.split(/\t|\s{2,}/);
    const row: any = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? null; });
    return row;
  });
}

export async function parseUploadedFile(
  buffer: Buffer,
  originalName: string
): Promise<{ rows: any[]; error?: string }> {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? '';

  try {
    if (ext === 'csv') {
      const rows = parseCSVText(buffer.toString('utf-8'));
      return { rows };
    }

    if (ext === 'json') {
      const rows = parseJSONBuffer(buffer);
      return { rows };
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const rows = parseXLSX(buffer);
      return { rows };
    }

    if (ext === 'pdf') {
      const rows = await parsePDF(buffer);
      return { rows };
    }

    if (ext === 'docx' || ext === 'doc') {
      const rows = await parseWord(buffer);
      return { rows };
    }

    return { rows: [], error: `Unsupported file type: .${ext}` };
  } catch (err: any) {
    return { rows: [], error: err.message ?? 'Failed to parse file.' };
  }
}
