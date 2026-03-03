/**
 * Statement Mapper — Structural analysis of SEC 10-K filing HTML.
 *
 * This module creates a "Financial Statement Map" by:
 *   1. Parsing the 10-K HTML into tables with row/column structure
 *   2. Using the LLM to classify each table (Income Statement, Balance Sheet, etc.)
 *   3. Normalizing multi-row headers to resolve period columns
 *   4. Mapping row labels to standard metrics
 *
 * Output: StatementMap = { tables[], meta }
 * Each table has: { tableId, statementType, periodColumns, unit, rows[] }
 * Each row: { label, valuesByPeriod, rowKey }
 *
 * This prevents the common failure of grabbing "adjusted EBITDA" from MD&A
 * instead of the audited financial statements.
 */

// ============================================================================
// HTML TABLE PARSER
// ============================================================================

/**
 * Parse raw 10-K HTML into an array of structured table objects.
 * Each table includes raw row data, detected headers, and surrounding context.
 *
 * @param {string} html - Raw filing HTML
 * @returns {Array<RawTable>}
 */
function parseHtmlTables(html) {
  // We operate on the raw HTML string with regex — no DOM parser needed on server.
  const tables = [];
  // Match <table ...>...</table> blocks (non-greedy, case-insensitive)
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;
  let tableIdx = 0;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];
    const tableOffset = tableMatch.index;

    // Extract context: 500 chars before the table for section detection
    const contextBefore = html
      .slice(Math.max(0, tableOffset - 800), tableOffset)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(-400);

    // Parse rows
    const rows = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      const cells = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        let cellText = cellMatch[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;|&#160;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&#8217;|&#x2019;|&rsquo;/gi, "'")
          .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/gi, '"')
          .replace(/&#8212;|&mdash;/gi, '—')
          .replace(/&#8211;|&ndash;/gi, '–')
          .replace(/\s+/g, ' ')
          .trim();

        // Detect parenthesized negatives: "(1,234)" → "-1234"
        const parenMatch = cellText.match(/^\([\s$]*([0-9,]+(?:\.\d+)?)\)$/);
        if (parenMatch) {
          cellText = '-' + parenMatch[1].replace(/,/g, '');
        }

        cells.push(cellText);
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    // Skip empty rows at the start (XBRL spacer rows like <tr style="height:12pt">)
    while (rows.length > 0 && rows[0].length === 0) {
      rows.shift();
    }

    // Skip tiny tables (nav bars, footnotes, etc.)
    if (rows.length < 3) continue;
    // Check that at least one row has 2+ cells (don't require first row)
    const maxCols = Math.max(...rows.map(r => r.length));
    if (maxCols < 2) continue;

    // Detect if this is a financial table (contains dollar signs, numbers, or common statement keywords)
    const allText = rows.map(r => r.join(' ')).join(' ');
    const hasNumbers = /\d{3,}/.test(allText);
    const hasFinancialKeywords = /revenue|income|assets|liabilities|equity|cash|operating|expense|net\s+(?:income|loss|sales)|total/i.test(allText);
    if (!hasNumbers && !hasFinancialKeywords) continue;

    tables.push({
      tableId: `tbl_${tableIdx}`,
      rows,
      contextBefore,
      charOffset: tableOffset,
      rowCount: rows.length,
      colCount: Math.max(...rows.map(r => r.length)),
    });
    tableIdx++;
  }

  return tables;
}

// ============================================================================
// TABLE NORMALIZER — Resolve multi-row headers, detect periods, extract units
// ============================================================================

/**
 * Normalize a parsed table: detect headers, period columns, units, and
 * classify rows as header/data/total/subtotal.
 *
 * XBRL-aware: handles colspan misalignment by extracting values positionally
 * rather than by column index.  Standalone years (2020-2030) are treated as
 * header text, not numeric data, so period rows are correctly classified.
 *
 * @param {RawTable} table
 * @returns {NormalizedTable}
 */
