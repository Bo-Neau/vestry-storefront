/**
 * RFC 4180 CSV parser.
 *
 * Hand-rolled rather than a dependency because the input is a spreadsheet
 * export from a non-technical person: quoted fields containing commas,
 * embedded newlines inside quotes, doubled quotes for a literal quote, and
 * a possible UTF-8 BOM from Excel. Those are the cases that actually break
 * naive `split(",")` parsing.
 */
export function parseCsv(text) {
  // Excel writes a BOM. Left in place it corrupts the first header name.
  const input = text.replace(/^﻿/, "");

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += ch; i += 1; continue;
    }

    if (ch === '"') { inQuotes = true; i += 1; continue; }
    if (ch === ",") { row.push(field); field = ""; i += 1; continue; }
    if (ch === "\r") { i += 1; continue; }
    if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; i += 1; continue; }

    field += ch; i += 1;
  }
  // Trailing field/row with no newline at end of file.
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

/** Rows as objects keyed by header, with a 1-based line number for errors. */
export function parseCsvRecords(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return { headers: [], records: [] };
  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((cells, index) => {
    const record = { __line: index + 2 };
    headers.forEach((h, i) => { record[h] = (cells[i] ?? "").trim(); });
    return record;
  });
  return { headers, records };
}
