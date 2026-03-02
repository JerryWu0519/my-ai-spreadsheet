import { editorInteractionStatePermissionsAtom } from '@/app/atoms/editorInteractionStateAtom';
import { CursorPosition } from '@/app/ui/menus/Toolbar/CursorPosition';
import { FormulaBar } from '@/app/ui/menus/Toolbar/FormulaBar';
import { FormattingBar } from '@/app/ui/menus/Toolbar/FormattingBar/FormattingBar';
import { SourceViewerToggle } from '@/app/ui/menus/Toolbar/SourceViewerToggle';
import { ZoomMenu } from '@/app/ui/menus/Toolbar/ZoomMenu';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';

export const Toolbar = memo(() => {
  const permissions = useRecoilValue(editorInteractionStatePermissionsAtom);
  const canEdit = permissions.includes('FILE_EDIT');

  return (
    <div className="pointer-up-ignore hidden select-none border-b border-border md:flex md:flex-col">
      {/* Row 1: Cell reference + Formatting buttons + Zoom */}
      <div className="flex h-10 justify-between">
        <div className="w-48 flex-shrink-0 border-r border-border xl:w-64 2xl:w-80">
          <CursorPosition />
        </div>

        <div className="no-scrollbar flex flex-1 items-center justify-center overflow-y-hidden overflow-x-scroll">
          {canEdit && <FormattingBar />}
        </div>

        <div className="flex items-center justify-end gap-1 xl:w-64 2xl:w-80">
          <SourceViewerToggle />
          <ZoomMenu />
        </div>
      </div>

      {/* Row 2: Formula bar — shows cell formula or value, like Excel */}
      <div className="flex h-7 items-center border-t border-border">
        <FormulaBar />
      </div>
    </div>
  );
});
