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
 *
 * Returns { valueTerms, labelTerms } so the finder script can do
 * CONTEXT-AWARE search: first find the label, then find the value
 * NEAR the label (same table row or nearby).
 *
 * filingLabel takes PRIORITY over cellLabel — it's the exact text
 * from the SEC filing (e.g. "Operating income") rather than the
 * spreadsheet label (e.g. "EBIT").
 */
interface SearchTerms {
  valueTerms: string[];
  labelTerms: string[];
  evidenceSnippet?: string;
}

function buildSearchTerms(
  cellValue?: string,
  cellLabel?: string,
  filingLabel?: string,
  evidenceSnippet?: string
): SearchTerms {
  const valueTerms: string[] = [];
  const labelTerms: string[] = [];

  // Filing label is the PRIMARY label — it's what actually appears in the document
  if (filingLabel && filingLabel.length > 2) {
    labelTerms.push(filingLabel);
    // Case variation
    const lower = filingLabel.charAt(0) + filingLabel.slice(1).toLowerCase();
    if (lower !== filingLabel && !labelTerms.includes(lower)) labelTerms.push(lower);
    // Also try all-lowercase
    const allLower = filingLabel.toLowerCase();
    if (!labelTerms.includes(allLower)) labelTerms.push(allLower);
  }

  // Cell label as SECONDARY (fallback if filing label not provided)
  if (cellLabel && cellLabel.length > 2) {
    // Only add if it's different from filing label
    if (!filingLabel || cellLabel.toLowerCase() !== filingLabel.toLowerCase()) {
      labelTerms.push(cellLabel);
      const lower = cellLabel.charAt(0) + cellLabel.slice(1).toLowerCase();
      if (lower !== cellLabel && !labelTerms.includes(lower)) labelTerms.push(lower);
    }
  }

  if (!cellValue) {
    return { valueTerms, labelTerms };
  }

  const raw = String(cellValue)
    .replace(/[$,\s]/g, '')
    .trim();

  // Non-numeric → just search for the text itself
  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    if (raw.length > 3) valueTerms.push(raw);
    return { valueTerms, labelTerms };
  }

  const num = Math.abs(parseFloat(raw));
  if (isNaN(num) || num === 0) return { valueTerms, labelTerms };

  const withCommas = (n: number) => {
    const parts = n.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Helper: add a number with comma and no-comma variants
  const addNumber = (n: number, skipShort = false) => {
    const rounded = Math.round(n * 100) / 100;
    const formatted = withCommas(rounded);
    if (skipShort && formatted.length < 3) return;
    if (!valueTerms.includes(formatted)) valueTerms.push(formatted);
    const noCommas = rounded.toString();
    if (noCommas !== formatted && noCommas.length >= 3 && !valueTerms.includes(noCommas)) valueTerms.push(noCommas);
    // Also add integer version for numbers close to whole (e.g., 81462.0 → 81462)
    if (Math.abs(rounded - Math.round(rounded)) < 0.01) {
      const intStr = Math.round(rounded).toString();
      const intFormatted = withCommas(Math.round(rounded));
      if (!valueTerms.includes(intFormatted) && intFormatted.length >= 3) valueTerms.push(intFormatted);
      if (intStr !== intFormatted && !valueTerms.includes(intStr) && intStr.length >= 3) valueTerms.push(intStr);
    }
  };

  // Direct value (as typed in cell)
  addNumber(num);

  // SEC filings commonly report in millions or thousands — try DIVIDING by scales
  const divScales = [1000, 1_000_000, 1_000_000_000];
  for (const div of divScales) {
    const scaled = num / div;
    if (scaled >= 1 && scaled < 10_000_000) {
      addNumber(scaled, true);
    }
  }

  // ALSO try MULTIPLYING by scales — cell value may be in billions, filing in millions
  const mulScales = [1000, 1_000_000, 1_000_000_000];
  for (const mult of mulScales) {
    const scaled = num * mult;
    if (scaled >= 100 && scaled < 10_000_000_000_000) {
      addNumber(scaled, true);
      for (const delta of [-2, -1, 1, 2]) {
        const nearby = Math.round(scaled) + delta;
        const nearbyFmt = withCommas(nearby);
        if (!valueTerms.includes(nearbyFmt) && nearbyFmt.length >= 4) valueTerms.push(nearbyFmt);
      }
    }
  }

  // Also add the raw integer value (no commas, no decimals) for direct match
  const intStr = Math.round(num).toString();
  if (intStr.length >= 4 && !valueTerms.includes(intStr)) {
    valueTerms.push(intStr);
  }

  // Add with parentheses (negative number convention in filings)
  if (parseFloat(raw) < 0) {
    const formatted = withCommas(num);
    valueTerms.push(`(${formatted})`);
  }

  return { valueTerms, labelTerms, evidenceSnippet: evidenceSnippet || undefined };
}

