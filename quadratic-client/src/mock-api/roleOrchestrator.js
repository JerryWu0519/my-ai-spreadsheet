/**
 * Role Orchestrator — 3-Role Agent Runtime for BankSheet
 *
 * Implements a PLANNER → ASSUMPTIONS → EXECUTOR pipeline:
 *
 *   1. PLANNER (strong model):  Produces a SheetPlan JSON describing what to
 *      build (sections, ranges, tables, formatting, tool-call sequence).
 *      NOT allowed to call spreadsheet-mutating tools.
 *
 *   2. ASSUMPTIONS (strong model):  Given the SheetPlan + source data, produces
 *      an AssumptionPack JSON.  Every numeric driver is classified as
 *      GIVEN / SOURCED / ASSUMED.  Assumed values get rationale + base/bull/bear.
 *      NOT allowed to call spreadsheet-mutating tools.
 *
 *   3. EXECUTOR (fast/cheap model):  Receives SheetPlan + AssumptionPack and
 *      calls spreadsheet tools to write cells.  It is the ONLY role that can
 *      mutate the sheet.  After execution, a validation pass detects #SPILL,
 *      #REF, overwrites, missing provenance, and triggers targeted repair.
 *
 * The orchestrator is called by the middleware INSTEAD of the direct Gemini call.
 * It produces the same SSE response format the client expects.
 *
 * Provider support: Gemini + OpenAI, controlled by env config.
 */

// ============================================================================
// FETCH WITH RETRY — handles slow-network connect timeouts
// ============================================================================