function normalizeTable(table) {
  const { rows, tableId, contextBefore, charOffset } = table;
  if (rows.length < 2) return null;

  // Standalone year regex — treat as TEXT for header classification
  const YEAR_RE = /^20[12]\d$/;

  // Helper: is this cell text purely numeric (excluding standalone years)?
  const isNumericCell = (text) => {
    const cleaned = text.replace(/^\(|\)$/g, '').trim();
    if (YEAR_RE.test(cleaned)) return false; // years are NOT numeric for header detection
    return /^[\s$()-]*[\d,]+(?:\.\d+)?[\s%]*$/.test(cleaned);
  };

  // --- Detect header rows ---
  // Headers are rows where most cells are non-numeric text (labels, dates, years)
  const headerRows = [];
  const dataRows = [];
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];
    const nonEmpty = cells.filter(c => c.length > 0);
    if (nonEmpty.length === 0) continue; // skip fully empty rows

    const numericCells = nonEmpty.filter(c => isNumericCell(c)).length;
    const textCells = nonEmpty.filter(c => !isNumericCell(c)).length;

    // Header if mostly text and in the first 5 rows
    // Also catch "pure year" rows like ["2023", "2024"] — these are headers
    const isPureYearRow = nonEmpty.length > 0 && nonEmpty.every(c => YEAR_RE.test(c.trim()));
    if ((i < 5 && textCells >= numericCells && numericCells <= 1) || isPureYearRow) {
      headerRows.push({ idx: i, cells });
    } else {
      dataRows.push({ idx: i, cells });
    }
  }

  // --- Detect periods from headers + first few rows ---
  const yearPattern = /(?:20\d{2})/g;
  const periodColumns = [];
  const allHeaderText = headerRows.map(r => r.cells.join(' ')).join(' ');

  // Strategy: find cells in header rows that contain year patterns
  for (const hr of headerRows) {
    for (let col = 0; col < hr.cells.length; col++) {
      const cellText = hr.cells[col].trim();
      const yearMatch = cellText.match(yearPattern);
      if (yearMatch) {
        const period = yearMatch[yearMatch.length - 1]; // last year in cell
        if (!periodColumns.some(p => p.period === period)) {
          periodColumns.push({
            colIndex: col,
            period,
            label: cellText,
          });
        }
      }
    }
  }

  // FALLBACK: If still no periods, scan first 6 rows regardless
  if (periodColumns.length === 0) {
    for (let i = 0; i < Math.min(rows.length, 6); i++) {
      for (let col = 0; col < rows[i].length; col++) {
        const cellText = rows[i][col].trim();
        const yearMatch = cellText.match(yearPattern);
        if (yearMatch) {
          const period = yearMatch[yearMatch.length - 1];
          if (!periodColumns.some(p => p.period === period)) {
            periodColumns.push({ colIndex: col, period, label: cellText });
          }
        }
      }
    }
  }

  // Sort periods by their appearance order (left-to-right in the header)
  // This is the positional order we'll use for value extraction
  const detectedPeriods = periodColumns.map(p => p.period);

  // --- Detect unit/scale ---
  const unitIndicators = [
    { pattern: /in\s+millions|millions\s+of\s+dollars|\$\s*millions/i, unit: 'USD millions', scale: 1_000_000 },
    { pattern: /in\s+thousands|thousands\s+of\s+dollars|\$\s*thousands/i, unit: 'USD thousands', scale: 1_000 },
    { pattern: /in\s+billions|billions\s+of\s+dollars|\$\s*billions/i, unit: 'USD billions', scale: 1_000_000_000 },
  ];
  let unit = 'actual';
  let scale = 1;
  const unitSearchText = (contextBefore + ' ' + allHeaderText).slice(0, 1000);
  for (const ind of unitIndicators) {
    if (ind.pattern.test(unitSearchText)) {
      unit = ind.unit;
      scale = ind.scale;
      break;
    }
  }

  // --- Classify & extract data rows with POSITIONAL value mapping ---
  // XBRL tables use colspan, making colIndex unreliable.
  // Instead, we extract all numeric values from each data row and map them
  // to detected periods in left-to-right order.
  const normalizedRows = [];
  for (const dr of dataRows) {
    const cells = dr.cells;
    if (cells.length === 0) continue;

    // Find the label: first non-empty, non-numeric, non-year, non-$ cell
    let label = '';
    let labelColIdx = -1;
    for (let c = 0; c < cells.length; c++) {
      const text = cells[c].trim();
      if (!text) continue;
      if (text === '$' || text === '—' || text === '-') continue;
      if (YEAR_RE.test(text)) continue;
      if (isNumericCell(text)) continue;
      label = text;
      labelColIdx = c;
      break;
    }

    // Extract numeric values POSITIONALLY (skip label, $, —, years)
    const numericValues = [];
    for (let c = 0; c < cells.length; c++) {
      if (c === labelColIdx) continue;
      const text = cells[c].trim();
      if (!text || text === '$' || text === '—' || text === '-' || text === '–') continue;
      if (YEAR_RE.test(text)) continue;

      // Try to parse as a number
      let valStr = text.replace(/[$,\s%]/g, '');
      // Handle parenthesized negatives that weren't caught by parseHtmlTables
      if (/^\(/.test(text) && /\)$/.test(text)) {
        valStr = '-' + valStr.replace(/[()]/g, '');
      }
      if (/^-?\d+(?:\.\d+)?$/.test(valStr)) {
        numericValues.push(parseFloat(valStr));
      }
    }

    // Map extracted values to periods by position
    const valuesByPeriod = {};
    for (let p = 0; p < detectedPeriods.length; p++) {
      if (p < numericValues.length) {
        valuesByPeriod[detectedPeriods[p]] = numericValues[p];
      } else {
        valuesByPeriod[detectedPeriods[p]] = null;
      }
    }

    // Row classification
    const isTotal = /^total\b/i.test(label);
    const isSubtotal = /^(?:sub-?total|gross\s+profit|operating\s+income|income\s+(?:before|from))/i.test(label);
    const isEmpty = Object.values(valuesByPeriod).every(v => v === null || v === undefined);

    if (label || numericValues.length > 0) {
      normalizedRows.push({
        label,
        valuesByPeriod,
        rowKey: label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : `row_${dr.idx}`,
        isTotal,
        isSubtotal,
        isEmpty,
        rawRowIdx: dr.idx,
      });
    }
  }

  // --- Detect statement type from context + content ---
  const statementType = classifyStatementType(contextBefore, allHeaderText, normalizedRows);

  return {
    tableId,
    statementType,
    periodColumns,
    unit,
    scale,
    headerRows: headerRows.map(h => h.cells),
    rows: normalizedRows,
    charOffset,
    rowCount: normalizedRows.length,
  };
}

