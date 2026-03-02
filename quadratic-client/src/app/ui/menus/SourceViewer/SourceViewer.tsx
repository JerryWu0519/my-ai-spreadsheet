/**
 * Deep-Traceability: Source Viewer side panel.
 *
 * Embeds the actual source document (annual report, SEC filing, etc.) inside
 * the panel using the /v0/fetch-url proxy.  Highlights the relevant text
 * excerpt (text_anchor / sourceSnippet) so the user can see exactly where
 * the data came from in the original document.
 *
 * Design:  ⌘+Click a sourced cell → panel opens → loads the document.
 */

import { sourceViewerCellAtom, sourceViewerOpenAtom, sourceViewerProvenanceAtom } from '@/app/atoms/sourceViewerAtom';
import { focusGrid } from '@/app/helpers/focusGrid';
import type { Provenance } from '@/app/provenance/provenanceTypes';
import { provenanceStore } from '@/app/provenance/provenanceStore';
import { useProvenanceSync } from '@/app/provenance/useProvenanceSync';
import { Favicon } from '@/shared/components/Favicon';
import { CloseIcon } from '@/shared/components/Icons';
import { Button } from '@/shared/shadcn/ui/button';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

// ---- Helpers ----

/**
 * Build the list of search terms the in-iframe script should look for
 * in the rendered DOM text content. We try multiple number scales
 * (raw, thousands, millions, billions) because SEC filings typically
 * report numbers in millions.
 */
function buildSearchTerms(cellValue?: string, cellLabel?: string): string[] {
  const terms: string[] = [];
  if (!cellValue) return terms;

  const raw = String(cellValue)
    .replace(/[$,\s]/g, '')
    .trim();

  // Non-numeric → just search for the text itself
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    if (raw.length > 3) terms.push(raw);
    return terms;
  }

  const num = parseFloat(raw);
  if (isNaN(num) || num === 0) return terms;

  const withCommas = (n: number) => {
    const parts = n.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const scales = [1, 1000, 1_000_000, 1_000_000_000];
  for (const div of scales) {
    const scaled = num / div;
    if (scaled >= 1 && (scaled === Math.floor(scaled) || Math.abs(scaled - Math.round(scaled * 100) / 100) < 0.001)) {
      const rounded = Math.round(scaled * 100) / 100;
      const formatted = withCommas(rounded);
      // Skip very short numbers from scaled results to avoid false positives
      if (formatted.length < 4 && div > 1) continue;
      terms.push(formatted);
      // Also add without commas if different
      const noCommas = rounded.toString();
      if (noCommas !== formatted && noCommas.length >= 4) terms.push(noCommas);
    }
  }

  // Add label as a secondary search term
  if (cellLabel && cellLabel.length > 2) terms.push(cellLabel);

  return terms;
}

/**
 * Build a <script> that runs inside the iframe AFTER the document loads.
 * It uses TreeWalker to find text nodes containing the search terms,
 * wraps the first match in a <mark> element, and scrolls to it.
 * This is much more reliable than regex on raw HTML because:
 *   - The DOM decodes HTML entities (&#160; → actual nbsp)
 *   - TreeWalker skips inside tags, style, script etc.
 *   - Works with XBRL <ix:nonFraction> wrappers
 */