async function fetchWithRetry(url, options = {}, { retries = 3, baseDelay = 2000, timeout = 60000, label = 'fetch' } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = err.name === 'AbortError' || /timeout|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(err.message) || (err.cause && /timeout|ETIMEDOUT/i.test(err.cause.message));
      if (isTimeout && attempt < retries) {
        const delay = baseDelay * attempt;
        console.log(`[orchestrator] ${label} attempt ${attempt}/${retries} timed out, retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

// ============================================================================
// JSON CONTRACTS (TypeDoc-style for reference; enforced via system prompts)
// ============================================================================

/**
 * @typedef {Object} SheetPlanSection
 * @property {string} name - Section name, e.g. "Inputs", "Revenue Model", "Output"
 * @property {string} startCell - Top-left cell reference, e.g. "A1"
 * @property {string} endCell - Bottom-right cell reference, e.g. "D10"
 * @property {'inputs'|'model'|'output'|'metadata'|'chart'} type
 * @property {string[]} headers - Column or row headers
 * @property {string} [description] - Purpose of this section
 */

/**
 * @typedef {Object} SheetPlanToolStep
 * @property {string} tool - Tool name from aiToolsSpec, e.g. "set_cell_values"
 * @property {Object} args - Pre-filled arguments (may reference $assumptions.*)
 * @property {string} rationale - Why this step is needed
 * @property {number} order - Execution order (1-based)
 * @property {string[]} [dependsOn] - Tool step IDs this depends on
 */

/**
 * @typedef {Object} SheetPlan
 * @property {string} goal - One-sentence description of what the sheet will contain
 * @property {string} sheetName - Name for the new or target sheet
 * @property {SheetPlanSection[]} sections - Layout sections
 * @property {SheetPlanToolStep[]} toolSteps - Ordered tool calls
 * @property {Object} formatting - Formatting directives (bold headers, number formats, etc.)
 * @property {string[]} formulaStrategies - Which cells use formulas vs. literals
 */

/**
 * @typedef {Object} AssumptionEntry
 * @property {string} name - e.g. "Revenue Growth Rate"
 * @property {'GIVEN'|'SOURCED'|'ASSUMED'} classification
 * @property {number|string} baseValue - Base-case value
 * @property {number|string} [bullValue] - Bull-case value (required if ASSUMED)
 * @property {number|string} [bearValue] - Bear-case value (required if ASSUMED)
 * @property {string} rationale - Why this value was chosen
 * @property {string} [sourceUrl] - URL if SOURCED
 * @property {string} [sourceSnippet] - Text excerpt if SOURCED
 * @property {string} cellRef - Where this will be written, e.g. "B3"
 * @property {string} unit - Unit of measurement, e.g. "millions USD", "%"
 * @property {string} [filing_label] - Exact line-item text from the filing
 * @property {string} [filing_section] - Financial statement name
 * @property {string} [filing_note] - Explanation when label differs
 * @property {string} [evidence_snippet] - Exact row text from the filing table
 * @property {string} [table_id] - Table identifier from StatementMap
 * @property {string} [column_label] - Period/year column label
 */

/**
 * @typedef {Object} AssumptionPack
 * @property {AssumptionEntry[]} assumptions
 * @property {string} methodology - Brief description of analytical approach
 * @property {string[]} dataSources - List of sources consulted
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} passed
 * @property {Object[]} issues - List of issues found
 * @property {string} issues[].type - 'SPILL'|'REF_ERROR'|'OVERWRITE'|'MISSING_PROVENANCE'|'UNIT_MISMATCH'
 * @property {string} issues[].cell - Cell reference
 * @property {string} issues[].message - Human-readable description
 * @property {Object} [repair] - Repair instructions if issues found
 */

// ============================================================================
// SYSTEM PROMPTS FOR EACH ROLE
// ============================================================================

const PLANNER_SYSTEM_PROMPT = `You are the PLANNER role in a 3-role AI spreadsheet agent.

YOUR TASK: Given a user request and spreadsheet context, produce a SheetPlan JSON that describes EXACTLY what to build — sections, layout, tool calls, formatting — WITHOUT executing anything.

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no explanation) matching this schema:
{
  "goal": "one-sentence description",
  "sheetName": "Sheet Name",
  "sections": [
    {
      "name": "Section Name",
      "startCell": "A1",
      "endCell": "D10",
      "type": "inputs|model|output|metadata",
      "headers": ["Col1", "Col2"],
      "description": "purpose"
    }
  ],
  "toolSteps": [
    {
      "tool": "tool_name_from_spec",
      "args": { /* pre-filled arguments */ },
      "rationale": "why this step",
      "order": 1
    }
  ],
  "formatting": {
    "headerBold": true,
    "numberFormat": "$#,##0",
    "percentFormat": "0.0%",
    "columnWidths": {}
  },
  "formulaStrategies": [
    "B5 uses =B3*B4 (revenue = units * price)",
    "D2:D10 uses SUM formulas"
  ]
}

RULES:
1. NEVER call spreadsheet tools yourself. You only PLAN.
2. The "Inputs" section MUST be the first section, containing all assumptions and sourced data.
3. Every output cell that depends on a numeric assumption MUST use a formula referencing the Inputs section — NO hardcoded numbers in the model/output sections.
4. Label every input row as "Assumption", "Sourced", or "Given" in a dedicated column.
5. Include a "Sources" metadata section listing all data sources used.
6. Tool steps should use set_cell_values for data, set_formula_cell_value for formulas, and appropriate formatting tools.
7. Plan compact, professional layouts — avoid excessive whitespace.
8. When the user asks for multi-year data, create a clean table with years as columns.
9. The plan MUST account for the current state of the spreadsheet (existing sheets, data, etc.).

CRITICAL — RATIO DECOMPOSITION:
10. When the user asks for ANY financial ratio or metric (Debt-to-Equity, Current Ratio, ROE, ROA, Interest Coverage, etc.), you MUST plan to extract the RAW COMPONENTS from the source filing, NOT the pre-computed ratio.
  - Debt-to-Equity → needs Total Debt and Total Stockholders' Equity as separate Inputs rows
  - Current Ratio → needs Total Current Assets and Total Current Liabilities
  - ROE → needs Net Income and Total Stockholders' Equity
  - ROA → needs Net Income and Total Assets
  - Interest Coverage → needs EBIT and Interest Expense
11. The ratio itself MUST be computed via a FORMULA cell (e.g., =B3/B4), NEVER a hardcoded lookup.
12. All raw component data MUST come from SEC EDGAR 10-K filings when available. The source column must show the filing URL.
13. If SEC EDGAR source data is provided in the context, use those exact extracted numbers — do NOT search the web for them.
14. NEVER plan a web search for a ratio that can be calculated from available 10-K data.

CRITICAL — FORMATTING & UNITS:
15. ONLY format cells as PERCENTAGE (%) when the value represents a rate, ratio, growth rate, or margin (e.g., Revenue Growth 19.9%, Debt-to-Equity 0.18).
16. NEVER format Revenue, Net Income, Total Assets, Total Debt, EBIT, Interest Expense, or ANY dollar/monetary value as percentage. Use number format or currency format for dollar amounts.
17. When planning formatCells steps, EXPLICITLY separate percentage cells from dollar-amount cells into DIFFERENT formatCells calls with different formats.
18. The formatCells percentage format MUST only target the exact cells containing ratios or growth rates — NEVER entire columns that also contain dollar amounts.

CRITICAL — EXPLICIT UNITS IN CELLS:
22. ALWAYS include a dedicated "Units" row (row 2, right after headers) OR append the unit to each column header in parentheses, e.g. "2023 ($M)" or "2024 ($ millions)". The user MUST see what units the numbers are in directly in the sheet.
23. All monetary values in the same table MUST use the SAME unit scale. If a 10-K reports in millions, show ALL values in millions. If you convert to billions, convert ALL values consistently. NEVER mix units within a table.
24. For a dedicated Units row: write it BEFORE writing data values. Example: A2="Units", B2="$ millions", C2="$ millions". Then data starts in row 3.
25. For header-based units: write headers like ["Metric", "2023 ($M)", "2024 ($M)", "Source"] so units are immediately visible.
26. The data and the unit label must match exactly. If the filing reports revenue as 307,394 in millions, write 307394 and label the unit as "$ millions" — do NOT write 307.394 and label it "$ billions" unless you explicitly convert ALL values.

CRITICAL — FORMULA PLANNING:
27. Calculated rows (ratios, growth rates) MUST be written using set_formula_cell_value as a SEPARATE tool step AFTER all data cells are written. NEVER embed formulas inside set_cell_values arrays.
28. When planning formulas, use the EXACT cell references where data will be written. For example, if EBIT is in B3 and Interest Expense is in B4, the Interest Coverage formula at B5 should be =B3/B4. Double-check row numbers match.
29. ALWAYS plan to write data cells FIRST (set_cell_values), THEN write formulas (set_formula_cell_value) in a separate subsequent step. This ensures the referenced cells exist before the formula is evaluated.

CRITICAL — MULTI-YEAR DATA:
19. When the user asks for multi-year data (e.g., "recent 3 years"), a single 10-K filing contains COMPARATIVE data for the current year AND prior year(s). Extract ALL years from the SAME filing — do NOT use web search for prior year data.
20. Every original data cell for every year MUST be sourced from the official 10-K filing. The source column must show "SEC 10-K" for ALL years, NEVER "Web Search" for any year if the data exists in the filing.
21. If a specific year's data truly cannot be found in the 10-K filing, explicitly mark the source as "Not available in 10-K" and explain why.`;

const ASSUMPTIONS_SYSTEM_PROMPT = `You are the ASSUMPTIONS role in a 3-role AI spreadsheet agent.

YOUR TASK: Given a SheetPlan and source data context, produce an AssumptionPack JSON that classifies every numeric driver.

OUTPUT FORMAT: You must respond with ONLY a valid JSON object (no markdown, no explanation) matching this schema:
{
  "assumptions": [
    {
      "name": "Driver Name",
      "classification": "GIVEN|SOURCED|ASSUMED",
      "baseValue": 42000,
      "bullValue": 48000,
      "bearValue": 36000,
      "rationale": "Based on 5-year CAGR of 8%...",
      "sourceUrl": "https://...",
      "sourceSnippet": "Revenue was $42B in FY2024",
      "cellRef": "B3",
      "unit": "millions USD",
      "filing_label": "Total revenues",
      "filing_section": "Consolidated Statements of Operations",
      "filing_note": "",
      "evidence_snippet": "Total revenues: 97,690 | 81,462",
      "table_id": "table_1_income_statement",
      "column_label": "2024"
    }
  ],
  "methodology": "DCF with 3-stage growth model",
  "dataSources": ["SEC EDGAR 10-K FY2024", "Company press release"]
}

CLASSIFICATION RULES:
- GIVEN: Values explicitly stated in the user's request (e.g., "assume 5% growth")
- SOURCED: Values extracted from source documents (10-K, web data). MUST include sourceUrl and sourceSnippet.
- ASSUMED: Values you estimate because they aren't available. MUST include baseValue + bullValue + bearValue + rationale.

RULES:
1. NEVER call spreadsheet tools. You only classify and validate assumptions.
2. Every numeric value that will be written to the Inputs section MUST appear in the assumptions array.
3. ASSUMED values MUST have bull/bear ranges — no single-point estimates without ranges.
4. SOURCED values MUST cite the exact source URL and a text snippet from the filing.
5. Never silently assume — if you must estimate, say so explicitly.
6. Units must be consistent across related assumptions (don't mix millions and billions).
7. Rationale should be 1-2 sentences explaining the reasoning.

CRITICAL — 10-K FIRST POLICY:
8. For public companies, ALWAYS prefer SEC EDGAR 10-K filing data over web search results.
9. When SEC EDGAR source data is provided in the context (extracted financial line items), use those EXACT numbers for SOURCED entries.
10. For financial ratios: classify the RAW COMPONENTS (Total Debt, Total Equity, etc.) as SOURCED from the 10-K — NOT the pre-computed ratio.
11. Every SOURCED entry MUST have sourceUrl pointing to the actual SEC EDGAR filing document (e.g., https://www.sec.gov/Archives/edgar/data/...).
12. sourceSnippet must quote the relevant text from the filing that contains the number.
13. If the 10-K data is available but a specific value is missing, mark it ASSUMED with rationale explaining why it was estimated.

CRITICAL — MULTI-YEAR SOURCING:
14. A 10-K filing contains COMPARATIVE financial data for both the current year AND prior year(s). When classifying multi-year data, ALL years' data from the same filing should be SOURCED with the same filing URL.
15. NEVER classify a prior-year value as needing web search when it appears in the comparative tables of the same 10-K filing.
16. For each SOURCED value, set the sourceSnippet to quote text that includes the EXACT number as it appears in the filing (e.g., "total revenues of $97.69 billion" or "81,462" from a table).

CRITICAL — UNITS:
17. The "unit" field must accurately reflect what the value represents: "millions USD" for dollar amounts in millions, "billions USD" for billions, "%" only for rates/ratios/growth.
18. NEVER set unit to "%" for Revenue, Net Income, Total Debt, Total Assets, EBIT, Interest Expense, or any monetary value.
19. ALL monetary values in a single analysis MUST use the SAME unit scale (all millions, or all billions). Never mix.
20. The unit field value must match what will be displayed in the Units row in the sheet. If you classify a value as "millions USD", the sheet Units row must say "$ millions".

CRITICAL — DEEP TRACEABILITY (filing_label, filing_section, filing_note):
21. For every SOURCED assumption, you MUST set "filing_label" to the EXACT line-item text as it appears in the SEC filing. Example: if the filing says "Operating income" but the user asks for EBIT, set name="EBIT" and filing_label="Operating income".
22. Set "filing_section" to the name of the financial statement or note where the number appears (e.g., "Consolidated Statements of Operations", "Balance Sheet", "Note 5 — Debt").
23. If the cell label (name) differs from the filing label, set "filing_note" to a brief explanation. Example: filing_note="EBIT corresponds to Operating income as reported. Amazon does not separately report depreciation above the operating line."
24. If the filing label matches the cell label exactly, set filing_note to "" (empty string).
25. NEVER leave filing_label empty for SOURCED values. Search the filing text carefully for the exact label used.
26. The filing_label is used for deep traceability — it navigates the user to the EXACT line item in the source document. Getting it wrong means the user sees the wrong section of the filing.

CRITICAL — EVIDENCE SNIPPET & TABLE CONTEXT:
27. For every SOURCED assumption, you MUST set "evidence_snippet" to the EXACT text of the table row from the Statement Map that contains this value. Format: "Row Label: Value1 | Value2 | ..." — copy the row exactly as it appears in the Statement Map context.
28. Set "table_id" to the table identifier from the Statement Map (e.g., "table_1_income_statement", "table_2_balance_sheet").
29. Set "column_label" to the period/year column from which the value was extracted (e.g., "2024", "2023").
30. The evidence_snippet enables the Source Viewer to do EXACT text matching in the filing document — getting it right means the user sees the EXACT row highlighted. Getting it wrong means a failed or incorrect match.
31. NEVER leave evidence_snippet empty for SOURCED values. If the Statement Map shows the row, copy it. If you cannot find the exact row, set evidence_snippet to the closest matching row text.`;

const EXECUTOR_SYSTEM_PROMPT_PREFIX = `You are the EXECUTOR role in a 3-role AI spreadsheet agent.

YOUR TASK: Execute the SheetPlan and AssumptionPack by calling spreadsheet tools to write cells. You are the ONLY role that can mutate the sheet.

RULES:
1. Follow the SheetPlan tool steps IN ORDER. Do not skip steps or add extra ones unless needed for repair.
2. Every assumption value must be written to the Inputs section, with a label column indicating "Assumption", "Sourced", or "Given".
3. Every model/output cell that depends on a numeric input MUST use a formula (set_formula_cell_value) referencing the Inputs section — NEVER hardcode numbers in output cells.
4. After all writes, verify that no #SPILL or #REF errors exist. If they do, fix them.
5. Keep responses minimal — call tools, don't explain unless there's an error.
6. If the SheetPlan references $assumptions.*, look up the value from the AssumptionPack.

CRITICAL — SOURCE ENFORCEMENT:
7. Every cell containing raw financial data (SOURCED in AssumptionPack) MUST include _sourceUrls metadata pointing to the SEC EDGAR filing.
8. For ratios: write the raw components as literal values in the Inputs section, then use set_formula_cell_value to compute the ratio (e.g., =B3/B4). NEVER write a pre-computed ratio as a hardcoded number.
9. Include a Source column in the Inputs section showing the filing URL for each SOURCED value.
10. If the AssumptionPack includes sourceUrl for a value, pass it through in the tool call arguments.

DATA VERIFICATION:
11. After writing all inputs, use get_cell_values to read back the written data and verify:
  - Each number matches the AssumptionPack's baseValue for that entry
  - No #SPILL, #REF, #VALUE, or #NAME errors exist in formula cells
  - The Inputs section has classification labels (Given/Sourced/Assumed)
  - Every SOURCED row has a valid source URL in the Source column
12. If any verification fails, make targeted repair tool calls.
13. Report verification results: "Verified: N values cross-checked against 10-K filing" or list discrepancies.

CRITICAL — FORMATTING & UNITS:
14. ONLY apply percentage format (%) to cells that represent rates, ratios, or growth rates.
15. NEVER apply percentage format to Revenue, Net Income, Total Assets, Total Debt, EBIT, Interest Expense, or ANY monetary value. These must use number format (e.g., "$#,##0" or "#,##0").
16. When calling formatCells, DOUBLE CHECK the cell range — if the range includes both dollar amounts and growth rates, split into TWO separate formatCells calls with different formats.
17. Before applying any percentage format, verify the cell value is actually a ratio/rate (between -1 and 1, or 0 and 100). If the value is in billions (like 97.69), it's a DOLLAR amount, NOT a percentage.
18. For revenue values in billions: write the numeric value (e.g., 97.69) and use number format "#,##0.00" — NEVER percentage.

CRITICAL — EXPLICIT UNITS IN SHEET:
22. ALWAYS include a dedicated "Units" row (immediately after headers) OR append units to column headers (e.g., "2023 ($M)") so the user can immediately see what unit the numbers are in.
23. All monetary values in the same table MUST use the SAME unit scale. NEVER mix millions and billions in one table.
24. The unit label must match the actual numbers. If the filing reports revenue as 307,394 in millions, show 307,394 and label "$ millions".

CRITICAL — FORMULA EXECUTION ORDER:
25. ALWAYS write all data cells (set_cell_values) FIRST. Then write formula cells (set_formula_cell_value) in a SEPARATE subsequent tool call.
26. NEVER embed formula strings (starting with =) inside set_cell_values arrays. Formulas must ALWAYS use set_formula_cell_value.
27. When writing formulas, verify the cell references point to the CORRECT rows. Count rows carefully: if Headers are row 1, Units are row 2, EBIT is row 3, Interest Expense is row 4, then Interest Coverage = =B3/B4.
28. After writing formulas, use get_cell_values to read back the formula result cells. If they show #REF, #VALUE, #NAME, or #SPILL errors, diagnose and rewrite the formula with corrected cell references.

CRITICAL — MULTI-YEAR SOURCING:
19. For multi-year queries, ALL years' data should come from the 10-K filing. The filing contains comparative data for prior years.
20. The Source column must show "SEC 10-K" for EVERY year's original data — NEVER "Web Search" for any year that appears in the filing.
21. If a value for a specific year truly cannot be found in the filing, explicitly state in the Source column: "Not in 10-K — [alternative source]".

VALIDATION AFTER EXECUTION:
After completing all tool steps, perform a self-check:
- Use get_cell_values or read relevant cells to verify no #SPILL, #REF, #VALUE, or #NAME errors
- Verify that the Inputs section has classification labels (Given/Sourced/Assumed)
- VERIFY no percentage format was applied to dollar-amount cells (revenue, income, assets)
- If any issues are found, make targeted repair tool calls (don't rebuild the entire sheet)
- Report "Validation passed" or list issues found and repairs made
YOU WILL NOW RECEIVE THE PLAN AND ASSUMPTIONS:
`;

const VALIDATION_PROMPT = `You are validating a spreadsheet that was just built. Check for:
1. #SPILL errors (array formula conflicts)
2. #REF errors (broken references)
3. Overwritten data (cells that had data before and were replaced)
4. Missing provenance (sourced values without source metadata)
5. Unit inconsistencies (mixing millions/billions, USD/EUR, etc.)
6. Hardcoded numbers in output sections (should be formulas)

If any issues found, produce ONLY the repair tool calls needed to fix them.
If no issues, respond with "Validation passed — no issues found."`;

// ============================================================================
// PROVIDER ABSTRACTION
// ============================================================================

/**
 * Call a model and get a structured (non-streaming) response.
 * @param {'gemini'|'openai'} provider
 * @param {Object} config - { apiKey, model }
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {Object} [options] - { temperature, maxTokens, jsonMode }
 * @returns {Promise<string>} The model's text response
 */
async function callModel(provider, config, systemPrompt, userMessage, options = {}) {
  const { temperature = 0.2, maxTokens = 8192, jsonMode = true } = options;

  if (provider === 'openai') {
    return callOpenAI(config, systemPrompt, userMessage, { temperature, maxTokens, jsonMode });
  } else {
    return callGemini(config, systemPrompt, userMessage, { temperature, maxTokens, jsonMode });
  }
}

async function callOpenAI(config, systemPrompt, userMessage, options) {
  const { temperature, maxTokens, jsonMode } = options;
  const url = 'https://api.openai.com/v1/chat/completions';

  const body = {
    model: config.model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  let apiRes;
  try {
    apiRes = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    }, { retries: 3, timeout: 90000, label: 'OpenAI' });
  } catch (fetchErr) {
    console.error('[orchestrator] OpenAI fetch network error:', fetchErr.message, fetchErr.cause || '');
    throw new Error(`OpenAI fetch failed: ${fetchErr.message}${fetchErr.cause ? ' — ' + fetchErr.cause.message : ''}`);
  }

  if (!apiRes.ok) {
    const errText = await apiRes.text().catch(() => '(body unreadable)');
    console.error('[orchestrator] OpenAI API error:', apiRes.status, errText.slice(0, 300));
    throw new Error(`OpenAI API error (${apiRes.status}): ${errText.slice(0, 300)}`);
  }

  const data = await apiRes.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(config, systemPrompt, userMessage, options) {
  const { temperature, maxTokens, jsonMode } = options;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.0-flash'}:generateContent?key=${config.apiKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };

  let apiRes;
  try {
    apiRes = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, { retries: 3, timeout: 90000, label: 'Gemini' });
  } catch (fetchErr) {
    console.error('[orchestrator] Gemini fetch network error:', fetchErr.message, fetchErr.cause || '');
    throw new Error(`Gemini fetch failed: ${fetchErr.message}${fetchErr.cause ? ' — ' + fetchErr.cause.message : ''}`);
  }

  if (!apiRes.ok) {
    const errText = await apiRes.text().catch(() => '(body unreadable)');
    console.error('[orchestrator] Gemini API error:', apiRes.status, errText.slice(0, 300));
    throw new Error(`Gemini API error (${apiRes.status}): ${errText.slice(0, 300)}`);
  }

  const data = await apiRes.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || '').join('');
}

