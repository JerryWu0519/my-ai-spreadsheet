/**
 * Deep-Traceability: In-memory provenance metadata store.
 *
 * This singleton stores Provenance objects keyed by cell coordinates.
 * It is intentionally decoupled from the Rust/WASM layer to avoid
 * serialization overhead on the critical path. Provenance is populated
 * by AI tool actions and can be persisted / hydrated separately.
 */

import { events } from '@/app/events/events';
import { makeProvenanceCellKey, type Provenance, type ProvenanceCellKey } from '@/app/provenance/provenanceTypes';

class ProvenanceStore {
  private store = new Map<ProvenanceCellKey, Provenance>();

  /** Registered source files (fileId → Blob / URL) for the viewer */
  private fileCache = new Map<string, { blob?: Blob; url?: string; fileName: string }>();

  // ---- Cell provenance CRUD ----

  set(sheetId: string, x: number, y: number, provenance: Provenance): void {
    const key = makeProvenanceCellKey(sheetId, x, y);
    this.store.set(key, provenance);
    events.emit('provenanceChanged', key);
  }

  get(sheetId: string, x: number, y: number): Provenance | undefined {
    return this.store.get(makeProvenanceCellKey(sheetId, x, y));
  }

  has(sheetId: string, x: number, y: number): boolean {
    return this.store.has(makeProvenanceCellKey(sheetId, x, y));
  }

  delete(sheetId: string, x: number, y: number): boolean {
    const key = makeProvenanceCellKey(sheetId, x, y);
    const deleted = this.store.delete(key);
    if (deleted) events.emit('provenanceChanged', key);
    return deleted;
  }

  /**
   * Batch-set provenance for a rectangular range of cells that share the
   * same source. This is common for data tables or CSV imports.
   */
  setRange(
    sheetId: string,
    startX: number,
    startY: number,
    values: string[][],
    baseProvenance: Omit<Provenance, 'location'>,
    locationFactory: (row: number, col: number) => Provenance['location']
  ): void {
    for (let row = 0; row < values.length; row++) {
      for (let col = 0; col < (values[row]?.length ?? 0); col++) {
        const prov: Provenance = {
          ...baseProvenance,
          location: locationFactory(row, col),
        };
        this.set(sheetId, startX + col, startY + row, prov);
      }
    }
  }

  /** Get all provenance entries for a sheet */
  getForSheet(sheetId: string): Array<{ x: number; y: number; provenance: Provenance }> {
    const results: Array<{ x: number; y: number; provenance: Provenance }> = [];
    for (const [key, prov] of this.store) {
      if (key.startsWith(sheetId + ':')) {
        const parts = key.split(':');
        const x = parseInt(parts[parts.length - 2], 10);
        const y = parseInt(parts[parts.length - 1], 10);
        results.push({ x, y, provenance: prov });
      }
    }
    return results;
  }

  /** Clear all provenance data */
  clear(): void {
    this.store.clear();
    this.fileCache.clear();
  }

  /** Number of tracked cells */
  get size(): number {
    return this.store.size;
  }

  // ---- File cache ----

  registerFile(fileId: string, fileName: string, options?: { blob?: Blob; url?: string }): void {
    this.fileCache.set(fileId, {
      blob: options?.blob,
      url: options?.url,
      fileName,
    });
  }

  getFile(fileId: string): { blob?: Blob; url?: string; fileName: string } | undefined {
    return this.fileCache.get(fileId);
  }

  // ---- Serialization (for future persistence) ----

  toJSON(): Record<string, Provenance> {
    const obj: Record<string, Provenance> = {};
    for (const [key, prov] of this.store) {
      obj[key] = prov;
    }
    return obj;
  }

  fromJSON(data: Record<string, Provenance>): void {
    this.store.clear();
    for (const [key, prov] of Object.entries(data)) {
      this.store.set(key, prov);
    }
  }
}

/** Singleton instance */
export const provenanceStore = new ProvenanceStore();
