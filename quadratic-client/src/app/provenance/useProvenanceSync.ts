/**
 * Deep-Traceability: Hook that listens to cell selection changes
 * and updates the Source Viewer provenance atom.
 *
 * For cells with ORIGINAL DATA (has sourceUrl + cellValue), the SourceViewer
 * auto-opens so the user can see and verify the value in context.
 * The panel can also be opened manually via ⌘+Click from ProvenanceIndicators.
 */

import { sourceViewerCellAtom, sourceViewerOpenAtom, sourceViewerProvenanceAtom } from '@/app/atoms/sourceViewerAtom';
import { events } from '@/app/events/events';
import { sheets } from '@/app/grid/controller/Sheets';
import { provenanceStore } from '@/app/provenance/provenanceStore';
import { useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';

/**
 * Selection-driven sync: When the user selects a cell, update the
 * provenance atom so the Source Viewer shows the right context.
 *
 * For original data cells (those with a sourceUrl and a numeric cellValue),
 * automatically open the SourceViewer panel so the user can verify the value
 * in the source document (Enter to confirm, Delete to override).
 */
export function useProvenanceSync() {
  const setProvenance = useSetRecoilState(sourceViewerProvenanceAtom);
  const setOpen = useSetRecoilState(sourceViewerOpenAtom);
  const setCell = useSetRecoilState(sourceViewerCellAtom);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const handleCursorPosition = () => {
      try {
        const sheetId = sheets.current;
        const pos = sheets.sheet.cursor.position;
        const key = `${sheetId}:${pos.x}:${pos.y}`;

        // Skip if cursor hasn't actually moved to a new cell
        if (key === lastKeyRef.current) return;
        lastKeyRef.current = key;

        const provenance = provenanceStore.get(sheetId, pos.x, pos.y);

        if (provenance) {
          setProvenance(provenance);

          // Auto-open SourceViewer for original data cells:
          // A cell is "original data" if it has a sourceUrl and a cellValue.
          // This ensures the auto-location feature is always turned on for data cells.
          const hasSourceUrl = !!provenance.sourceUrl;
          const hasCellValue = !!provenance.location?.cellValue;
          if (hasSourceUrl && hasCellValue) {
            setCell({ sheetId, x: pos.x, y: pos.y });
            setOpen(true);
          }

          events.emit('provenanceSelected', provenance);
        } else {
          setProvenance(null);
          events.emit('provenanceSelected', null);
        }
      } catch {
        // sheets may not be initialized yet
      }
    };

    events.on('cursorPosition', handleCursorPosition);
    events.on('changeSheet', handleCursorPosition);
    events.on('clickedToCell', handleCursorPosition);

    return () => {
      events.off('cursorPosition', handleCursorPosition);
      events.off('changeSheet', handleCursorPosition);
      events.off('clickedToCell', handleCursorPosition);
    };
  }, [setProvenance, setOpen, setCell]);
}
