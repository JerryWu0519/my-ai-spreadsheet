# Banksheet

**AI-powered financial spreadsheet with source-traceable data from SEC filings.**

Banksheet is a spreadsheet application built for financial analysts and bankers who need to pull data from SEC 10-K filings, calculate financial ratios, and — critically — trace every number back to its exact location in the source document. It combines a full-featured spreadsheet frontend with an AI orchestration layer that understands financial statements structurally, not just by keyword search.

![Banksheet](https://img.shields.io/badge/status-alpha-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Why Banksheet](#why-banksheet)
- [Architecture Overview](#architecture-overview)
- [Frontend — Quadratic](#frontend--quadratic)
- [Middleware — Mock API Server](#middleware--mock-api-server)
- [AI Orchestration — Dual-Brain Design](#ai-orchestration--dual-brain-design)
- [Statement Mapper — Structural Financial Extraction](#statement-mapper--structural-financial-extraction)
- [Source Traceability — The Banking Feature](#source-traceability--the-banking-feature)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)

---

## Why Banksheet

Traditional spreadsheets let you type numbers. AI chatbots give you numbers without sources. Neither works for banking.

A financial analyst needs to:
1. Ask "What is Tesla's 2024 interest coverage ratio?"
2. Get the answer populated in a spreadsheet with formulas
3. Click on any input number and see **exactly where it came from** in the SEC filing
4. Verify the source document highlights the correct row in the correct financial statement

Banksheet does all four. Every data cell carries provenance metadata linking it to a specific table, row, column, and text snippet in the original filing.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (localhost:3000)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Quadratic Spreadsheet Frontend            │  │
│  │  - WebGL grid renderer (Rust/WASM)                    │  │
│  │  - React UI layer                                     │  │
│  │  - Provenance indicators (colored dots on cells)      │  │
│  │  - Source Viewer panel (inline SEC filing + highlight) │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │ HTTP (SSE streaming)               │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │            Mock API Middleware (Express.js)            │  │
│  │  - SEC EDGAR proxy & filing cache                     │  │
│  │  - Statement Mapper (structural HTML table parser)    │  │
│  │  - Filing URL resolution (CIK → accession → HTM)     │  │
│  │  - /v0/ai/chat endpoint (SSE)                        │  │
│  │  - /v0/fetch-url proxy (CORS bypass + cache)          │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │           AI Orchestration (Dual-Brain)                │  │
│  │                                                        │  │
│  │  Brain 1: PLANNER (Gemini 2.5 Flash)                  │  │
│  │  → Decomposes user request into sheet structure        │  │
│  │  → Outputs: sections, columns, metrics, formulas      │  │
│  │                                                        │  │
│  │  Brain 2: ASSUMPTIONS (Gemini 2.5 Flash)              │  │
│  │  → Extracts exact values from StatementMap context     │  │
│  │  → Outputs: values + full provenance per cell          │  │
│  │                                                        │  │
│  │  Executor: Converts plans → spreadsheet tool calls     │  │
│  │  → insertData, writeFormulas, formatCells              │  │
│  └───────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │                  External APIs                         │  │
│  │  - SEC EDGAR (EFTS search + filing HTML)              │  │
│  │  - Google Gemini 2.5 Flash (LLM)                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend — Quadratic

The frontend is built on [Quadratic](https://github.com/quadratichq/quadratic), an open-source spreadsheet with a Rust/WASM rendering engine. Banksheet extends it with:

### Provenance Indicators
Every cell that contains a sourced financial value displays a small colored dot:
- 🟢 **Green** — Value verified against source document
- 🔵 **Blue** — High confidence match
- 🟡 **Yellow** — Value present but needs manual verification
- 🔴 **Red** — Value not found in source

### Source Viewer Panel
Clicking the "Source" button on any provenance-tagged cell opens an inline panel that:
1. Loads the SEC filing HTML directly (cached from the StatementMap pre-fetch)
2. Injects a finder script that searches for the cell value in the document
3. **Validates the match** — checks that the value appears in the correct table row by scoring the row label against the expected metric name
4. Highlights the matched value and auto-scrolls to it
5. Shows match confidence and the actual document row label for transparency

### Key Frontend Files
| File | Purpose |
|------|---------|
| `SourceViewer.tsx` | Inline SEC filing viewer with value-first search algorithm |
| `ProvenanceIndicators.tsx` | Colored dot overlay on cells with source metadata |
| `provenanceTypes.ts` | TypeScript types for LocationContext (url, filingLabel, evidenceSnippet, tableId, columnLabel) |
| `aiToolsActions.ts` | Converts AI tool calls to spreadsheet operations + stores provenance |

---

## Middleware — Mock API Server

The Express.js middleware (`mockApiMiddleware.js`) handles:

### SEC EDGAR Integration
1. **Company search** — Queries EDGAR EFTS to resolve company name → CIK number
2. **Filing discovery** — Fetches filing index pages to find the primary 10-K HTM document
3. **HTML pre-fetch & cache** — Downloads the full filing HTML once and caches it in `globalThis._filingHtmlCache` so both the StatementMapper and SourceViewer can use it without re-fetching
4. **URL proxy** — `/v0/fetch-url` endpoint bypasses CORS restrictions for loading SEC filings inline, serving from cache when available

### Statement Mapper Integration
Before the LLM sees any financial data, the middleware runs `buildStatementMap()` on the cached filing HTML. This produces a structural map of every financial table in the filing, which is then formatted by `buildMapContextForLLM()` into a clean text representation that the ASSUMPTIONS brain can read.

---

## AI Orchestration — Dual-Brain Design

The AI layer uses a **two-pass architecture** where each pass has a distinct role:

### Brain 1: PLANNER
**Model:** Google Gemini 2.5 Flash  
**Input:** User's natural language request + list of existing sheets  
**Output:** JSON plan describing:
```json
{
  "goal": "Calculate Tesla's Interest Coverage Ratio for 2023 and 2024",
  "sheetName": "Tesla Interest Coverage Ratio",
  "sections": [
    {
      "name": "Inputs",
      "startCell": "A1",
      "columns": ["Metric", "2023", "2024", "Source"],
      "rows": [
        { "label": "EBIT", "type": "data", "source": "10-K" },
        { "label": "Interest Expense", "type": "data", "source": "10-K" }
      ]
    },
    {
      "name": "Outputs",
      "columns": ["Metric", "2023", "2024"],
      "rows": [
        { "label": "Interest Coverage Ratio", "type": "formula", "formula": "EBIT / Interest Expense" }
      ]
    }
  ]
}
```

The PLANNER never extracts values — it only designs the sheet structure.

### Brain 2: ASSUMPTIONS
**Model:** Google Gemini 2.5 Flash  
**Input:** The PLANNER's output + StatementMap context from the filing  
**Output:** An AssumptionPack — one entry per data cell:
```json
{
  "metric": "EBIT",
  "period": "FY2024",
  "value": 8220,
  "unit": "USD millions",
  "basis": "SOURCED",
  "filing_label": "Operating income",
  "source_url": "https://www.sec.gov/Archives/edgar/data/...",
  "evidence_snippet": "Operating income 8,220 36,852",
  "table_id": "tbl_3",
  "column_label": "2024",
  "confidence": 0.95
}
```

The ASSUMPTIONS brain has strict rules:
- **Rule 27:** Every SOURCED assumption MUST include `evidence_snippet` — the raw text from the filing row
- **Rule 28:** Must include `table_id` from the StatementMap
- **Rule 29:** Must include `column_label` matching the period column header
- **Rule 30:** `filing_label` must match the actual row label in the filing (e.g., "Operating income" not "EBIT")
- **Rule 31:** If the StatementMap doesn't contain the metric, basis must be "ESTIMATED", not "SOURCED"

### Executor
Takes the PLANNER's structure + ASSUMPTIONS' values and converts them into tool calls:
- `insertData` — Writes headers, labels, values, and source URLs
- `writeFormulas` — Creates calculation formulas (e.g., `=B3/B4`)
- `formatCells` — Applies number formatting

### Fallback
If the PLANNER or ASSUMPTIONS fail (truncated JSON, API error), the system falls back to a **direct executor** that handles the full request in a single LLM call. JSON repair (`repairJSON`) handles common truncation patterns (unclosed brackets, trailing commas).

---

## Statement Mapper — Structural Financial Extraction

The `statementMapper.js` module is the core of Banksheet's accuracy improvement over naive keyword search. It processes raw SEC filing HTML in 5 phases:

### Phase 1: HTML Table Parsing (`parseHtmlTables`)
- Extracts all `<table>` elements from the filing
- Handles `colspan`/`rowspan` attributes
- Strips empty spacer rows (common in XBRL filings)
- Filters out tables with < 2 columns or < 3 rows

### Phase 2: Header Normalization (`normalizeTable`)
- Detects multi-row headers (e.g., "Year Ended December 31" + "2024 / 2023")
- Identifies period columns by matching year patterns
- Classifies year-only rows as headers, not data
- Resolves column alignment issues from colspan mismatches

### Phase 3: Statement Classification (`classifyStatementType`)
- Scores each table against keyword sets for:
  - `income_statement` (revenue, net income, earnings per share, cost of sales...)
  - `balance_sheet` (total assets, stockholders equity, current liabilities...)
  - `cash_flow` (cash from operations, depreciation, capital expenditures...)
- Falls back to `unknown` if no strong signal

### Phase 4: Deduplication & Scoring
- Multiple tables may classify as the same statement type
- Scoring prioritizes: key metric presence > period column count > data row count
- Prevents MD&A discussion tables from being preferred over audited statements

### Phase 5: Context Generation (`buildMapContextForLLM`)
- Outputs a clean text representation:
```
=== INCOME STATEMENT (tbl_3) ===
Periods: 2024, 2023 | Unit: millions
Rows:
  Revenue: 2024=350018 | 2023=307394
  Cost of revenue: 2024=180844 | 2023=166983
  Operating income: 2024=8220 | 2023=36852
  Net income: 2024=100118 | 2023=73795
```

### Metric Synonyms
The mapper includes 25+ semantic mappings:
| Query Term | Filing Variants |
|-----------|----------------|
| Revenue | Net sales, Net revenues, Total revenues |
| EBIT | Operating income, Income from operations |
| Net Income | Net earnings, Net income attributable to |
| Total Debt | Long-term debt, Total borrowings |
| EBITDA | (Computed: Operating income + D&A) |

---

## Source Traceability — The Banking Feature

This is the feature that makes Banksheet useful for banking workflows. Every sourced value carries a full provenance chain:

### Data Flow
```
SEC Filing HTML
    → StatementMapper identifies table + row + column
    → ASSUMPTIONS brain extracts value + evidence_snippet
    → Executor writes cell + stores LocationContext
    → ProvenanceIndicator shows colored dot
    → SourceViewer loads filing + highlights exact row
```

### LocationContext (per cell)
```typescript
interface LocationContext {
  url: string;              // SEC filing URL
  filingLabel: string;      // Row label from filing ("Operating income")
  cellLabel: string;        // Metric name in spreadsheet ("EBIT")
  evidenceSnippet: string;  // Raw text from the filing row
  tableId: string;          // StatementMap table ID ("tbl_3")
  columnLabel: string;      // Period column header ("2024")
}
```

### Source Viewer Search Algorithm
The SourceViewer uses a **value-first, label-validated** search:

1. Find ALL occurrences of the cell's numeric value in the document
2. For each occurrence, extract the row label from the parent `<tr>`
3. Score how well the row label matches the expected metric (using the `evidenceSnippet` label)
4. Pick the highest-scoring match where both value AND label validate
5. Highlight and scroll to it

This prevents false matches — if "8,220" appears in both a footnote and the income statement, the algorithm picks the income statement because the row label "Operating income" matches the expected metric "EBIT".

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Spreadsheet Engine | Rust + WebAssembly (Quadratic core) |
| Grid Renderer | WebGL via pixi.js |
| Frontend UI | React 18 + TypeScript + Tailwind CSS |
| Middleware | Express.js (Node.js) |
| AI Model | Google Gemini 2.5 Flash |
| Data Source | SEC EDGAR (EFTS API + filing HTML) |
| Build Tool | Vite |
| Package Manager | npm |

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Google Gemini API key** ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Quadratic_copy.git
cd Quadratic_copy
```

### 2. Install Dependencies
```bash
cd quadratic-client
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the Application
```bash
# From the project root
./start-server.sh
```

This starts:
- **Vite dev server** on `http://localhost:3000` (frontend)
- **Express middleware** on the same port (API proxy)

### 5. Open in Browser
Navigate to `http://localhost:3000` and try:
- "Give me Tesla's 2023 and 2024 interest coverage ratio"
- "Calculate Google's debt to equity ratio for 2024"
- "Show me Amazon's revenue and net income for 2023 and 2024"

Click the **Source** button (top right) after selecting a data cell to see the inline filing viewer.

---

## Project Structure

```
Quadratic_copy/
├── start-server.sh                          # Launch script
├── quadratic-client/
│   ├── src/
│   │   ├── mock-api/
│   │   │   ├── mockApiMiddleware.js         # Express middleware (SEC proxy, AI chat, filing cache)
│   │   │   ├── roleOrchestrator.js          # Dual-brain AI orchestration (PLANNER + ASSUMPTIONS)
│   │   │   └── statementMapper.js           # Structural HTML table parser for financial statements
│   │   ├── app/
│   │   │   ├── ai/
│   │   │   │   └── tools/
│   │   │   │       └── aiToolsActions.ts    # Tool call executor + provenance storage
│   │   │   ├── provenance/
│   │   │   │   └── provenanceTypes.ts       # TypeScript types for source traceability
│   │   │   └── ui/
│   │   │       └── menus/
│   │   │           └── SourceViewer/
│   │   │               └── SourceViewer.tsx # Inline SEC filing viewer with auto-locate
│   │   └── shared/
│   │       └── utils/
│   │           └── Uint8Array.ts            # Safe JSON parse for render worker
│   └── .env.local                           # API keys (gitignored)
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for LLM calls |

---

## Known Limitations

1. **SEC EDGAR only** — Currently supports US public company 10-K filings. No support for 10-Q, 8-K, or non-US filings yet.
2. **XBRL table parsing** — Some XBRL-heavy filings wrap values in `<ix:nonFraction>` tags that can break text node highlighting. The SourceViewer has fallbacks but highlighting may be imprecise.
3. **Rate limiting** — SEC EDGAR enforces a 10 requests/second limit. The middleware adds a `User-Agent` header but does not implement request throttling.
4. **LLM hallucination** — Despite the StatementMap providing real values, the LLM may occasionally return values not in the filing. The confidence scoring in the SourceViewer catches most of these cases.
5. **Single filing per query** — Multi-year queries spanning different annual filings (e.g., 2020-2024) currently only fetch the most recent filing, which contains 2 years of comparative data.
6. **No authentication** — The middleware runs locally with no auth layer. Not suitable for production deployment without adding authentication.

---

## License

This project is built on [Quadratic](https://github.com/quadratichq/quadratic) (MIT License). All additions are also MIT licensed.