/**
 * Classify what type of financial statement this table represents.
 */
function classifyStatementType(contextBefore, headerText, rows) {
  const allText = (contextBefore + ' ' + headerText + ' ' + rows.map(r => r.label).join(' ')).toLowerCase();

  // Strong signals
  if (/consolidated\s+statements?\s+of\s+(?:income|operations|earnings)/i.test(allText)) return 'income_statement';
  if (/consolidated\s+balance\s+sheets?/i.test(allText)) return 'balance_sheet';
  if (/consolidated\s+statements?\s+of\s+cash\s+flows?/i.test(allText)) return 'cash_flow';
  if (/consolidated\s+statements?\s+of\s+(?:stockholders|shareholders|changes\s+in)/i.test(allText)) return 'equity';
  if (/consolidated\s+statements?\s+of\s+comprehensive/i.test(allText)) return 'comprehensive_income';

  // Content-based classification
  const labels = rows.map(r => r.label.toLowerCase());
  const hasRevenue = labels.some(l => /revenue|net\s+sales|total\s+sales/.test(l));
  const hasCogs = labels.some(l => /cost\s+of\s+(?:revenue|sales|goods)/.test(l));
  const hasNetIncome = labels.some(l => /net\s+income|net\s+loss|net\s+earnings/.test(l));
  const hasTotalAssets = labels.some(l => /total\s+assets/.test(l));
  const hasTotalLiabilities = labels.some(l => /total\s+liabilities/.test(l));
  const hasTotalEquity = labels.some(l => /(?:stockholders|shareholders).*equity|total\s+equity/.test(l));
  const hasCashFromOps = labels.some(l => /cash\s+(?:provided|used|flows?).*operating/.test(l));
  const hasCashFromInv = labels.some(l => /cash\s+(?:provided|used|flows?).*investing/.test(l));

  if (hasTotalAssets && hasTotalLiabilities) return 'balance_sheet';
  if (hasRevenue && hasCogs && hasNetIncome) return 'income_statement';
  if (hasRevenue && hasNetIncome) return 'income_statement';
  if (hasCashFromOps && hasCashFromInv) return 'cash_flow';
  if (hasTotalEquity && !hasTotalAssets) return 'equity';

  return 'other';
}

