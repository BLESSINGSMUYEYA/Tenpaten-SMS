/**
 * csv.ts
 * ------
 * Utility services for client-side CSV parsing and template generation.
 */

export interface ParsedCSVRow {
  [key: string]: string;
}

/**
 * Parses raw CSV content text into an array of row objects mapped by header names.
 * Correctly handles quotes, escaped quotes, and commas within fields.
 */
export function parseCSV(text: string): ParsedCSVRow[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  // Split lines manually to avoid breaking on newlines inside quotes
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip next character
      }
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  // Parse headers
  const headers = splitCSVLine(lines[0]);
  const result: ParsedCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitCSVLine(lines[i]);
    const rowObj: ParsedCSVRow = {};

    headers.forEach((header, index) => {
      let val = values[index] || '';
      // Remove surrounding quotes if any
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      // Replace escaped quotes
      val = val.replace(/""/g, '"').trim();
      rowObj[header] = val;
    });

    result.push(rowObj);
  }

  return result;
}

/**
 * Helper to split a CSV line into fields, taking quotes into consideration.
 */
function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentField += char;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField.trim());
  return fields;
}

/**
 * Utility to download a CSV template in the browser.
 */
export function downloadCSVTemplate(filename: string, headers: string[], sampleRow: string[]) {
  const csvContent = [
    headers.join(','),
    sampleRow.join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
