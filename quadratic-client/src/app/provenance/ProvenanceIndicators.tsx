/**
 * Deep-Traceability: Provenance cell indicators (hover-based UX).
 *
 * - Cells with provenance show a small yellow dot in the top-right corner
 * - On hover: cell gets a yellow tint overlay + tooltip "⌘ + Click to see context"
 * - ⌘+Click (or Ctrl+Click on Windows) opens the Source Viewer panel
 */

import { sourceViewerCellAtom, sourceViewerOpenAtom, sourceViewerProvenanceAtom } from '@/app/atoms/sourceViewerAtom';
import { events } from '@/app/events/events';
import { sheets } from '@/app/grid/controller/Sheets';
import { pixiApp } from '@/app/gridGL/pixiApp/PixiApp';
import { provenanceStore } from '@/app/provenance/provenanceStore';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';

interface CellRect {
  key: string;
  screenX: number;
  screenY: number;
  width: number;
  height: number;
  cellX: number;
  cellY: number;
  sheetId: string;
}

export const ProvenanceIndicators = memo(() => {
  const [cells, setCells] = useState<CellRect[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const setOpen = useSetRecoilState(sourceViewerOpenAtom);
  const setProvenance = useSetRecoilState(sourceViewerProvenanceAtom);
  const setCell = useSetRecoilState(sourceViewerCellAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCells = useCallback(() => {
    try {
      const sheetId = sheets.current;
      const entries = provenanceStore.getForSheet(sheetId);
      if (entries.length === 0) {
        setCells([]);
        return;
      }

      const viewport = pixiApp.viewport;
      const bounds = viewport.getVisibleBounds();
      const sheet = sheets.sheet;

      const visible: CellRect[] = [];
      for (const entry of entries) {
        const offsets = sheet.getCellOffsets(entry.x, entry.y);
        if (
          offsets.x + offsets.width < bounds.left ||
          offsets.x > bounds.right ||
          offsets.y + offsets.height < bounds.top ||
          offsets.y > bounds.bottom
        ) {
          continue;
        }

        const screenPos = viewport.toScreen(offsets.x, offsets.y);
        const screenEnd = viewport.toScreen(offsets.x + offsets.width, offsets.y + offsets.height);

        visible.push({
          key: `${sheetId}:${entry.x}:${entry.y}`,
          screenX: screenPos.x,
          screenY: screenPos.y,
          width: screenEnd.x - screenPos.x,
          height: screenEnd.y - screenPos.y,
          cellX: entry.x,
          cellY: entry.y,
          sheetId,
        });
      }

      setCells(visible);
    } catch {
      // sheets may not be ready yet
    }
  }, []);

  useEffect(() => {
    updateCells();
    events.on('viewportChangedReady', updateCells);
    events.on('cursorPosition', updateCells);
    events.on('changeSheet', updateCells);
    events.on('provenanceChanged', updateCells);

    return () => {
      events.off('viewportChangedReady', updateCells);
      events.off('cursorPosition', updateCells);
      events.off('changeSheet', updateCells);
      events.off('provenanceChanged', updateCells);
    };
  }, [updateCells]);

  const handleMouseEnter = useCallback((cell: CellRect, e: React.MouseEvent) => {
    setHoveredKey(cell.key);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((_cell: CellRect, e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredKey(null);
    setTooltipPos(null);
  }, []);

  const handleClick = useCallback(
    (cell: CellRect, e: React.MouseEvent) => {
      // ⌘+Click (Mac) or Ctrl+Click (Windows/Linux) to open Source Viewer
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        const prov = provenanceStore.get(cell.sheetId, cell.cellX, cell.cellY);
        if (prov) {
          setProvenance(prov);
          setCell({ sheetId: cell.sheetId, x: cell.cellX, y: cell.cellY });
          setOpen(true);
          events.emit('provenanceSelected', prov);
        }
      }
    },
    [setOpen, setProvenance, setCell]
  );

  if (cells.length === 0) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-[5]">
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="pointer-events-auto absolute cursor-pointer"
          style={{
            left: `${cell.screenX}px`,
            top: `${cell.screenY}px`,
            width: `${cell.width}px`,
            height: `${cell.height}px`,
          }}
          onMouseEnter={(e) => handleMouseEnter(cell, e)}
          onMouseMove={(e) => handleMouseMove(cell, e)}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => handleClick(cell, e)}
        >
          {/* Small yellow dot — always visible */}
          <div className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-yellow-400 opacity-60" />

          {/* Hover overlay — yellow tint on the entire cell */}
          {hoveredKey === cell.key && (
            <div className="absolute inset-0 rounded-sm border border-yellow-400 bg-yellow-300/20" />
          )}
        </div>
      ))}

      {/* Floating tooltip that follows the mouse on hovered cell */}
      {hoveredKey && tooltipPos && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{
            left: `${tooltipPos.x + 12}px`,
            top: `${tooltipPos.y - 32}px`,
          }}
        >
          <span className="font-medium">⌘ + Click</span>
          <span className="ml-1 text-gray-300">to see data context</span>
        </div>
      )}
    </div>
  );
});