/**
 * Stream a model response as SSE (for the EXECUTOR role).
 * Writes directly to the HTTP response object.
 * @param {'gemini'|'openai'} provider
 * @param {Object} config
 * @param {string} systemPrompt
 * @param {Array} geminiContents - Full conversation in Gemini format
 * @param {Object} geminiTools - Tool declarations
 * @param {Object} geminiToolConfig
 * @param {Object} res - HTTP response to stream to
 * @param {string} modelKey - For response metadata
 * @returns {Promise<{text: string, toolCalls: Array}>}
 */
async function streamExecutor(provider, config, systemPrompt, geminiContents, geminiTools, geminiToolConfig, res, modelKey) {
  if (provider === 'openai') {
    return streamOpenAIExecutor(config, systemPrompt, geminiContents, geminiTools, res, modelKey);
  } else {
    return streamGeminiExecutor(config, systemPrompt, geminiContents, geminiTools, geminiToolConfig, res, modelKey);
  }
}

async function streamGeminiExecutor(config, systemPrompt, contents, tools, toolConfig, res, modelKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.0-flash'}:streamGenerateContent?alt=sse&key=${config.apiKey}`;
  const body = {
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
    tools,
    toolConfig,
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  const geminiRes = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, { retries: 3, timeout: 120000, label: 'GeminiStream' });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    throw new Error(`Gemini executor error (${geminiRes.status}): ${errText}`);
  }

  // Only set headers if not already sent (runOrchestrator sets them before calling us)
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.statusCode = 200;
  }

  let accumulatedText = '';
  let accumulatedToolCalls = [];
  const reader = geminiRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  function processChunk(jsonStr) {
    try {
      const chunk = JSON.parse(jsonStr);
      const candidate = chunk?.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      for (const part of parts) {
        if (part.text) accumulatedText += part.text;
        if (part.functionCall) {
          accumulatedToolCalls.push({
            id: part.functionCall.name + '_' + Date.now() + '_' + accumulatedToolCalls.length,
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args || {}),
            loading: false,
          });
        }
      }
      const content = accumulatedText ? [{ type: 'text', text: accumulatedText }] : [];
      res.write(`data: ${JSON.stringify({
        role: 'assistant',
        content,
        contextType: 'userPrompt',
        toolCalls: accumulatedToolCalls,
        modelKey,
        isOnPaidPlan: true,
        exceededBillingLimit: false,
      })}\n\n`);
    } catch (e) { /* skip malformed */ }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr) processChunk(jsonStr);
        }
      }
    }
    if (buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      if (jsonStr) processChunk(jsonStr);
    }
  } finally {
    reader.releaseLock();
  }

  return { text: accumulatedText, toolCalls: accumulatedToolCalls };
}