/**
 * Build a <script> that runs inside the iframe AFTER the document loads.
 *
 * TABLE-ROW VALIDATED search (v3):
 *   1. Find ALL occurrences of the cell VALUE in the document.
 *   2. For each occurrence, extract the non-numeric label text from the
 *      same <tr> (table row).
 *   3. Score how well that row label matches the expected label
 *      (filing_label, then cellLabel).
 *   4. Highlight the BEST match — the one where BOTH value AND label
 *      appear in the same row.
 *   5. Fallback: if no value found, scroll to the label section only.
 *   6. Communicate match confidence back to parent via postMessage.
 *
 * Validation checks:
 *   - The highlighted row's description MUST match the cell's label/metric
 *   - The highlighted value MUST match the cell value
 *   - If either check fails, confidence drops and the user sees a warning
 */
function buildFinderScript(searchTerms: SearchTerms, highlightTexts: string[]): string {
  const { valueTerms, labelTerms, evidenceSnippet } = searchTerms;
  const extraValueTerms = highlightTexts.filter((t) => t && t.length > 10).map((t) => t.slice(0, 80));
  const allValueTerms = [...valueTerms, ...extraValueTerms];

  if (allValueTerms.length === 0 && labelTerms.length === 0 && !evidenceSnippet) return '';

  const valueJson = JSON.stringify(allValueTerms);
  const labelJson = JSON.stringify(labelTerms);
  // Evidence snippet: the exact row text from the filing table (e.g., "Total revenues: 97,690 | 81,462")
  // Extract the label part (before the colon) as a HIGH-PRIORITY search term
  const evidenceLabel = evidenceSnippet ? evidenceSnippet.split(':')[0].trim() : '';
  const evidenceLabelJson = JSON.stringify(evidenceLabel);

  return `
<script>
(function() {
  var valueTerms = ${valueJson};
  var labelTerms = ${labelJson};
  var evidenceLabel = ${evidenceLabelJson};
  var MARK_STYLE = 'background:#fde047;padding:2px 4px;border-radius:3px;scroll-margin-top:120px;';
  var found = false;

  // If we have an evidence label from StatementMap, prepend it as highest-priority label
  if (evidenceLabel && evidenceLabel.length > 2) {
    // Insert at the front so it's tried first
    labelTerms = [evidenceLabel].concat(labelTerms.filter(function(l) {
      return l.toLowerCase() !== evidenceLabel.toLowerCase();
    }));
  }

  function norm(s) {
    return s.replace(/[\\u00A0\\u2007\\u202F\\u2009\\u200A\\u2002\\u2003]/g, ' ')
            .replace(/\\s+/g, ' ');
  }

  function isWordBoundary(text, pos) {
    if (pos < 0 || pos >= text.length) return true;
    return !/[a-zA-Z0-9]/.test(text.charAt(pos));
  }

  function findInNode(node, term) {
    var text = norm(node.textContent);
    var normTerm = norm(term);
    var needsWB = normTerm.length < 8 && /^[a-zA-Z]/.test(normTerm);

    for (var si = 0; si < 2; si++) {
      var sText = si === 0 ? text : text.toLowerCase();
      var sTerm = si === 0 ? normTerm : normTerm.toLowerCase();
      var startPos = 0;
      while (true) {
        var idx = sText.indexOf(sTerm, startPos);
        if (idx === -1) break;
        if (needsWB && (!isWordBoundary(text, idx - 1) || !isWordBoundary(text, idx + normTerm.length))) {
          startPos = idx + 1;
          continue;
        }
        var origText = node.textContent;
        var origIdx = origText.indexOf(term);
        if (origIdx === -1) origIdx = origText.toLowerCase().indexOf(term.toLowerCase());
        if (origIdx !== -1) return { idx: origIdx, len: term.length };
        return { idx: Math.min(idx, Math.max(0, origText.length - normTerm.length)), len: normTerm.length };
      }
    }

    var noComma = normTerm.replace(/,/g, '');
    if (noComma !== normTerm && noComma.length >= 3) {
      var ncText = text.replace(/,/g, '');
      var idx2 = ncText.indexOf(noComma);
      if (idx2 === -1) idx2 = ncText.toLowerCase().indexOf(noComma.toLowerCase());
      if (idx2 !== -1) {
        var pat = noComma.split('').map(function(ch) {
          if (/\\d/.test(ch)) return ch + '[,\\\\s\\u00A0]?';
          return ch.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
        }).join('');
        var m = new RegExp(pat, 'i').exec(node.textContent);
        if (m) return { idx: m.index, len: m[0].length };
      }
    }
    return null;
  }

  function closestTr(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    for (var i = 0; i < 10 && el; i++) {
      if (el.tagName === 'TR') return el;
      el = el.parentElement;
    }
    return null;
  }

  // Extract NON-NUMERIC label text from a table row
  function getRowLabel(tr) {
    if (!tr) return '';
    var cells = tr.querySelectorAll('td, th');
    var parts = [];
    for (var i = 0; i < cells.length; i++) {
      var t = cells[i].textContent.trim().replace(/\\s+/g, ' ');
      if (t && !/^[\\s$()0-9,.\\/\\-\\u2014\\u2013%]*$/.test(t)) {
        parts.push(t);
      }
    }
    return parts.join(' ');
  }

  // Score how well rowText matches our expected label terms (0-100, or -1 if no labels)
  function scoreLabelMatch(text) {
    if (!text || labelTerms.length === 0) return -1;
    var tl = text.toLowerCase();
    for (var i = 0; i < labelTerms.length; i++) {
      var lt = labelTerms[i].toLowerCase();
      if (tl === lt) return 100 - i * 3;
      if (tl.indexOf(lt) !== -1) return 90 - i * 3;
      if (lt.indexOf(tl) !== -1 && tl.length > 4) return 75 - i * 3;
      var words = lt.split(/\\s+/).filter(function(w) { return w.length > 2; });
      if (words.length > 0) {
        var matched = 0;
        for (var w = 0; w < words.length; w++) {
          if (tl.indexOf(words[w]) !== -1) matched++;
        }
        if (matched >= Math.ceil(words.length * 0.6)) return 65 - i * 3;
        if (matched >= Math.ceil(words.length * 0.4)) return 45 - i * 3;
      }
    }
    return 0;
  }

  function doHighlight(cand) {
    try {
      var range = document.createRange();
      range.setStart(cand.node, Math.max(0, cand.idx));
      range.setEnd(cand.node, Math.min(cand.node.textContent.length, cand.idx + cand.len));
      var mark = document.createElement('mark');
      mark.setAttribute('style', MARK_STYLE);
      mark.id = 'qd-highlight';
      try {
        range.surroundContents(mark);
      } catch (surErr) {
        // surroundContents fails when the range spans across element boundaries
        // (common in XBRL filings with <ix:nonFraction> tags).
        // Fallback: insert the mark at the start of the range and scroll to it.
        var nearestEl = cand.node.parentElement;
        if (nearestEl) {
          nearestEl.setAttribute('style', MARK_STYLE);
          nearestEl.id = 'qd-highlight';
        }
      }
      setTimeout(function() {
        var el = document.getElementById('qd-highlight');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = 'background 0.3s';
          setTimeout(function() { el.style.background = '#facc15'; }, 800);
          setTimeout(function() { el.style.background = '#fde047'; }, 1200);
          setTimeout(function() { el.style.background = '#facc15'; }, 1600);
          setTimeout(function() { el.style.background = '#fde047'; }, 2000);
        }
      }, 100);
      found = true;
      return true;
    } catch (e) {
      // Last resort: try to scroll to the parent element
      try {
        var fallbackEl = cand.node.parentElement || cand.parent;
        if (fallbackEl) {
          fallbackEl.setAttribute('style', MARK_STYLE);
          fallbackEl.id = 'qd-highlight';
          fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          found = true;
          return true;
        }
      } catch(e2) {}
      return false;
    }
  }

  function sendResult(confidence, rowLabel, valueTerm) {
    try {
      window.parent.postMessage({
        type: 'qd-match-result',
        confidence: confidence,
        rowLabel: rowLabel || '',
        valueTerm: valueTerm || ''
      }, '*');
    } catch(e) {}
  }

  function tryHighlight() {
    if (found) return;

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: Find ALL value occurrences, score each by row-label context
    // ═══════════════════════════════════════════════════════════════════
    var candidates = [];
    console.log('[QD] Searching. Values:', valueTerms.slice(0, 6), 'Labels:', labelTerms);

    for (var vi = 0; vi < valueTerms.length; vi++) {
      var term = valueTerms[vi];
      if (!term || term.length < 2) continue;

      var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = tw.nextNode())) {
        var parent = node.parentElement;
        if (!parent) continue;
        var tag = parent.tagName;
        if (tag === 'STYLE' || tag === 'SCRIPT' || tag === 'HEAD' || tag === 'NOSCRIPT') continue;

        var match = findInNode(node, term);
        if (!match) continue;

        var tr = closestTr(node);
        var isInTable = !!tr;
        var rowLabel = getRowLabel(tr);
        var labelScore = scoreLabelMatch(rowLabel);

        // Check ±2 adjacent rows for section headers
        if (labelScore <= 0 && tr && tr.parentElement) {
          var adjText = '';
          var prev = tr.previousElementSibling;
          if (prev && prev.tagName === 'TR') adjText += ' ' + getRowLabel(prev);
          var prev2 = prev ? prev.previousElementSibling : null;
          if (prev2 && prev2.tagName === 'TR') adjText += ' ' + getRowLabel(prev2);
          var next = tr.nextElementSibling;
          if (next && next.tagName === 'TR') adjText += ' ' + getRowLabel(next);
          if (adjText.trim()) {
            var adjScore = scoreLabelMatch(adjText.trim());
            if (adjScore > 0) labelScore = Math.max(adjScore - 25, 5);
          }
        }

        var score = 0;
        if (labelScore > 0) score += labelScore;
        if (isInTable) score += 15;
        score += Math.max(0, 8 - vi * 2);

        candidates.push({
          node: node, idx: match.idx, len: match.len, parent: parent,
          score: score, labelScore: labelScore, rowLabel: rowLabel,
          isInTable: isInTable, valueTerm: term
        });

        if (score >= 95) break;
      }
      if (candidates.length > 0 && candidates[candidates.length - 1].score >= 95) break;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: Pick the best candidate (highest score)
    // ═══════════════════════════════════════════════════════════════════
    if (candidates.length > 0) {
      candidates.sort(function(a, b) { return b.score - a.score; });
      var best = candidates[0];
      console.log('[QD] Best: score=' + best.score + ' labelScore=' + best.labelScore +
                  ' row="' + best.rowLabel.slice(0, 60) + '" val="' + best.valueTerm + '"');

      var conf;
      if (best.labelScore >= 60) conf = 'verified';
      else if (best.labelScore >= 30) conf = 'likely';
      else if (best.labelScore > 0) conf = 'partial';
      else if (best.isInTable && labelTerms.length === 0) conf = 'likely';
      else conf = 'value_only';

      sendResult(conf, best.rowLabel.slice(0, 120), best.valueTerm);
      doHighlight(best);
      return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: No value found in text nodes — try searching <td> elements
    // directly (XBRL filings split text across IX tags inside cells)
    // ═══════════════════════════════════════════════════════════════════
    if (candidates.length === 0 && valueTerms.length > 0) {
      console.log('[QD] No text-node matches. Trying cell-level (td) search for XBRL...');
      var allCells = document.querySelectorAll('td, th');
      for (var ci = 0; ci < allCells.length && candidates.length < 50; ci++) {
        var cell = allCells[ci];
        var cellText = norm(cell.textContent).trim();
        if (!cellText) continue;

        for (var vj = 0; vj < valueTerms.length; vj++) {
          var vTerm = valueTerms[vj];
          if (!vTerm || vTerm.length < 2) continue;
          var normVTerm = norm(vTerm);
          // Check both exact and case-insensitive
          if (cellText.indexOf(normVTerm) !== -1 || cellText.toLowerCase().indexOf(normVTerm.toLowerCase()) !== -1) {
            var tr = closestTr(cell);
            var rowLbl = getRowLabel(tr);
            var lScore = scoreLabelMatch(rowLbl);

            var sc = 0;
            if (lScore > 0) sc += lScore;
            sc += 15; // in table
            sc += Math.max(0, 8 - vj * 2);

            // Use the first text node inside this cell for highlighting
            var textNode = null;
            var twCell = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT, null);
            var tn;
            while ((tn = twCell.nextNode())) {
              if (tn.textContent.trim().length > 0) { textNode = tn; break; }
            }
            if (textNode) {
              candidates.push({
                node: textNode, idx: 0, len: textNode.textContent.length,
                parent: cell, score: sc, labelScore: lScore,
                rowLabel: rowLbl, isInTable: true, valueTerm: vTerm
              });
            }
            break;
          }
          // Also try without commas
          var noC = normVTerm.replace(/,/g, '');
          var cellNoC = cellText.replace(/,/g, '');
          if (noC.length >= 3 && cellNoC.indexOf(noC) !== -1) {
            var tr2 = closestTr(cell);
            var rowLbl2 = getRowLabel(tr2);
            var lScore2 = scoreLabelMatch(rowLbl2);
            var sc2 = (lScore2 > 0 ? lScore2 : 0) + 15 + Math.max(0, 8 - vj * 2);
            var textNode2 = null;
            var twCell2 = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT, null);
            var tn2;
            while ((tn2 = twCell2.nextNode())) {
              if (tn2.textContent.trim().length > 0) { textNode2 = tn2; break; }
            }
            if (textNode2) {
              candidates.push({
                node: textNode2, idx: 0, len: textNode2.textContent.length,
                parent: cell, score: sc2, labelScore: lScore2,
                rowLabel: rowLbl2, isInTable: true, valueTerm: vTerm
              });
            }
            break;
          }
        }
      }
      if (candidates.length > 0) {
        candidates.sort(function(a, b) { return b.score - a.score; });
        var best2 = candidates[0];
        console.log('[QD] Cell-level match: score=' + best2.score + ' row="' + best2.rowLabel.slice(0, 60) + '" val="' + best2.valueTerm + '"');
        var conf2 = best2.labelScore >= 60 ? 'verified' : best2.labelScore >= 30 ? 'likely' : best2.labelScore > 0 ? 'partial' : 'value_only';
        sendResult(conf2, best2.rowLabel.slice(0, 120), best2.valueTerm);
        doHighlight(best2);
        return;
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 4: No value found — try label-only (scroll to section)
    // ═══════════════════════════════════════════════════════════════════
    if (labelTerms.length > 0) {
      console.log('[QD] No value match. Trying label-only.');
      for (var li = 0; li < labelTerms.length; li++) {
        var label = labelTerms[li];
        var tw2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var node2;
        while ((node2 = tw2.nextNode())) {
          var p2 = node2.parentElement;
          if (!p2) continue;
          var t2 = p2.tagName;
          if (t2 === 'STYLE' || t2 === 'SCRIPT' || t2 === 'HEAD' || t2 === 'NOSCRIPT') continue;
          var m2 = findInNode(node2, label);
          if (m2) {
            console.log('[QD] Label-only match: "' + label + '"');
            sendResult('label_only', '', '');
            doHighlight({ node: node2, idx: m2.idx, len: m2.len, parent: p2 });
            return;
          }
        }
      }
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(tryHighlight, 200);
  } else {
    window.addEventListener('load', function() { setTimeout(tryHighlight, 400); });
  }
  setTimeout(tryHighlight, 2500);
  setTimeout(tryHighlight, 6000);
  setTimeout(function() {
    if (!found) {
      tryHighlight();
      if (!found) sendResult('not_found', '', '');
    }
  }, 10000);
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

  // Match confidence from the iframe finder script
  const [matchConfidence, setMatchConfidence] = useState<string | null>(null);
  const [matchRowLabel, setMatchRowLabel] = useState('');

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
    // Evidence snippet from StatementMap takes priority — it's the exact row text
    const locCtx = provenance?.location as any;
    if (locCtx?.evidenceSnippet) texts.push(locCtx.evidenceSnippet);
    if (provenance?.sourceSnippet) texts.push(provenance.sourceSnippet);
    if (locCtx?.textAnchor) texts.push(locCtx.textAnchor);
    const gs: Array<{ segment: { text: string } }> = (provenance as any)?._groundingSupports || [];
    for (const g of gs) {
      if (g.segment?.text) texts.push(g.segment.text);
    }
    return texts;
  }, [provenance]);

  // Search terms derived from the cell value (multi-scale number matching)
  // filing_label takes priority over cellLabel for context-aware search
  const searchTerms = useMemo(
    () =>
      buildSearchTerms(
        provenance?.location?.cellValue,
        provenance?.location?.cellLabel,
        provenance?.location?.filingLabel,
        provenance?.location?.evidenceSnippet
      ),
    [provenance]
  );

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  // Reset verified badge when a different cell is selected
  useEffect(() => {
    setVerified(false);
    setMatchConfidence(null);
    setMatchRowLabel('');
  }, [cell]);

  // Listen for match confidence from iframe finder script
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'qd-match-result') {
        setMatchConfidence(e.data.confidence || null);
        setMatchRowLabel(e.data.rowLabel || '');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Reset confidence when provenance changes (new document/cell)
  useEffect(() => {
    setMatchConfidence(null);
    setMatchRowLabel('');
  }, [provenance]);

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
      // Use the directory path (not just origin) so relative refs like "R1.htm" work
      let baseUrl = '';
      try {
        const u = new URL(finalUrl);
        const lastSlash = u.pathname.lastIndexOf('/');
        baseUrl = u.origin + u.pathname.slice(0, lastSlash + 1);
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

              {/* Filing section badge */}
              {provenance?.location?.filingSection && (
                <div className="mb-1.5 flex items-center gap-1 text-[10px]">
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800">
                    {'📄 '}
                    {provenance.location.filingSection}
                  </span>
                </div>
              )}

              {/* Cell label → Filing label mapping */}
              {provenance?.location?.cellValue && (
                <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {provenance.location.cellLabel && (
                    <span className="font-medium text-yellow-800">{provenance.location.cellLabel}</span>
                  )}
                  {provenance.location.filingLabel &&
                    provenance.location.cellLabel &&
                    provenance.location.filingLabel.toLowerCase() !== provenance.location.cellLabel.toLowerCase() && (
                      <span className="flex items-center gap-1 text-[10px] text-yellow-600">
                        {'→ '}
                        <span className="rounded bg-orange-100 px-1 py-0.5 font-medium text-orange-800">
                          {provenance.location.filingLabel}
                        </span>
                      </span>
                    )}
                  {(provenance.location.cellLabel || provenance.location.filingLabel) && (
                    <span className="text-yellow-600">:</span>
                  )}
                  <span className="rounded bg-yellow-200/60 px-1.5 py-0.5 font-mono font-semibold text-yellow-900">
                    {provenance.location.cellValue}
                  </span>
                </div>
              )}

              {/* Filing note — explains mapping assumption */}
              {provenance?.location?.filingNote && (
                <div className="mt-1 rounded bg-orange-50 px-2 py-1 text-[10px] leading-relaxed text-orange-700">
                  {'💡 '}
                  {provenance.location.filingNote}
                </div>
              )}

              {/* Match confidence indicator */}
              {matchConfidence && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                  {matchConfidence === 'verified' && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-800">
                      {'✅ Verified — value and label match in document'}
                    </span>
                  )}
                  {matchConfidence === 'likely' && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">
                      {'🔵 Likely match — label partially matches'}
                    </span>
                  )}
                  {matchConfidence === 'partial' && (
                    <span className="rounded bg-yellow-100 px-1.5 py-0.5 font-medium text-yellow-700">
                      {'🔶 Partial match — check row context'}
                    </span>
                  )}
                  {matchConfidence === 'value_only' && (
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-orange-700">
                      {'⚠️ Value found but row label does not match — verify manually'}
                    </span>
                  )}
                  {matchConfidence === 'label_only' && (
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-orange-700">
                      {'⚠️ Found section but value not in this row — data may differ from filing'}
                    </span>
                  )}
                  {matchConfidence === 'not_found' && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-700">
                      {'❌ Value not found in document — double-check this data'}
                    </span>
                  )}
                </div>
              )}

              {/* Show the matched row label from the document for transparency */}
              {matchRowLabel &&
                matchConfidence &&
                matchConfidence !== 'verified' &&
                matchConfidence !== 'not_found' && (
                  <div className="mt-1 text-[9px] text-muted-foreground">
                    {'Document row: "'}
                    {matchRowLabel.slice(0, 100)}
                    {'"'}
                  </div>
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