function buildFinderScript(searchTerms: string[], highlightTexts: string[]): string {
  // Combine: value-based terms first, then text anchors
  const allTerms = [...searchTerms, ...highlightTexts.filter((t) => t && t.length > 10).map((t) => t.slice(0, 80))];

  if (allTerms.length === 0) return '';

  // Escape for embedding in a JS string inside HTML
  const termsJson = JSON.stringify(allTerms);

  return `
<script>
(function() {
  var terms = ${termsJson};
  var MARK_STYLE = 'background:#fde047;padding:2px 4px;border-radius:3px;scroll-margin-top:120px;';
  var found = false;

  function tryHighlight() {
    if (found) return;
    var tw = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    // Try each term in priority order
    for (var ti = 0; ti < terms.length; ti++) {
      var term = terms[ti];
      tw.currentNode = document.body;
      var node;
      while ((node = tw.nextNode())) {
        var idx = node.textContent.indexOf(term);
        if (idx === -1) {
          // Try case-insensitive for labels / text anchors
          idx = node.textContent.toLowerCase().indexOf(term.toLowerCase());
        }
        if (idx !== -1) {
          // Skip nodes inside <style>, <script>, <head>
          var parent = node.parentElement;
          if (!parent) continue;
          var tag = parent.tagName;
          if (tag === 'STYLE' || tag === 'SCRIPT' || tag === 'HEAD') continue;

          // Split the text node and wrap the match
          var range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + term.length);
          var mark = document.createElement('mark');
          mark.setAttribute('style', MARK_STYLE);
          mark.id = 'qd-highlight';
          range.surroundContents(mark);

          // Scroll to it
          setTimeout(function() {
            var el = document.getElementById('qd-highlight');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Pulse animation
              el.style.transition = 'background 0.3s';
              setTimeout(function() { el.style.background = '#facc15'; }, 800);
              setTimeout(function() { el.style.background = '#fde047'; }, 1200);
              setTimeout(function() { el.style.background = '#facc15'; }, 1600);
              setTimeout(function() { el.style.background = '#fde047'; }, 2000);
            }
          }, 100);

          found = true;
          console.log('[QD] Highlighted term: ' + term);
          return;
        }
      }
    }
    console.log('[QD] No matching term found in document text');
  }

  // Try multiple times — large documents need time to render
  if (document.readyState === 'complete') {
    tryHighlight();
  } else {
    window.addEventListener('load', function() {
      setTimeout(tryHighlight, 200);
    });
  }
  // Also retry after delays for very large documents
  setTimeout(tryHighlight, 1500);
  setTimeout(tryHighlight, 4000);
})();
</script>`;
}

// ---- Main Source Viewer Component ----