async function streamOpenAIExecutor(config, systemPrompt, geminiContents, geminiTools, res, modelKey) {
  // Convert Gemini contents to OpenAI messages format
  const messages = [{ role: 'system', content: systemPrompt }];
  for (const msg of geminiContents) {
    const role = msg.role === 'model' ? 'assistant' : 'user';
    const textParts = (msg.parts || []).filter(p => p.text).map(p => p.text).join('\n');
    const functionCalls = (msg.parts || []).filter(p => p.functionCall);
    const functionResponses = (msg.parts || []).filter(p => p.functionResponse);

    if (functionResponses.length > 0) {
      // Tool results
      for (const fr of functionResponses) {
        messages.push({
          role: 'tool',
          tool_call_id: fr.functionResponse.name,
          content: typeof fr.functionResponse.response === 'string'
            ? fr.functionResponse.response
            : JSON.stringify(fr.functionResponse.response),
        });
      }
    } else if (functionCalls.length > 0) {
      // Assistant with tool calls
      const toolCallsForOpenAI = functionCalls.map((fc, i) => ({
        id: fc.functionCall.name + '_' + i,
        type: 'function',
        function: {
          name: fc.functionCall.name,
          arguments: JSON.stringify(fc.functionCall.args || {}),
        },
      }));
      messages.push({
        role: 'assistant',
        content: textParts || null,
        tool_calls: toolCallsForOpenAI,
      });
    } else if (textParts) {
      messages.push({ role, content: textParts });
    }
  }

  // Convert Gemini tool declarations to OpenAI tools format
  const tools = (geminiTools || []).filter(t => t.functionDeclarations).flatMap(t =>
    t.functionDeclarations.map(fd => ({
      type: 'function',
      function: {
        name: fd.name,
        description: fd.description || '',
        parameters: convertGeminiSchemaToJsonSchema(fd.parameters || {}),
      },
    }))
  );

  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: config.model || 'gpt-4o',
    messages,
    temperature: 0.3,
    max_tokens: 8192,
    stream: true,
  };
  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const openaiRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    throw new Error(`OpenAI executor error (${openaiRes.status}): ${errText}`);
  }

  // Only set headers if not already sent (runOrchestrator sets them before calling us)
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.statusCode = 200;
  }

  let accumulatedText = '';
  let accumulatedToolCalls = [];
  let currentToolCalls = {}; // id -> {name, arguments}
  const reader = openaiRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  function processOpenAIChunk(jsonStr) {
    if (jsonStr === '[DONE]') return;
    try {
      const chunk = JSON.parse(jsonStr);
      const delta = chunk?.choices?.[0]?.delta;
      if (!delta) return;

      if (delta.content) {
        accumulatedText += delta.content;
      }
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!currentToolCalls[idx]) {
            currentToolCalls[idx] = { id: tc.id || `tool_${idx}`, name: '', arguments: '' };
          }
          if (tc.function?.name) currentToolCalls[idx].name = tc.function.name;
          if (tc.function?.arguments) currentToolCalls[idx].arguments += tc.function.arguments;
        }
      }

      // Rebuild accumulated tool calls from currentToolCalls
      accumulatedToolCalls = Object.values(currentToolCalls)
        .filter(tc => tc.name)
        .map(tc => ({
          id: tc.id || tc.name + '_' + Date.now(),
          name: tc.name,
          arguments: tc.arguments,
          loading: false,
        }));

      const content = accumulatedText ? [{ type: 'text', text: accumulatedText }] : [];
      res.write(`data: ${JSON.stringify({
        role: 'assistant',
        content,
        contextType: 'userPrompt',
        toolCalls: accumulatedToolCalls,
        modelKey,
        isOnPaidPlan: true,
        exceededBillingLimit: false,
      })}\n\n`);
    } catch (e) { /* skip malformed */ }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr) processOpenAIChunk(jsonStr);
        }
      }
    }
    if (buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      if (jsonStr) processOpenAIChunk(jsonStr);
    }
  } finally {
    reader.releaseLock();
  }

  return { text: accumulatedText, toolCalls: accumulatedToolCalls };
}