// ============================================================================
// METRIC MATCHING — Semantic matching of user-requested metrics to table rows
// ============================================================================

/**
 * Standard metric synonyms for financial statement line items.
 * Maps common metric names to possible row labels in filings.
 */
const METRIC_SYNONYMS = {
  'revenue': ['revenue', 'net revenue', 'net sales', 'total revenue', 'total net revenue', 'total sales', 'total net sales', 'net operating revenues', 'net revenues'],
  'cost_of_revenue': ['cost of revenue', 'cost of sales', 'cost of goods sold', 'cost of net revenue', 'cost of products sold'],
  'gross_profit': ['gross profit', 'gross margin'],
  'operating_income': ['operating income', 'income from operations', 'operating earnings', 'operating profit'],
  'operating_expenses': ['operating expenses', 'total operating expenses', 'total costs and expenses'],
  'ebit': ['operating income', 'income from operations', 'earnings before interest and taxes', 'ebit'],
  'ebitda': ['ebitda', 'earnings before interest taxes depreciation and amortization'],
  'interest_expense': ['interest expense', 'interest expense, net', 'interest and debt expense', 'interest costs'],
  'interest_income': ['interest income', 'interest and other income'],
  'income_before_tax': ['income before income taxes', 'income before provision for income taxes', 'earnings before income taxes', 'income before taxes'],
  'income_tax': ['income tax expense', 'provision for income taxes', 'income tax provision', 'income taxes'],
  'net_income': ['net income', 'net income (loss)', 'net earnings', 'net income attributable to', 'net loss'],
  'total_assets': ['total assets'],
  'total_liabilities': ['total liabilities', 'total liabilities and'],
  'total_equity': ["total stockholders' equity", "total shareholders' equity", 'total equity', "stockholders' equity", "shareholders' equity"],
  'current_assets': ['total current assets'],
  'current_liabilities': ['total current liabilities'],
  'total_debt': ['total debt', 'long-term debt', 'long-term debt, net', 'total long-term debt'],
  'cash': ['cash and cash equivalents', 'cash, cash equivalents'],
  'depreciation': ['depreciation and amortization', 'depreciation', 'amortization'],
  'capex': ['capital expenditures', 'purchases of property and equipment', 'purchases of property, plant and equipment'],
  'operating_cash_flow': ['net cash provided by operating activities', 'net cash from operating activities', 'cash flows from operating activities'],
  'investing_cash_flow': ['net cash used in investing activities', 'net cash from investing activities', 'cash flows from investing activities'],
  'financing_cash_flow': ['net cash used in financing activities', 'net cash from financing activities', 'cash flows from financing activities'],
  'eps_basic': ['basic earnings per share', 'basic net income per share', 'net income per share, basic'],
  'eps_diluted': ['diluted earnings per share', 'diluted net income per share', 'net income per share, diluted'],
  'shares_outstanding': ['weighted average shares outstanding', 'shares used in computation'],
  'dividends': ['dividends declared per share', 'dividends per share'],
  'research_development': ['research and development', 'research and development expense'],
  'sga': ['selling, general and administrative', 'selling, general & administrative'],
};

/**
 * Find the best matching row in a table for a given metric name.
 * Returns { row, score, matchedSynonym } or null.
 */
