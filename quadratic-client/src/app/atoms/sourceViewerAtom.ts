/**
 * Deep-Traceability: Recoil atoms for the Source Viewer panel.
 */

import type { Provenance } from '@/app/provenance/provenanceTypes';
import { atom } from 'recoil';

/** Whether the Source Viewer panel is open */
export const sourceViewerOpenAtom = atom<boolean>({
  key: 'sourceViewerOpen',
  default: false,
});

/** The currently-active provenance object (driven by cell selection) */
export const sourceViewerProvenanceAtom = atom<Provenance | null>({
  key: 'sourceViewerProvenance',
  default: null,
});

/** Loading state for the source file */
export const sourceViewerLoadingAtom = atom<boolean>({
  key: 'sourceViewerLoading',
  default: false,
});

/** The cell coordinates that the Source Viewer is currently showing provenance for */
export const sourceViewerCellAtom = atom<{ sheetId: string; x: number; y: number } | null>({
  key: 'sourceViewerCell',
  default: null,
});
