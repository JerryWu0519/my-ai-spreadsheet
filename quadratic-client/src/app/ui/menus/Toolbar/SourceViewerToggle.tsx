/**
 * Deep-Traceability: Toggle button for the Source Viewer panel.
 */

import { sourceViewerOpenAtom, sourceViewerProvenanceAtom } from '@/app/atoms/sourceViewerAtom';
import { provenanceStore } from '@/app/provenance/provenanceStore';
import { Button } from '@/shared/shadcn/ui/button';
import { TooltipPopover } from '@/shared/shadcn/ui/tooltip';
import { cn } from '@/shared/shadcn/utils';
import { memo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

export const SourceViewerToggle = memo(() => {
  const [open, setOpen] = useRecoilState(sourceViewerOpenAtom);
  const provenance = useRecoilValue(sourceViewerProvenanceAtom);
  const hasAnyProvenance = provenanceStore.size > 0;

  return (
    <TooltipPopover label={open ? 'Hide Source Viewer' : 'Show Source Viewer'}>
      <Button
        variant="ghost"
        size="sm"
        className={cn('relative h-7 gap-1 px-2 text-xs', open && 'bg-accent', provenance && 'text-yellow-600')}
        onClick={() => setOpen(!open)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="hidden xl:inline">Source</span>
        {hasAnyProvenance && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400" />}
      </Button>
    </TooltipPopover>
  );
});
