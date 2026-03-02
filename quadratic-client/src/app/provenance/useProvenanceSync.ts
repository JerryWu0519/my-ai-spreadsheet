/**
 * Deep-Traceability: Hook that listens to cell selection changes
 * and updates the Source Viewer provenance atom (but does NOT auto-open the panel).
 * The panel is opened by ⌘+Click from ProvenanceIndicators.
 */

import { sourceViewerProvenanceAtom } from '@/app/atoms/sourceViewerAtom';
import { events } from '@/app/events/events';
import { sheets } from '@/app/grid/controller/Sheets';
import { provenanceStore } from '@/app/provenance/provenanceStore';
import { useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';

/**
 * Selection-driven sync: When the user selects a cell, update the
 * provenance atom so the Source Viewer shows the right context
 * (if the panel is already open). Does NOT auto-open the panel.
 */
export function useProvenanceSync() {
  const setProvenance = useSetRecoilState(sourceViewerProvenanceAtom);
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
  }, [setProvenance]);
}
