import { events } from '@/app/events/events';
import { sheets } from '@/app/grid/controller/Sheets';
import { quadraticCore } from '@/app/web-workers/quadraticCore/quadraticCore';
import { FunctionIcon } from '@/shared/components/Icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Excel-style formula bar that displays the raw content of the active cell.
 *
 * - For formula cells it shows "=B2/B3" (the formula source text).
 * - For regular value cells it shows the underlying value (e.g. "119013000000").
 * - For empty cells it shows nothing.
 *
 * The bar sits between the CursorPosition box and the FormattingBar,
 * inside the Toolbar row, just like Excel / Google Sheets.
 */
export const FormulaBar = memo(() => {
  const [cellContent, setCellContent] = useState('');
  const [isFormula, setIsFormula] = useState(false);
  const isMounted = useRef(true);

  const updateContent = useCallback(async () => {
    try {
      const cursor = sheets.sheet.cursor;
      const { x, y } = cursor.position;
      const sheetId = sheets.sheet.id;

      // 1. Check if the cell is a formula / code cell
      const codeCell = await quadraticCore.getCodeCell(sheetId, x, y);
      if (!isMounted.current) return;

      if (codeCell?.language === 'Formula') {
        setCellContent('=' + codeCell.code_string);
        setIsFormula(true);
        return;
      }

      // 2. Otherwise get the raw cell value
      const cellValue = await quadraticCore.getCellValue(sheetId, x, y);
      if (!isMounted.current) return;

      if (cellValue) {
        setCellContent(cellValue.value);
        setIsFormula(false);
      } else {
        setCellContent('');
        setIsFormula(false);
      }
    } catch {
      // Silently handle any errors (e.g. sheet not yet loaded)
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    updateContent();

    events.on('cursorPosition', updateContent);
    events.on('changeSheet', updateContent);
    // Also refresh after cell content changes (edits, AI writes, etc.)
    events.on('hashContentChanged', updateContent);

    return () => {
      isMounted.current = false;
      events.off('cursorPosition', updateContent);
      events.off('changeSheet', updateContent);
      events.off('hashContentChanged', updateContent);
    };
  }, [updateContent]);

  return (
    <div className="flex h-full min-w-0 flex-1 items-center gap-1.5 border-r border-border px-2">
      {/* fx icon — subtle indicator like Excel */}
      <span className="flex-shrink-0 text-muted-foreground" title="Formula Bar">
        <FunctionIcon style={{ fontSize: 16 }} />
      </span>

      {/* Cell content display */}
      <div
        className={`min-w-0 flex-1 truncate text-sm leading-none ${isFormula ? 'font-mono text-blue-600' : ''}`}
        title={cellContent}
      >
        {cellContent}
      </div>
    </div>
  );
});