function findMetricInTable(table, metricName) {
  if (!table || !table.rows) return null;

  const metricLower = metricName.toLowerCase().trim();

  // Get all synonyms for this metric
  let synonyms = [metricLower];
  for (const [key, syns] of Object.entries(METRIC_SYNONYMS)) {
    if (key === metricLower || syns.some(s => s === metricLower)) {
      synonyms = [...new Set([metricLower, key, ...syns])];
      break;
    }
  }

  let bestRow = null;
  let bestScore = 0;
  let bestSynonym = '';

  for (const row of table.rows) {
    const rowLabel = row.label.toLowerCase().trim();
    if (!rowLabel) continue;

    for (const syn of synonyms) {
      let score = 0;

      // Exact match
      if (rowLabel === syn) {
        score = 100;
      }
      // Row label starts with synonym
      else if (rowLabel.startsWith(syn)) {
        score = 90;
      }
      // Row label contains synonym
      else if (rowLabel.includes(syn)) {
        score = 80;
      }
      // Synonym contains row label (short row label)
      else if (syn.includes(rowLabel) && rowLabel.length > 5) {
        score = 70;
      }
      // Word-level match
      else {
        const synWords = syn.split(/\s+/).filter(w => w.length > 2);
        const rowWords = rowLabel.split(/\s+/).filter(w => w.length > 2);
        if (synWords.length > 0) {
          const matched = synWords.filter(w => rowWords.includes(w)).length;
          const ratio = matched / synWords.length;
          if (ratio >= 0.8) score = 65;
          else if (ratio >= 0.6) score = 50;
          else if (ratio >= 0.4) score = 35;
        }
      }

      // Boost "total" rows when searching for totals
      if (/^total/.test(metricLower) && row.isTotal) score += 5;
      // Penalize subtotals when looking for specifics, boost when looking for totals
      if (row.isTotal && !/^total/.test(metricLower)) score -= 5;

      if (score > bestScore) {
        bestScore = score;
        bestRow = row;
        bestSynonym = syn;
      }
    }
  }

  return bestScore >= 35 ? { row: bestRow, score: bestScore, matchedSynonym: bestSynonym } : null;
}

// ============================================================================
// TARGETED VALUE EXTRACTION
// ============================================================================

/**
 * Extract a specific metric value from the StatementMap.
 *
 * @param {Object} statementMap - The full StatementMap
 * @param {string} metricName - e.g. "Revenue", "Total Assets"
 * @param {string} period - e.g. "2025", "2024"
 * @param {string} [preferredStatement] - e.g. "income_statement", "balance_sheet"
 * @returns {ExtractedValue | null}
 */
function extractMetricValue(statementMap, metricName, period, preferredStatement) {
  if (!statementMap || !statementMap.tables) return null;

  // Priority: preferred statement type > income_statement > balance_sheet > cash_flow > other
  const typePriority = ['income_statement', 'balance_sheet', 'cash_flow', 'equity', 'comprehensive_income', 'other'];
  if (preferredStatement) {
    const idx = typePriority.indexOf(preferredStatement);
    if (idx > 0) {
      typePriority.splice(idx, 1);
      typePriority.unshift(preferredStatement);
    }
  }

  let bestResult = null;
  let bestScore = 0;

  for (const type of typePriority) {
    const tables = statementMap.tables.filter(t => t.statementType === type);
    for (const table of tables) {
      const match = findMetricInTable(table, metricName);
      if (!match) continue;

      let score = match.score;
      // Boost if this was the preferred statement type
      if (type === preferredStatement) score += 10;
      // Boost primary financial statements over notes
      if (['income_statement', 'balance_sheet', 'cash_flow'].includes(type)) score += 5;

      if (score > bestScore) {
        const value = match.row.valuesByPeriod[period];
        bestScore = score;
        bestResult = {
          metric: metricName,
          period,
          value: value !== undefined ? value : null,
          unit: table.unit,
          scale: table.scale,
          source: {
            tableId: table.tableId,
            statementType: table.statementType,
            rowLabel: match.row.label,
            matchedSynonym: match.matchedSynonym,
            periodColumns: table.periodColumns,
            columnLabel: table.periodColumns.find(p => p.period === period)?.label || period,
            evidenceSnippet: buildEvidenceSnippet(match.row, table),
            charOffset: table.charOffset,
          },
          confidence: Math.min(score / 100, 0.99),
          matchScore: score,
        };
      }
    }
  }

  return bestResult;
}