export const SourceViewer = memo(() => {
  useProvenanceSync();

  const [open, setOpen] = useRecoilState(sourceViewerOpenAtom);
  const provenance = useRecoilValue(sourceViewerProvenanceAtom);
  const cell = useRecoilValue(sourceViewerCellAtom);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(520);
  const [verified, setVerified] = useState(false);

  // Which source tab is active (index into allSourceUrls)
  const [activeSourceIdx, setActiveSourceIdx] = useState(0);
  // Document loading state
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  // Cache raw HTML so we don't re-fetch when only the cell changes
  const rawHtmlCache = useRef<{ url: string; html: string; resolvedUrl: string } | null>(null);

  // Extract source URLs from provenance
  const allSourceUrls = useMemo<Array<{ title: string; uri: string }>>(
    () =>
      provenance
        ? (provenance as any)._allSourceUrls ||
          (provenance.sourceUrl ? [{ title: provenance.fileName, uri: provenance.sourceUrl }] : [])
        : [],
    [provenance]
  );

  // Text to highlight in the document
  const highlightTexts = useMemo(() => {
    const texts: string[] = [];
    if (provenance?.sourceSnippet) texts.push(provenance.sourceSnippet);
    const locCtx = provenance?.location as any;
    if (locCtx?.textAnchor) texts.push(locCtx.textAnchor);
    const gs: Array<{ segment: { text: string } }> = (provenance as any)?._groundingSupports || [];
    for (const g of gs) {
      if (g.segment?.text) texts.push(g.segment.text);
    }
    return texts;
  }, [provenance]);

  // Search terms derived from the cell value (multi-scale number matching)
  const searchTerms = useMemo(
    () => buildSearchTerms(provenance?.location?.cellValue, provenance?.location?.cellLabel),
    [provenance]
  );

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  // Reset verified badge when a different cell is selected
  useEffect(() => {
    setVerified(false);
  }, [cell]);

  // Keyboard handler: Enter = confirm (remove yellow dot), Delete/Backspace = override (remove + edit cell)
  useEffect(() => {
    if (!open || !cell) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Confirm: accept the value, remove provenance → yellow dot disappears
        provenanceStore.delete(cell.sheetId, cell.x, cell.y);
        setVerified(true);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        // Override: remove provenance and close viewer so user can edit the cell
        provenanceStore.delete(cell.sheetId, cell.x, cell.y);
        setOpen(false);
        // Return focus to the grid so the user can immediately type a new value
        setTimeout(() => focusGrid(), 50);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, cell, setOpen]);

  // Debug: log provenance to help diagnose issues
  useEffect(() => {
    if (provenance) {
      console.log('[SourceViewer] provenance:', provenance);
      console.log('[SourceViewer] cellValue:', provenance?.location?.cellValue);
      console.log('[SourceViewer] cellLabel:', provenance?.location?.cellLabel);
      console.log('[SourceViewer] searchTerms:', searchTerms);
      console.log('[SourceViewer] allSourceUrls:', allSourceUrls);
    }
  }, [provenance, allSourceUrls, searchTerms]);

  // Build the final HTML for the iframe (raw HTML + base tag + finder script)
  const buildIframeHtml = useCallback(
    (rawHtml: string, finalUrl: string) => {
      let html = rawHtml;

      // Inject base tag so relative URLs resolve correctly
      let baseUrl = '';
      try {
        baseUrl = new URL(finalUrl).origin;
      } catch {
        /* ignore */
      }
      const baseTag = `<base href="${baseUrl}" />`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else {
        html = baseTag + html;
      }

      // Inject the finder script
      html += buildFinderScript(searchTerms, highlightTexts);

      return html;
    },
    [searchTerms, highlightTexts]
  );

  // Fetch the document when source URL changes
  const activeUrl = allSourceUrls[activeSourceIdx]?.uri;
  useEffect(() => {
    if (!activeUrl) {
      setDocHtml(null);
      setDocError(null);
      return;
    }

    // If we already have this URL cached, just re-inject the finder script
    if (rawHtmlCache.current && rawHtmlCache.current.url === activeUrl) {
      console.log('[SourceViewer] Using cached HTML, re-injecting finder script');
      setResolvedUrl(rawHtmlCache.current.resolvedUrl);
      setDocHtml(buildIframeHtml(rawHtmlCache.current.html, rawHtmlCache.current.resolvedUrl));
      setDocLoading(false);
      setDocError(null);
      return;
    }

    let cancelled = false;
    setDocLoading(true);
    setDocError(null);
    setDocHtml(null);
    setResolvedUrl(null);

    const proxyUrl = `/mock-api/v0/fetch-url?url=${encodeURIComponent(activeUrl)}`;
    fetch(proxyUrl)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          if (data.resolvedUrl) setResolvedUrl(data.resolvedUrl);
          setDocError(`${data.error}${data.url ? ` (${data.url})` : ''}`);
          setDocLoading(false);
          return;
        }
        const finalUrl = data.resolvedUrl || activeUrl;
        const rawHtml = data.html || '';

        // Cache the raw HTML
        rawHtmlCache.current = { url: activeUrl, html: rawHtml, resolvedUrl: finalUrl };

        setResolvedUrl(finalUrl);
        setDocHtml(buildIframeHtml(rawHtml, finalUrl));
        setDocLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setDocError(String(err));
        setDocLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeUrl, buildIframeHtml]);

  // When searchTerms or highlightTexts change (user clicks a different cell)
  // but the URL is the same, re-inject the finder script from cache
  useEffect(() => {
    if (rawHtmlCache.current && rawHtmlCache.current.url === activeUrl && !docLoading && !docError) {
      console.log('[SourceViewer] Cell changed, re-injecting finder script');
      setDocHtml(buildIframeHtml(rawHtmlCache.current.html, rawHtmlCache.current.resolvedUrl));
    }
  }, [searchTerms, highlightTexts, activeUrl, docLoading, docError, buildIframeHtml]);

  // Reset active source when provenance changes
  useEffect(() => {
    setActiveSourceIdx(0);
  }, [provenance]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;
    const onMove = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      const rect = panel.getBoundingClientRect();
      setPanelWidth(Math.min(Math.max(360, rect.right - ev.clientX), 900));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="relative flex h-full shrink-0 flex-col border-l border-border bg-background"
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-primary/20"
        onMouseDown={handleResizeStart}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">
            {activeUrl?.includes('sec.gov') ? '📋 Official Filing (10-K)' : 'Source Document'}
          </h3>
          {allSourceUrls[activeSourceIdx]?.title && (
            <div className="truncate text-[10px] text-muted-foreground">{allSourceUrls[activeSourceIdx].title}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(resolvedUrl || activeUrl) && (
            <a href={resolvedUrl || activeUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]">
                ↗ Open
              </Button>
            </a>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleClose}>
            <CloseIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!provenance ? (
        <EmptyState />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Source tabs — when multiple sources */}
          {allSourceUrls.length > 1 && (
            <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
              {allSourceUrls.map((src, i) => {
                const isSEC = src.uri?.includes('sec.gov');
                return (
                  <button
                    key={i}
                    onClick={() => setActiveSourceIdx(i)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] transition-colors ${
                      i === activeSourceIdx
                        ? isSEC
                          ? 'bg-blue-100 font-semibold text-blue-900 ring-1 ring-blue-300'
                          : 'bg-yellow-100 font-semibold text-yellow-900'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {isSEC ? (
                      <span className="shrink-0 text-[10px]">🏛️</span>
                    ) : (
                      <Favicon domain={src.uri} size={12} alt={src.title} className="shrink-0" />
                    )}
                    <span className="max-w-[140px] truncate">{isSEC ? 'SEC 10-K Filing' : src.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Source excerpt / cell value locator */}
          {(highlightTexts.length > 0 || provenance?.location?.cellValue) && (
            <div className="border-b border-border bg-yellow-50 px-3 py-2">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-yellow-700">
                {activeUrl?.includes('sec.gov') ? '🔍 Locating Value In Filing' : 'Data Located In Document'}
              </div>
              {provenance?.location?.cellValue && (
                <div className="mb-1 flex items-center gap-2 text-[11px]">
                  {provenance.location.cellLabel && (
                    <span className="font-medium text-yellow-800">{provenance.location.cellLabel}:</span>
                  )}
                  <span className="rounded bg-yellow-200/60 px-1.5 py-0.5 font-mono font-semibold text-yellow-900">
                    {provenance.location.cellValue}
                  </span>
                </div>
              )}
              {highlightTexts.length > 0 && highlightTexts[0] !== provenance?.location?.cellValue && (
                <div className="text-[10px] leading-relaxed text-yellow-800">&ldquo;{highlightTexts[0]}&rdquo;</div>
              )}
            </div>
          )}

          {/* Confirm / Override action bar */}
          {cell && !verified && provenanceStore.has(cell.sheetId, cell.x, cell.y) && (
            <div className="flex items-center justify-between border-b border-border bg-blue-50 px-3 py-2">
              <span className="text-[11px] font-medium text-blue-800">Is this value correct?</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-blue-700">↵ Enter</span>
                <span className="text-blue-600">Confirm</span>
                <span className="text-blue-300">|</span>
                <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-red-700">⌫ Delete</span>
                <span className="text-red-600">Override</span>
              </div>
            </div>
          )}

          {/* Verified confirmation badge */}
          {verified && (
            <div className="flex items-center gap-2 border-b border-border bg-green-50 px-3 py-2">
              <span className="text-sm">✓</span>
              <span className="text-[11px] font-medium text-green-800">
                Value confirmed — source verified and cell is now editable.
              </span>
            </div>
          )}

          {/* Document viewer */}
          <div className="flex-1 overflow-hidden">
            {allSourceUrls.length === 0 ? (
              <NoUrlState provenance={provenance} />
            ) : docLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-2xl">⏳</div>
                  <div className="text-xs text-muted-foreground">Loading source document...</div>
                  <div className="mt-1 truncate text-[10px] text-muted-foreground/60">{activeUrl}</div>
                </div>
              </div>
            ) : docError ? (
              <ErrorState
                docError={docError}
                resolvedUrl={resolvedUrl}
                activeUrl={activeUrl}
                sourceSnippet={provenance.sourceSnippet}
              />
            ) : docHtml ? (
              <iframe
                srcDoc={docHtml}
                sandbox="allow-same-origin allow-scripts"
                title="Source Document"
                className="h-full w-full border-0"
              />
            ) : null}
          </div>

          {/* Bottom bar: raw provenance debug */}
          <div className="border-t border-border px-3 py-1.5">
            <details className="text-xs">
              <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground">
                Provenance details
              </summary>
              <pre className="mt-1 max-h-28 overflow-auto rounded bg-muted p-1.5 text-[9px]">
                {JSON.stringify(provenance, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
});

// ---- Helper components ----

/** Safely extract hostname from a URL string */
function safeHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const ErrorState = memo(
  ({
    docError,
    resolvedUrl,
    activeUrl,
    sourceSnippet,
  }: {
    docError: string;
    resolvedUrl: string | null;
    activeUrl: string | undefined;
    sourceSnippet: string | undefined;
  }) => {
    const openUrl = resolvedUrl || activeUrl;
    const hostname = safeHostname(resolvedUrl) || safeHostname(activeUrl);
    const is403 = docError.includes('403');
    const isTimeout = docError.toLowerCase().includes('timeout') || docError.toLowerCase().includes('abort');

    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <div className="text-center">
          <div className="mb-2 text-2xl">{is403 ? '🔒' : isTimeout ? '⏱️' : '⚠️'}</div>
          <div className="text-xs font-medium">
            {is403
              ? `${hostname || 'This site'} blocked inline loading`
              : isTimeout
                ? 'Request timed out'
                : 'Could not load the document inline'}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {is403
              ? 'Some sites prevent server-side fetching. Click below to view in your browser.'
              : isTimeout
                ? 'The source site took too long to respond.'
                : docError}
          </div>
        </div>
        {openUrl && (
          <a href={openUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              Open {hostname || 'Source'} in New Tab ↗
            </Button>
          </a>
        )}
        {sourceSnippet && (
          <div className="mt-2 w-full rounded border border-yellow-200 bg-yellow-50/50 p-2.5 text-xs text-yellow-900">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-yellow-700">Source Excerpt</div>
            &ldquo;{sourceSnippet}&rdquo;
          </div>
        )}
      </div>
    );
  }
);

const EmptyState = memo(() => (
  <div className="flex h-full items-center justify-center p-6 text-center">
    <div>
      <div className="mb-2 text-3xl opacity-30">📄</div>
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold">⌘ + Click</span> on a sourced cell to view its origin document.
      </div>
      <div className="mt-1 text-xs text-muted-foreground/60">
        Cells with provenance data are highlighted with a yellow dot.
      </div>
    </div>
  </div>
));

const NoUrlState = memo(({ provenance }: { provenance: Provenance }) => (
  <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
    <div className="text-2xl opacity-40">📝</div>
    <div className="text-sm font-medium">{provenance.fileName}</div>
    <div className="text-xs text-muted-foreground">Source: {provenance.extractedBy}</div>
    {provenance.sourceSnippet && (
      <div className="mt-2 w-full rounded border border-yellow-200 bg-yellow-50/50 p-2.5 text-xs text-yellow-900">
        &ldquo;{provenance.sourceSnippet}&rdquo;
      </div>
    )}
  </div>
));
