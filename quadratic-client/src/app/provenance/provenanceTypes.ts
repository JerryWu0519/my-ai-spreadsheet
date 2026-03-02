/**
 * Deep-Traceability: Provenance metadata types.
 *
 * Every "sourced" cell can carry a Provenance object that records:
 * - which file the data came from
 * - where inside that file the data was extracted from
 */

/** Supported source file types for the Source Viewer */
export type SourceFileType = 'pdf' | 'csv' | 'json' | 'parquet' | 'xlsx' | 'text' | 'url' | 'unknown';

/** Location context inside a source file */
export interface LocationContext {
  /** For PDF: 0-based page index */
  pageIndex?: number;
  /** Byte offset into the raw file (for CSV / text) */
  byteOffset?: number;
  /** Row index inside a tabular file (0-based, header = 0) */
  rowIndex?: number;
  /** Column index or column name */
  columnRef?: string | number;
  /** Bounding box for PDF text blocks (in PDF coordinate space) */
  boundingBox?: { x: number; y: number; width: number; height: number };
  /** A unique text anchor that can be searched for in the source */
  textAnchor?: string;
  /** JSON path (e.g. "$.data[0].revenue") */
  jsonPath?: string;
  /** URL fragment or section anchor */
  urlFragment?: string;
  /** The actual cell value (for value-based search in source docs) */
  cellValue?: string;
  /** The row label / metric name (e.g. "EBIT", "Revenue") */
  cellLabel?: string;
}

/** The full Provenance metadata object stored per cell */
export interface Provenance {
  /** Unique identifier for the source file (local path, cloud URL, or generated UUID) */
  fileId: string;
  /** Human-readable display name for the source */
  fileName: string;
  /** MIME type or detected file type */
  fileType: SourceFileType;
  /** The location inside the file where this data came from */
  location: LocationContext;
  /** When the data was extracted (ISO 8601) */
  extractedAt: string;
  /** Which AI model / agent extracted it */
  extractedBy?: string;
  /** Optional: the raw text snippet surrounding the extracted value */
  sourceSnippet?: string;
  /** Optional: URL for web sources */
  sourceUrl?: string;
}

/**
 * Key format for the provenance store: "sheetId:x:y"
 * where x and y are the cell coordinates.
 */
export type ProvenanceCellKey = string;

export function makeProvenanceCellKey(sheetId: string, x: number, y: number): ProvenanceCellKey {
  return `${sheetId}:${x}:${y}`;
}

export function parseProvenanceCellKey(key: ProvenanceCellKey): { sheetId: string; x: number; y: number } | null {
  const parts = key.split(':');
  if (parts.length < 3) return null;
  const sheetId = parts.slice(0, -2).join(':');
  const x = parseInt(parts[parts.length - 2], 10);
  const y = parseInt(parts[parts.length - 1], 10);
  if (isNaN(x) || isNaN(y)) return null;
  return { sheetId, x, y };
}