/**
 * Build an evidence snippet for a matched row.
 * Format: "Row Label   Value_2025   Value_2024   ..."
 */
function buildEvidenceSnippet(row, table) {
  if (!row || !table) return '';
  const parts = [row.label];
  for (const pc of table.periodColumns) {
    const val = row.valuesByPeriod[pc.period];
    if (val !== null && val !== undefined) {
      parts.push(String(val));
    }
  }
  return parts.join('  ');
}

// ============================================================================
// TABLE QUALITY SCORING — for deduplication
// ============================================================================

/**
 * Score a table's quality for dedup purposes.
 * Higher score = more likely to be the "real" primary financial statement.
 */
function scoreTableQuality(table) {
  let score = 0;
  const labels = table.rows.map(r => r.label.toLowerCase());

  // Period columns: more is better (penalize 0 heavily)
  score += table.periodColumns.length * 20;

  // Non-null data values: each row with actual values adds to score
  for (const row of table.rows) {
    const nonNull = Object.values(row.valuesByPeriod).filter(v => v !== null && v !== undefined).length;
    score += nonNull * 2;
  }

  // Key metric presence (the hallmark of a real financial statement)
  const keyMetrics = {
    income_statement: [/^revenues?$/i, /cost of revenue/i, /operating income/i, /net income/i],
    balance_sheet: [/total assets/i, /total liabilities/i, /total current assets/i],
    cash_flow: [/net income/i, /operating activities/i, /investing activities/i],
    equity: [/balance as of/i, /stock.?based compensation/i, /repurchase/i],
  };
  const metricsForType = keyMetrics[table.statementType] || [];
  for (const pattern of metricsForType) {
    if (labels.some(l => pattern.test(l))) {
      score += 30;
    }
  }

  // Small bonus for row count (secondary tiebreaker)
  score += Math.min(table.rows.length, 20);

  return score;
}

// ============================================================================
// STATEMENT MAP BUILDER — Main entry point
// ============================================================================

/**
 * Build a StatementMap from raw 10-K HTML.
 *
 * @param {string} html - Raw filing HTML
 * @returns {StatementMap}
 */
function buildStatementMap(html) {
  console.log('[StatementMapper] Parsing HTML tables...');
  const rawTables = parseHtmlTables(html);
  console.log(`[StatementMapper] Found ${rawTables.length} candidate tables`);

  const normalizedTables = [];
  for (const raw of rawTables) {
    const normalized = normalizeTable(raw);
    if (normalized && normalized.rows.length >= 2) {
      normalizedTables.push(normalized);
    }
  }
  console.log(`[StatementMapper] Normalized ${normalizedTables.length} financial tables`);

  // Filter: keep only primary financial statements + significant notes tables
  const primaryTypes = ['income_statement', 'balance_sheet', 'cash_flow', 'equity'];
  const primaryTables = normalizedTables.filter(t => primaryTypes.includes(t.statementType));
  const otherTables = normalizedTables.filter(t => !primaryTypes.includes(t.statementType) && t.rows.length >= 5);

  // Deduplicate: if multiple tables of the same type, score by data quality
  // (key metrics present, period columns, non-null values) — not just row count
  const deduped = new Map();
  for (const t of primaryTables) {
    const existing = deduped.get(t.statementType);
    if (!existing || scoreTableQuality(t) > scoreTableQuality(existing)) {
      deduped.set(t.statementType, t);
    }
  }

  const finalTables = [...deduped.values(), ...otherTables.slice(0, 5)]; // Keep up to 5 supplementary tables

  // Detect all available periods across tables
  const allPeriods = new Set();
  for (const t of finalTables) {
    for (const pc of t.periodColumns) {
      allPeriods.add(pc.period);
    }
  }

  const statementMap = {
    tables: finalTables,
    availablePeriods: [...allPeriods].sort().reverse(),
    meta: {
      totalTablesScanned: rawTables.length,
      tablesKept: finalTables.length,
      primaryStatements: [...deduped.keys()],
    },
  };

  console.log(`[StatementMapper] Map built: ${finalTables.length} tables, periods: [${statementMap.availablePeriods.join(', ')}]`);
  for (const t of finalTables) {
    console.log(`  [${t.tableId}] ${t.statementType} — ${t.rows.length} rows, ${t.periodColumns.length} period cols, unit=${t.unit}`);
  }

  return statementMap;
}