/**
 * Convert Gemini Schema format back to JSON Schema (for OpenAI).
 */
function convertGeminiSchemaToJsonSchema(geminiSchema) {
  if (!geminiSchema) return {};
  const typeMap = { STRING: 'string', NUMBER: 'number', BOOLEAN: 'boolean', NULL: 'null', OBJECT: 'object', ARRAY: 'array', INTEGER: 'integer' };

  const result = {};
  if (geminiSchema.type) result.type = typeMap[geminiSchema.type] || geminiSchema.type.toLowerCase();
  if (geminiSchema.description) result.description = geminiSchema.description;
  if (geminiSchema.enum) result.enum = geminiSchema.enum;
  if (geminiSchema.nullable) result.nullable = true;

  if (geminiSchema.properties) {
    result.properties = {};
    for (const [key, val] of Object.entries(geminiSchema.properties)) {
      result.properties[key] = convertGeminiSchemaToJsonSchema(val);
    }
  }
  if (geminiSchema.required) result.required = geminiSchema.required;
  if (geminiSchema.items) result.items = convertGeminiSchemaToJsonSchema(geminiSchema.items);
  if (geminiSchema.anyOf) result.anyOf = geminiSchema.anyOf.map(convertGeminiSchemaToJsonSchema);

  return result;
}

// ============================================================================
// ORCHESTRATOR STATE MACHINE
// ============================================================================

/**
 * @typedef {'INIT'|'PLANNING'|'ASSUMPTIONS'|'EXECUTING'|'VALIDATING'|'REPAIRING'|'DONE'|'ERROR'|'PASSTHROUGH'} OrchestratorState
 */

// Global state: persists across tool-call iterations
if (!globalThis._orchestratorState) {
  globalThis._orchestratorState = new Map(); // chatId -> { state, sheetPlan, assumptionPack, validationResult }
}

/**
 * Get or create orchestrator state for a chat session.
 */
function getOrchestratorState(chatId) {
  if (!globalThis._orchestratorState.has(chatId)) {
    globalThis._orchestratorState.set(chatId, {
      state: 'INIT',
      sheetPlan: null,
      assumptionPack: null,
      validationResult: null,
      executionCount: 0,
    });
  }
  return globalThis._orchestratorState.get(chatId);
}

/**
 * Determine whether a user query should use the 3-role pipeline or passthrough.
 * The 3-role pipeline is activated for data-creation queries (financial analysis,
 * building tables/models).  Simple questions, formatting, or code changes are
 * passed through directly to the existing pipeline.
 */
function shouldUseRolePipeline(userQuery) {
  if (!userQuery || userQuery.length < 10) return false;

  // Patterns that indicate a structured data-creation task
  const creationPatterns = [
    /\b(build|create|make|construct|design)\b.*\b(model|table|sheet|spreadsheet|analysis|dashboard|report)\b/i,
    /\b(debt.to.equity|dcf|valuation|p[\/&]l|income.statement|balance.sheet|cash.flow)\b/i,
    /\b(revenue|income|ebit|profit|margin|ratio|earnings)\b.*\b(calcul|analys|model|compar|forecast|project)\b/i,
    /\b(financial|fiscal)\b.*\b(data|analysis|model|statement|report)\b/i,
    /\b(10-k|10k|annual.report|sec.filing)\b/i,
    /\b(assumption|scenario|sensitivity|bull.*bear|base.*case)\b/i,
    /\b(populate|fill.in|extract.*data|pull.*data|get.*data)\b.*\b(from|into)\b/i,
    // Ratio / metric queries for public companies
    /\b(debt.to.equity|current.ratio|quick.ratio|interest.coverage|roe|roa|roic|pe.ratio|p.e.ratio|ev.ebitda)\b/i,
    /\b(ratio|metric|multiple)\b.*\b(in.sheet|in.spreadsheet|to.sheet|on.sheet)\b/i,
    /\b(give|show|get|find|fetch|pull)\b.*\b(ratio|debt|equity|revenue|income|ebit|assets|liabilities)\b/i,
    /\b(ratio|debt|equity|revenue|income|ebit)\b.*\b(give|show|get|find|fetch|pull|in.sheet|in.spreadsheet)\b/i,
    // Direct financial data queries
    /\b(tesla|apple|google|alphabet|microsoft|amazon|meta|nvidia|netflix|jpmorgan|coca.cola|walmart|disney|boeing|berkshire|goldman|pepsi)\b.*\b(debt|equity|revenue|income|ratio|balance|financial)\b/i,
    /\b(debt|equity|revenue|income|ratio|balance|financial)\b.*\b(tesla|apple|google|alphabet|microsoft|amazon|meta|nvidia|netflix|jpmorgan|coca.cola|walmart|disney|boeing|berkshire|goldman|pepsi)\b/i,
  ];

  for (const pattern of creationPatterns) {
    if (pattern.test(userQuery)) return true;
  }

  return false;
}