/**
 * Extract multiple metrics at once from the StatementMap.
 * Returns an array of ExtractedValue objects.
 *
 * @param {Object} statementMap
 * @param {Array<{metric: string, period: string, preferredStatement?: string}>} requests
 * @returns {Array<ExtractedValue>}
 */
function extractMultipleMetrics(statementMap, requests) {
  const results = [];
  for (const req of requests) {
    const result = extractMetricValue(statementMap, req.metric, req.period, req.preferredStatement);
    if (result) {
      results.push(result);
    } else {
      results.push({
        metric: req.metric,
        period: req.period,
        value: null,
        unit: null,
        source: null,
        confidence: 0,
        matchScore: 0,
        error: `Metric "${req.metric}" not found for period ${req.period}`,
      });
    }
  }
  return results;
}

/**
 * Build a compact text summary of the StatementMap for LLM context injection.
 * This replaces the old regex-based "extractFinancialLineItems" with a much
 * richer structural understanding of the filing.
 */
function buildMapContextForLLM(statementMap, filingUrl, company, ticker, fiscalYear) {
  const lines = [];
  lines.push(`[STATEMENT MAP — ${company} (${ticker}) FY${fiscalYear}]`);
  lines.push(`Source: ${filingUrl}`);
  lines.push(`Available periods: ${statementMap.availablePeriods.join(', ')}`);
  lines.push(`Primary statements found: ${statementMap.meta.primaryStatements.join(', ')}`);
  lines.push('');

  for (const table of statementMap.tables) {
    const typeLabel = {
      income_statement: '📊 INCOME STATEMENT',
      balance_sheet: '📋 BALANCE SHEET',
      cash_flow: '💰 CASH FLOW STATEMENT',
      equity: '📈 STOCKHOLDERS EQUITY',
      comprehensive_income: '📑 COMPREHENSIVE INCOME',
      other: '📄 OTHER TABLE',
    }[table.statementType] || '📄 TABLE';

    lines.push(`=== ${typeLabel} (${table.tableId}) ===`);
    lines.push(`Unit: ${table.unit} | Periods: ${table.periodColumns.map(p => p.period).join(', ')}`);
    lines.push('');

    // Show all rows with their values
    for (const row of table.rows) {
      const vals = table.periodColumns.map(pc => {
        const v = row.valuesByPeriod[pc.period];
        return v !== null && v !== undefined ? String(v) : '—';
      });
      const prefix = row.isTotal ? '  **' : row.isSubtotal ? '  *' : '  ';
      const suffix = row.isTotal ? '**' : row.isSubtotal ? '*' : '';
      lines.push(`${prefix}${row.label}: ${vals.join(' | ')}${suffix}`);
    }
    lines.push('');
  }

  lines.push('=== EXTRACTION INSTRUCTIONS ===');
  lines.push('Use the EXACT row labels shown above as filing_label in the AssumptionPack.');
  lines.push('Use the table statement type as filing_section (e.g., "Consolidated Statements of Operations").');
  lines.push('Use the EXACT numeric values from the table — do NOT estimate or round.');
  lines.push(`The unit is "${statementMap.tables[0]?.unit || 'unknown'}" — include this in the unit field.`);
  lines.push('For ratios (D/E, Current Ratio, etc.), extract the RAW COMPONENTS and compute via formula.');
  lines.push(`Source ALL values from: ${filingUrl}`);
  lines.push('');

  return lines.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  parseHtmlTables,
  normalizeTable,
  buildStatementMap,
  findMetricInTable,
  extractMetricValue,
  extractMultipleMetrics,
  buildMapContextForLLM,
  METRIC_SYNONYMS,
};