/**
 * Run the 3-role orchestrated pipeline.
 *
 * @param {Object} params
 * @param {string} params.userQuery - The original user-typed prompt
 * @param {Object} params.providerConfig - { gemini: {apiKey, model}, openai: {apiKey, model}, routing: {planner, assumptions, executor} }
 * @param {string} params.systemContext - The combined docs/tool context
 * @param {string} params.spreadsheetContext - Current sheet state (visible data, summary)
 * @param {string} params.secContext - Pre-fetched SEC filing data (if available)
 * @param {Array} params.geminiContents - Full conversation in Gemini format (for executor)
 * @param {Array} params.geminiTools - Tool declarations for executor
 * @param {Object} params.geminiToolConfig - Tool config for executor
 * @param {Array} params.systemParts - System instruction parts
 * @param {Object} params.res - HTTP response object for streaming
 * @param {string} params.modelKey - Model key for response metadata
 * @returns {Promise<void>}
 */
async function runOrchestrator(params) {
  const {
    userQuery, providerConfig, systemContext, spreadsheetContext, secContext,
    geminiContents, geminiTools, geminiToolConfig, systemParts, res, modelKey,
  } = params;

  const { routing } = providerConfig;
  const plannerProvider = routing.planner || 'openai';
  const assumptionsProvider = routing.assumptions || 'openai';
  const executorProvider = routing.executor || 'gemini';

  const getConfig = (provider) => providerConfig[provider] || providerConfig.gemini;

  console.log('[orchestrator] ===== STARTING 3-ROLE PIPELINE =====');
  console.log('[orchestrator] Query:', userQuery.slice(0, 100));
  console.log('[orchestrator] Routing: planner=%s assumptions=%s executor=%s', plannerProvider, assumptionsProvider, executorProvider);

  // We stream status updates as SSE text while planning/assumptions run
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.statusCode = 200;

  function sendStatusUpdate(text) {
    const chunk = {
      role: 'assistant',
      content: [{ type: 'text', text }],
      contextType: 'userPrompt',
      toolCalls: [],
      modelKey,
      isOnPaidPlan: true,
      exceededBillingLimit: false,
    };
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  try {
    // ================================================================
    // PHASE 1: PLANNER
    // ================================================================
    sendStatusUpdate('🧠 **Planning** — Analyzing request and designing sheet layout...\n\n');

    const plannerInput = [
      `USER REQUEST: ${userQuery}`,
      spreadsheetContext ? `\nCURRENT SPREADSHEET STATE:\n${spreadsheetContext}` : '',
      secContext ? `\nAVAILABLE SOURCE DATA:\n${secContext}` : '',
    ].filter(Boolean).join('\n');

    console.log('[orchestrator] PLANNER: calling %s (%d chars input)', plannerProvider, plannerInput.length);

    let sheetPlan;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const plannerRaw = await callModel(plannerProvider, getConfig(plannerProvider), PLANNER_SYSTEM_PROMPT, plannerInput);
      try {
        sheetPlan = JSON.parse(plannerRaw);
        break;
      } catch (e1) {
        try {
          sheetPlan = repairJSON(plannerRaw);
          console.log('[orchestrator] PLANNER: repaired truncated JSON on attempt', attempt);
          break;
        } catch (e2) {
          console.warn('[orchestrator] PLANNER: JSON parse failed attempt %d/%d: %s', attempt, 2, e2.message);
          if (attempt === 2) {
            console.error('[orchestrator] PLANNER: raw output:', plannerRaw.slice(0, 500));
            throw new Error(`PLANNER returned invalid JSON after 2 attempts: ${plannerRaw.slice(0, 200)}`);
          }
          // Retry with slightly higher temperature
          console.log('[orchestrator] PLANNER: retrying...');
        }
      }
    }

    console.log('[orchestrator] PLANNER: got SheetPlan with %d sections, %d toolSteps',
      sheetPlan.sections?.length || 0, sheetPlan.toolSteps?.length || 0);

    sendStatusUpdate(
      '🧠 **Planning** — Analyzing request and designing sheet layout...\n\n' +
      `✅ **Plan ready**: "${sheetPlan.goal}"\n` +
      `   📋 ${sheetPlan.sections?.length || 0} sections, ${sheetPlan.toolSteps?.length || 0} steps\n\n` +
      '📊 **Classifying assumptions** — Identifying data sources and estimates...\n\n'
    );

    // ================================================================
    // PHASE 2: ASSUMPTIONS
    // ================================================================
    const assumptionsInput = [
      `USER REQUEST: ${userQuery}`,
      `\nSHEET PLAN:\n${JSON.stringify(sheetPlan, null, 2)}`,
      secContext ? `\nAVAILABLE SOURCE DATA:\n${secContext}` : '',
    ].filter(Boolean).join('\n');

    console.log('[orchestrator] ASSUMPTIONS: calling %s (%d chars input)', assumptionsProvider, assumptionsInput.length);
    const assumptionsRaw = await callModel(assumptionsProvider, getConfig(assumptionsProvider), ASSUMPTIONS_SYSTEM_PROMPT, assumptionsInput);

    let assumptionPack;
    try {
      assumptionPack = JSON.parse(assumptionsRaw);
    } catch (e) {
      try {
        assumptionPack = repairJSON(assumptionsRaw);
        console.log('[orchestrator] ASSUMPTIONS: repaired truncated JSON');
      } catch (e2) {
        throw new Error(`ASSUMPTIONS returned invalid JSON: ${assumptionsRaw.slice(0, 200)}`);
      }
    }

    const numAssumptions = assumptionPack.assumptions?.length || 0;
    const numSourced = (assumptionPack.assumptions || []).filter(a => a.classification === 'SOURCED').length;
    const numAssumed = (assumptionPack.assumptions || []).filter(a => a.classification === 'ASSUMED').length;
    const numGiven = (assumptionPack.assumptions || []).filter(a => a.classification === 'GIVEN').length;

    console.log('[orchestrator] ASSUMPTIONS: got %d entries (GIVEN=%d SOURCED=%d ASSUMED=%d)',
      numAssumptions, numGiven, numSourced, numAssumed);

    sendStatusUpdate(
      '🧠 **Planning** — Analyzing request and designing sheet layout...\n\n' +
      `✅ **Plan ready**: "${sheetPlan.goal}"\n` +
      `   📋 ${sheetPlan.sections?.length || 0} sections, ${sheetPlan.toolSteps?.length || 0} steps\n\n` +
      '📊 **Classifying assumptions** — Identifying data sources and estimates...\n\n' +
      `✅ **Assumptions classified**: ${numAssumptions} drivers\n` +
      `   📌 ${numGiven} Given · 📎 ${numSourced} Sourced · 💡 ${numAssumed} Assumed\n\n` +
      '⚡ **Executing** — Writing to spreadsheet...\n\n'
    );

    // ================================================================
    // PHASE 3: EXECUTOR
    // ================================================================
    // Build the executor's context by injecting the plan + assumptions
    // into the conversation that the existing pipeline uses.
    const executorPreamble =
      EXECUTOR_SYSTEM_PROMPT_PREFIX +
      `\n\n## SHEET PLAN\n\`\`\`json\n${JSON.stringify(sheetPlan, null, 2)}\n\`\`\`\n\n` +
      `## ASSUMPTION PACK\n\`\`\`json\n${JSON.stringify(assumptionPack, null, 2)}\n\`\`\`\n\n` +
      `Execute the plan now. Call the tools in the order specified by toolSteps. ` +
      `Use set_cell_values for literal data and set_formula_cell_value for formulas. ` +
      `Every assumed/sourced value goes in the Inputs section. Output cells use formulas.`;

    // Replace the last user message in geminiContents with the enriched version
    // that includes the plan + assumptions
    const enrichedContents = [...geminiContents];
    // Find the last user message and augment it
    for (let i = enrichedContents.length - 1; i >= 0; i--) {
      if (enrichedContents[i].role === 'user') {
        const existingParts = enrichedContents[i].parts || [];
        enrichedContents[i] = {
          role: 'user',
          parts: [
            ...existingParts,
            { text: `\n\n[ORCHESTRATOR CONTEXT — Plan & Assumptions]\n${executorPreamble}` },
          ],
        };
        break;
      }
    }

    // Build the enriched system prompt
    const executorSystemPrompt = systemParts.map(p => p.text).join('\n\n') +
      '\n\n' + EXECUTOR_SYSTEM_PROMPT_PREFIX;

    console.log('[orchestrator] EXECUTOR: streaming via %s', executorProvider);
    const result = await streamExecutor(
      executorProvider,
      getConfig(executorProvider),
      executorSystemPrompt,
      enrichedContents,
      geminiTools,
      geminiToolConfig,
      res,
      modelKey
    );

    // The executor has already streamed its response including tool calls.
    // The client-side loop will pick up the tool calls and execute them.

    console.log('[orchestrator] EXECUTOR: done. text=%d chars, toolCalls=%d',
      result.text.length, result.toolCalls.length);

    // ================================================================
    // PROVENANCE INJECTION
    // ================================================================
    // Attach source metadata from the AssumptionPack to tool call args
    if (result.toolCalls.length > 0 && assumptionPack.assumptions) {
      const sourceInfo = assumptionPack.assumptions
        .filter(a => a.classification === 'SOURCED' && a.sourceUrl)
        .map(a => ({ title: a.name, uri: a.sourceUrl }));

      if (sourceInfo.length > 0) {
        for (const tc of result.toolCalls) {
          try {
            const args = JSON.parse(tc.arguments);
            args._sourceUrls = sourceInfo;
            args._assumptionPack = assumptionPack;
            tc.arguments = JSON.stringify(args);
          } catch {}
        }

        // Send final chunk with source metadata
        const content = result.text ? [{ type: 'text', text: result.text }] : [];
        content.push({
          type: 'google_search_grounding_metadata',
          text: JSON.stringify({
            groundingChunks: sourceInfo.map(s => ({ web: { uri: s.uri, title: s.title } })),
            groundingSupports: [],
            _assumptionPack: assumptionPack,
          }),
        });

        res.write(`data: ${JSON.stringify({
          role: 'assistant',
          content,
          contextType: 'userPrompt',
          toolCalls: result.toolCalls,
          modelKey,
          isOnPaidPlan: true,
          exceededBillingLimit: false,
        })}\n\n`);
      }
    }

    console.log('[orchestrator] ===== PIPELINE COMPLETE =====');
    return res.end();

  } catch (err) {
    console.error('[orchestrator] Pipeline error:', err);

    // If headers already sent (we started streaming), try direct executor fallback
    if (res.headersSent) {
      sendStatusUpdate(`\n\n⚠️ **Planning phase failed**: ${err.message}\n\nFalling back to direct execution...\n\n`);
      try {
        // Fall back to direct executor with the user's original query
        const result = await streamExecutor(
          executorProvider,
          getConfig(executorProvider),
          systemParts.map(p => p.text || '').join('\n'),
          geminiContents,
          geminiTools,
          geminiToolConfig,
          res,
          modelKey,
        );
        console.log('[orchestrator] Direct fallback completed successfully');
        return res.end();
      } catch (fallbackErr) {
        console.error('[orchestrator] Direct fallback also failed:', fallbackErr.message);
        sendStatusUpdate(`\n\n❌ **Direct fallback also failed**: ${fallbackErr.message}`);
        return res.end();
      }
    }

    // Otherwise, throw to let the caller fall back to direct mode
    throw err;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  runOrchestrator,
  shouldUseRolePipeline,
  callModel,
  streamExecutor,
  PLANNER_SYSTEM_PROMPT,
  ASSUMPTIONS_SYSTEM_PROMPT,
  EXECUTOR_SYSTEM_PROMPT_PREFIX,
  VALIDATION_PROMPT,
  convertGeminiSchemaToJsonSchema,
};
