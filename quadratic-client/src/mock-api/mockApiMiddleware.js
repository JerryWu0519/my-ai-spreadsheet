/**
 * Vite middleware that intercepts requests to the Quadratic API
 * and returns mock data so the frontend can run standalone without a backend.
 *
 * Only active when VITE_AUTH_TYPE=local.
 */

const MOCK_TEAM_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_USER_ID = 1;
const NOW = new Date().toISOString();

// ---------------------------------------------------------------------------
// Gemini configuration
// ---------------------------------------------------------------------------
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

// ---------------------------------------------------------------------------
// Gemini-compatible function declarations for Quadratic AI tools
// These mirror what quadratic-api builds from aiToolsSpec
// ---------------------------------------------------------------------------
const GEMINI_TOOL_DECLARATIONS = [
  {
    name: 'set_cell_values',
    description:
      'Sets the values of cells in the current open sheet to a 2d array of strings. Requires sheet_name, top_left_position (in a1 notation like "A1"), and a 2d array of string values. Include column headers as the first row. Do NOT place cells over existing data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        sheet_name: { type: 'STRING', description: 'The sheet name (e.g. "Sheet1")' },
        top_left_position: {
          type: 'STRING',
          description: 'Top-left cell in A1 notation where data starts (e.g. "A1")',
        },
        cell_values: {
          type: 'ARRAY',
          items: { type: 'ARRAY', items: { type: 'STRING', description: 'Cell value as string' } },
          description: '2D array of string values. First row should be headers.',
        },
        _provenance: {
          type: 'OBJECT',
          description:
            'Deep-Traceability: source metadata for where this data came from. Always include this when you know the data source.',
          properties: {
            file_id: { type: 'STRING', description: 'Unique identifier or path of the source file' },
            file_name: { type: 'STRING', description: 'Human-readable name of the source' },
            file_type: { type: 'STRING', description: 'Type: pdf, csv, json, xlsx, url, text, unknown' },
            source_url: { type: 'STRING', description: 'URL of the web source if applicable' },
            page_index: { type: 'NUMBER', description: '0-based page index for PDFs' },
            text_anchor: {
              type: 'STRING',
              description: 'A snippet of text near the extracted data for context anchoring',
            },
            source_snippet: {
              type: 'STRING',
              description: 'The raw text excerpt from the source surrounding the data',
            },
            json_path: { type: 'STRING', description: 'JSON path like $.data[0].value if from JSON source' },
          },
        },
      },
      required: ['sheet_name', 'top_left_position', 'cell_values'],
    },
  },
  {
    name: 'add_data_table',
    description:
      'Adds a new data table to the sheet. Use for clearly tabular data. Requires sheet_name, table_name, top_left_position (in a1 notation), and table_data (2d array where first row is headers).',
    parameters: {
      type: 'OBJECT',
      properties: {
        sheet_name: { type: 'STRING', description: 'The sheet name' },
        table_name: { type: 'STRING', description: 'Name for the data table' },
        top_left_position: { type: 'STRING', description: 'Top-left cell in A1 notation' },
        table_data: {
          type: 'ARRAY',
          items: { type: 'ARRAY', items: { type: 'STRING' } },
          description: '2D array. First row = headers, subsequent rows = data.',
        },
        _provenance: {
          type: 'OBJECT',
          description:
            'Deep-Traceability: source metadata for where this data came from. Always include this when you know the data source.',
          properties: {
            file_id: { type: 'STRING', description: 'Unique identifier or path of the source file' },
            file_name: { type: 'STRING', description: 'Human-readable name of the source' },
            file_type: { type: 'STRING', description: 'Type: pdf, csv, json, xlsx, url, text, unknown' },
            source_url: { type: 'STRING', description: 'URL of the web source if applicable' },
            page_index: { type: 'NUMBER', description: '0-based page index for PDFs' },
            text_anchor: {
              type: 'STRING',
              description: 'A snippet of text near the extracted data for context anchoring',
            },
            source_snippet: {
              type: 'STRING',
              description: 'The raw text excerpt from the source surrounding the data',
            },
          },
        },
      },
      required: ['sheet_name', 'table_name', 'top_left_position', 'table_data'],
    },
  },
  {
    name: 'set_code_cell_value',
    description:
      'Sets a code cell (Python or JavaScript or Formula) at the given position. The code will be executed. Use for calculations, data fetching, analysis.',
    parameters: {
      type: 'OBJECT',
      properties: {
        sheet_name: { type: 'STRING', description: 'The sheet name' },
        code_cell_name: { type: 'STRING', description: 'A descriptive name for the code cell' },
        code_cell_language: {
          type: 'STRING',
          description: 'Language: "Python", "Javascript", or "Formula"',
        },
        code_string: { type: 'STRING', description: 'The code to execute' },
        code_cell_position: { type: 'STRING', description: 'Cell position in A1 notation' },
      },
      required: ['sheet_name', 'code_cell_name', 'code_cell_language', 'code_string', 'code_cell_position'],
    },
  },
  {
    name: 'set_formula_cell_value',
    description:
      'Sets one or more formula cells. Use for spreadsheet formulas like =SUM(A1:A10), =AVERAGE(), etc. Provide an array of formulas.',
    parameters: {
      type: 'OBJECT',
      properties: {
        formulas: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              sheet_name: { type: 'STRING', description: 'The sheet name' },
              code_cell_position: { type: 'STRING', description: 'Cell position in A1 notation' },
              formula_string: { type: 'STRING', description: 'The formula string (e.g. "=SUM(A1:A10)")' },
            },
            required: ['code_cell_position', 'formula_string'],
          },
          description: 'Array of formula objects to set',
        },
      },
      required: ['formulas'],
    },
  },
  {
    name: 'web_search',
    description:
      'Search the web for current information. Use this when the user asks about real-world data, current events, stock prices, financial data, etc. that you do not have in your training data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'The search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'user_prompt_suggestions',
    description:
      'After completing a task, suggest 2-3 follow-up prompts the user might want to try next. Only call this after you have completed the main task.',
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt_suggestions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              label: { type: 'STRING', description: 'Short label for the suggestion' },
              prompt: { type: 'STRING', description: 'The full prompt text' },
            },
            required: ['label', 'prompt'],
          },
          description: 'Array of 2-3 suggested follow-up prompts',
        },
      },
      required: ['prompt_suggestions'],
    },
  },
];

// Build the Gemini tools payload
const GEMINI_TOOLS = [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }];

// ---------------------------------------------------------------------------
// In-memory file store
// ---------------------------------------------------------------------------
const files = new Map();

function createFile(name = 'Untitled', isPrivate = false) {
  const uuid = crypto.randomUUID();
  const file = {
    uuid,
    name,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    lastCheckpointSequenceNumber: 0,
    lastCheckpointVersion: '1.12',
    publicLinkAccess: 'NOT_SHARED',
    thumbnail: null,
    timezone: null,
    hasScheduledTasks: false,
    ownerUserId: MOCK_USER_ID,
    isPrivate,
  };
  files.set(uuid, file);
  return file;
}

// Create one seed file
const seedFile = createFile('Welcome');

// ---------------------------------------------------------------------------
// Helper: build the /v0/files/:uuid.GET.response shape
// ---------------------------------------------------------------------------
function fileGetResponse(file) {
  return {
    file: {
      ...file,
      // The core module fetches this URL to load the grid data.
      // Must be a fully-qualified URL to pass Zod z.string().url() validation.
      lastCheckpointDataUrl: 'http://localhost:3000/empty.grid',
    },
    team: {
      uuid: MOCK_TEAM_UUID,
      name: 'Local Team',
      isOnPaidPlan: true,
      settings: { analyticsAi: false, aiRules: null },
      sshPublicKey: '',
    },
    userMakingRequest: {
      clientDataKv: {},
      id: MOCK_USER_ID,
      filePermissions: ['FILE_VIEW', 'FILE_EDIT', 'FILE_MOVE', 'FILE_DELETE'],
      fileTeamPrivacy: 'PUBLIC_TO_TEAM',
      fileRole: 'EDITOR',
      teamPermissions: ['TEAM_VIEW', 'TEAM_EDIT', 'TEAM_MANAGE'],
      teamRole: 'OWNER',
      restrictedModel: false,
    },
    license: {
      limits: { seats: 100 },
      status: 'active',
    },
  };
}

// ---------------------------------------------------------------------------
// Team-level file list
// ---------------------------------------------------------------------------
function teamFilesList() {
  return [...files.values()]
    .filter((f) => !f.isPrivate)
    .map((f) => ({
      file: {
        uuid: f.uuid,
        name: f.name,
        createdDate: f.createdDate,
        updatedDate: f.updatedDate,
        publicLinkAccess: f.publicLinkAccess,
        thumbnail: f.thumbnail,
        hasScheduledTasks: f.hasScheduledTasks,
        creatorId: MOCK_USER_ID,
      },
      userMakingRequest: {
        filePermissions: ['FILE_VIEW', 'FILE_EDIT', 'FILE_MOVE', 'FILE_DELETE'],
      },
    }));
}

function teamFilesPrivateList() {
  return [...files.values()]
    .filter((f) => f.isPrivate)
    .map((f) => ({
      file: {
        uuid: f.uuid,
        name: f.name,
        createdDate: f.createdDate,
        updatedDate: f.updatedDate,
        publicLinkAccess: f.publicLinkAccess,
        thumbnail: f.thumbnail,
        hasScheduledTasks: f.hasScheduledTasks,
      },
      userMakingRequest: {
        filePermissions: ['FILE_VIEW', 'FILE_EDIT', 'FILE_MOVE', 'FILE_DELETE'],
      },
    }));
}

// ---------------------------------------------------------------------------
// Static mock responses
// ---------------------------------------------------------------------------
function mockTeamGetResponse() {
  return {
    team: {
      id: 1,
      uuid: MOCK_TEAM_UUID,
      name: 'Local Team',
      settings: { analyticsAi: false, aiRules: null },
      sshPublicKey: '',
      onboardingComplete: true,
    },
    userMakingRequest: {
      id: MOCK_USER_ID,
      teamPermissions: ['TEAM_VIEW', 'TEAM_EDIT', 'TEAM_MANAGE'],
      teamRole: 'OWNER',
    },
    billing: {
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      usage: [],
    },
    files: teamFilesList(),
    filesPrivate: teamFilesPrivateList(),
    users: [
      {
        id: MOCK_USER_ID,
        email: 'local@example.com',
        name: 'Local Developer',
        role: 'OWNER',
      },
    ],
    invites: [],
    license: { limits: { seats: 100 }, status: 'active' },
    connections: [],
    clientDataKv: {},
    fileLimit: {
      isOverLimit: false,
      totalFiles: files.size,
      maxEditableFiles: 100,
    },
  };
}

const mockTeamsListResponse = () => ({
  teams: [
    {
      team: { id: 1, uuid: MOCK_TEAM_UUID, name: 'Local Team' },
      users: 1,
      userMakingRequest: {
        teamPermissions: ['TEAM_VIEW', 'TEAM_EDIT', 'TEAM_MANAGE'],
      },
    },
  ],
  userMakingRequest: { id: MOCK_USER_ID },
});

// ---------------------------------------------------------------------------
// Read request body helper (for POST / PATCH)
// ---------------------------------------------------------------------------
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------
export function mockApiPlugin(apiUrl) {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/mock-api/')) {
          return next();
        }

        const fullPath = req.url.replace('/mock-api', '');
        const path = fullPath.split('?')[0];
        const query = new URLSearchParams(fullPath.split('?')[1] || '');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // ---- Fetch remote URL and return HTML (proxy) -----------------
        // This allows the client to request a same-origin copy of a webpage
        // so it can be rendered inside an iframe/srcdoc and searched/highlighted.
        if (path === '/v0/fetch-url' && req.method === 'GET') {
          let url = query.get('url');
          if (!url) {
            res.statusCode = 400;
            return send(res, { error: 'Missing url query parameter' });
          }

          // If the URL is a Google grounding redirect, resolve it first
          if (url.includes('grounding-api-redirect')) {
            try {
              const redirectRes = await fetch(url, {
                method: 'HEAD',
                redirect: 'manual',
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                },
              });
              const location = redirectRes.headers.get('location');
              if (location) {
                console.log('[mock-api] Resolved grounding redirect ->', location.slice(0, 100));
                url = location;
              }
            } catch (e) {
              console.log('[mock-api] Failed to resolve grounding redirect:', e.message);
            }
          }

          try {
            // Use global fetch (Node 18+). Add a 15s timeout for safety.
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            // SEC EDGAR requires an identifying User-Agent; other sites need browser-like UA
            const isSEC = url.includes('sec.gov');
            const ua = isSEC
              ? 'Quadratic/1.0 research@example.com'
              : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
            const response = await fetch(url, {
              signal: controller.signal,
              redirect: 'follow',
              headers: {
                'User-Agent': ua,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
              },
            });
            clearTimeout(timeout);

            if (!response.ok) {
              res.statusCode = 502;
              return send(res, { error: `Failed to fetch url: ${response.status}`, url, resolvedUrl: url });
            }

            const text = await response.text();
            // Return HTML as a JSON field. Client will put into srcdoc.
            // Also return the final resolved URL so the client knows where it ended up.
            return send(res, { html: text, resolvedUrl: response.url || url });
          } catch (err) {
            const message = err && err.name === 'AbortError' ? 'Fetch timed out' : String(err);
            res.statusCode = 502;
            return send(res, { error: message, resolvedUrl: url });
          }
        }

        // ---- Teams --------------------------------------------------------
        if (path === '/v0/teams' && req.method === 'GET') {
          return send(res, mockTeamsListResponse());
        }
        if (path === '/v0/teams' && req.method === 'POST') {
          return send(res, { uuid: MOCK_TEAM_UUID, name: 'Local Team' });
        }
        if (path.match(/^\/v0\/teams\/[^/]+$/) && req.method === 'GET') {
          return send(res, mockTeamGetResponse());
        }
        if (path.match(/^\/v0\/teams\/[^/]+$/) && req.method === 'PATCH') {
          return send(res, {
            name: 'Local Team',
            clientDataKv: {},
            settings: { analyticsAi: false, showConnectionDemo: false, aiRules: null },
          });
        }
        if (path.match(/^\/v0\/teams\/[^/]+\/file-limit/) && req.method === 'GET') {
          return send(res, {
            hasReachedLimit: false,
            isOverLimit: false,
            totalFiles: files.size,
            maxEditableFiles: 100,
            isPaidPlan: true,
          });
        }

        // ---- Files list ---------------------------------------------------
        if (path === '/v0/files' && req.method === 'GET') {
          const shared = query.get('shared');
          if (shared === 'with-me') {
            return send(res, []);
          }
          const list = [...files.values()].map((f) => ({
            uuid: f.uuid,
            name: f.name,
            createdDate: f.createdDate,
            updatedDate: f.updatedDate,
            publicLinkAccess: f.publicLinkAccess,
            thumbnail: f.thumbnail,
            timezone: f.timezone,
            hasScheduledTasks: f.hasScheduledTasks,
          }));
          return send(res, list);
        }

        // ---- File create --------------------------------------------------
        if (path === '/v0/files' && req.method === 'POST') {
          const body = await readBody(req);
          const name = body?.name || 'Untitled';
          const isPrivate = !!body?.isPrivate;
          const f = createFile(name, isPrivate);
          return send(res, {
            file: { uuid: f.uuid, name: f.name },
            team: { uuid: MOCK_TEAM_UUID },
          });
        }

        // ---- Single file GET ----------------------------------------------
        const fileGetMatch = path.match(/^\/v0\/files\/([^/]+)$/);
        if (fileGetMatch && req.method === 'GET') {
          const uuid = fileGetMatch[1];
          let file = files.get(uuid);
          if (!file) {
            // Auto-create for any UUID so navigation always works
            file = createFile('Untitled');
            files.delete(file.uuid);
            file.uuid = uuid;
            files.set(uuid, file);
          }
          return send(res, fileGetResponse(file));
        }

        // ---- File PATCH (rename, etc.) ------------------------------------
        if (path.match(/^\/v0\/files\/[^/]+$/) && req.method === 'PATCH') {
          const uuid = path.split('/')[3];
          const body = await readBody(req);
          const file = files.get(uuid);
          if (file && body) {
            if (body.name) file.name = body.name;
            if (body.timezone !== undefined) file.timezone = body.timezone;
            file.updatedDate = new Date().toISOString();
          }
          return send(res, {
            name: file?.name,
            ownerUserId: MOCK_USER_ID,
            timezone: file?.timezone ?? null,
          });
        }

        // ---- File DELETE --------------------------------------------------
        if (path.match(/^\/v0\/files\/[^/]+$/) && req.method === 'DELETE') {
          const uuid = path.split('/')[3];
          files.delete(uuid);
          return send(res, { message: 'deleted' });
        }

        // ---- File restore -------------------------------------------------
        if (path.match(/\/restore$/) && req.method === 'POST') {
          return send(res, { message: 'restored' });
        }

        // ---- File sharing -------------------------------------------------
        if (path.match(/\/sharing$/) && req.method === 'GET') {
          const uuid = path.split('/')[3];
          const file = files.get(uuid);
          return send(res, {
            file: { publicLinkAccess: file?.publicLinkAccess || 'NOT_SHARED' },
            team: { name: 'Local Team', uuid: MOCK_TEAM_UUID },
            userMakingRequest: {
              id: MOCK_USER_ID,
              filePermissions: ['FILE_VIEW', 'FILE_EDIT', 'FILE_MOVE', 'FILE_DELETE'],
              fileRole: 'EDITOR',
              teamRole: 'OWNER',
            },
            owner: { type: 'user', id: MOCK_USER_ID, email: 'local@example.com', name: 'Local Developer' },
            users: [],
            invites: [],
          });
        }
        if (path.match(/\/sharing$/) && req.method === 'PATCH') {
          const body = await readBody(req);
          return send(res, { publicLinkAccess: body?.publicLinkAccess || 'NOT_SHARED' });
        }

        // ---- File thumbnail -----------------------------------------------
        if (path.match(/\/thumbnail$/) && req.method === 'POST') {
          return send(res, { message: 'ok' });
        }

        // ---- File checkpoints ---------------------------------------------
        if (path.match(/\/checkpoints/) && req.method === 'GET') {
          const uuid = path.split('/')[3];
          const file = files.get(uuid);
          return send(res, {
            file: { name: file?.name || 'Untitled' },
            team: { uuid: MOCK_TEAM_UUID },
            checkpoints: [],
            userMakingRequest: {
              id: MOCK_USER_ID,
              filePermissions: ['FILE_VIEW', 'FILE_EDIT', 'FILE_MOVE', 'FILE_DELETE'],
              teamPermissions: ['TEAM_VIEW', 'TEAM_EDIT', 'TEAM_MANAGE'],
            },
          });
        }

        // ---- Education ----------------------------------------------------
        if (path === '/v0/education' && req.method === 'GET') {
          return send(res, {});
        }

        // ---- User ---------------------------------------------------------
        if (path === '/v0/user/acknowledge' && req.method === 'GET') {
          return send(res, { message: 'ok', userCreated: false });
        }
        if (path === '/v0/user/client-data-kv' && req.method === 'GET') {
          return send(res, {});
        }
        if (path === '/v0/user/client-data-kv' && req.method === 'POST') {
          return send(res, {});
        }
        if (path.match(/\/ai-rules/) && (req.method === 'GET' || req.method === 'PATCH')) {
          return send(res, { aiRules: null });
        }
        if (path.match(/\/ai-languages/) && (req.method === 'GET' || req.method === 'PATCH')) {
          return send(res, { aiLanguages: [] });
        }

        // ---- Connections --------------------------------------------------
        if (path.match(/\/connections/) && req.method === 'GET') {
          return send(res, []);
        }

        // ---- Billing ------------------------------------------------------
        if (path.match(/\/billing\//)) {
          return send(res, { url: '#', isEligible: false, message: 'mock' });
        }

        // ---- Scheduled tasks ----------------------------------------------
        if (path.match(/\/scheduled-tasks/)) {
          return send(res, []);
        }

        // ---- Feedback -----------------------------------------------------
        if (path === '/v0/feedback' && req.method === 'POST') {
          return send(res, { message: 'ok' });
        }

        // ---- Deep-Traceability: provenance file upload --------------------
        if (path === '/v0/provenance/files' && req.method === 'POST') {
          // In a real implementation, this would store the file and return an ID
          const fileId = crypto.randomUUID();
          return send(res, { fileId, message: 'File registered for provenance tracking' });
        }
        if (path.match(/^\/v0\/provenance\/files\/[^/]+$/) && req.method === 'GET') {
          return send(res, { message: 'File metadata endpoint (stub)' });
        }

        // ---- AI chat (proxied to Google Gemini with tool calling) ----------
        if (path === '/v0/ai/chat' && req.method === 'POST') {
          const body = await readBody(req);
          const { messages, modelKey, useStream, useToolsPrompt, source, toolName } = body;
          const isWebSearch = source === 'WebSearch' || toolName === 'web_search_internal';

          // ---- Build Gemini contents from Quadratic messages ----
          const geminiContents = [];
          const systemParts = [];

          // Deep-Traceability: inject provenance instruction
          systemParts.push({
            text: `IMPORTANT — Deep-Traceability & Calculation Transparency Protocol:

You are a spreadsheet analyst. Your job is to take financial questions and turn them into clean, auditable spreadsheet cells.

═══════════════════════════════════════════════════════════════
UNIVERSAL PATTERN FOR ANY FINANCIAL METRIC / RATIO
═══════════════════════════════════════════════════════════════

Every financial question follows this EXACT pattern — no exceptions:

STEP 1: Identify the FORMULA for the requested metric.
  - Interest Coverage Ratio = EBIT / Interest Expense
  - Debt to Equity Ratio   = Total Liabilities / Total Stockholders' Equity
  - Current Ratio           = Current Assets / Current Liabilities
  - Profit Margin           = Net Income / Total Revenue
  - ROE                     = Net Income / Total Stockholders' Equity
  - ROA                     = Net Income / Total Assets
  (If you don't know the formula, reason it out from financial first principles.)

STEP 2: Identify the BASE DATA needed (the components of the formula).
  - Each component is a RAW NUMBER that comes directly from a source document.
  - NEVER compute or derive a base component. If the filing says "Total Stockholders' Equity: $69,428" then use 69428000000 directly.
  - If the SEC filing context is provided, SCAN IT for exact numbers. The numbers ARE there.

STEP 3: Place data in cells using this EXACT layout:

  Row 1 = HEADER ROW:
    A1="Metric"  B1="Value"  C1="Source"

  Row 2..N = BASE DATA ROWS (one per component):
    A2="[Component Name]"  B2=[raw number from source]  C2="[Company] [Year] 10-K Filing"
    A3="[Component Name]"  B3=[raw number from source]  C3="[Company] [Year] 10-K Filing"

  Row N+1 = RESULT ROW (formula only):
    A4="[Metric Name]"  B4=FORMULA  C4="Calculated (=[formula])"

  USE set_cell_values for rows 1 through N (headers + raw data).
  USE set_formula_cell_value for row N+1 (the computed result).

STEP 4: The formula cell (B4 in the example) MUST use set_formula_cell_value.
  - NEVER put a pre-computed number where a formula should go.
  - The formula references the cells above, e.g. "=B2/B3", "=B2-B3", "=B2+B3".

═══════════════════════════════════════════════════════════════
CONCRETE EXAMPLES
═══════════════════════════════════════════════════════════════

EXAMPLE 1 — "2024 Tesla Interest Coverage Ratio" (EBIT / Interest Expense):
  set_cell_values at A1:
    [["Metric","Value","Source"],
     ["EBIT",7076000000,"Tesla 2024 10-K Filing"],
     ["Interest Expense",350000000,"Tesla 2024 10-K Filing"]]
  set_formula_cell_value:
    [{code_cell_position:"B4", formula_string:"=B2/B3"}]
  set_cell_values at A4:
    [["Interest Coverage Ratio","","Calculated (=B2/B3)"]]
  → B4 displays 20.22 (formula result)

EXAMPLE 2 — "2024 Apple Debt to Equity Ratio" (Total Liabilities / Total Stockholders' Equity):
  set_cell_values at A1:
    [["Metric","Value","Source"],
     ["Total Liabilities",308030000000,"Apple 2024 10-K Filing"],
     ["Total Stockholders' Equity",56950000000,"Apple 2024 10-K Filing"]]
  set_formula_cell_value:
    [{code_cell_position:"B4", formula_string:"=B2/B3"}]
  set_cell_values at A4:
    [["Debt to Equity Ratio","","Calculated (=B2/B3)"]]
  → B4 displays 5.41 (formula result)

EXAMPLE 3 — "2024 Amazon Current Ratio" (Current Assets / Current Liabilities):
  set_cell_values at A1:
    [["Metric","Value","Source"],
     ["Current Assets",167644000000,"Amazon 2024 10-K Filing"],
     ["Current Liabilities",179431000000,"Amazon 2024 10-K Filing"]]
  set_formula_cell_value:
    [{code_cell_position:"B4", formula_string:"=B2/B3"}]
  set_cell_values at A4:
    [["Current Ratio","","Calculated (=B2/B3)"]]
  → B4 displays 0.93 (formula result)

═══════════════════════════════════════════════════════════════
ABSOLUTE RULES
═══════════════════════════════════════════════════════════════

RULE 1 — PATTERN IS ALWAYS THE SAME:
  Header row → Base data rows (raw numbers) → Formula row.
  This pattern works for EVERY financial metric. No exceptions.

RULE 2 — NEVER COMPUTE BASE DATA:
  If the source says "Total Stockholders' Equity: 56,950" then B3=56950000000.
  Do NOT divide, subtract, multiply, or derive base data from other numbers.
  Base data = numbers that appear DIRECTLY in the source document.

RULE 3 — NEVER ASK THE USER FOR DATA:
  If SEC filing context is provided, the numbers are IN the context — extract them.
  If not provided, call web_search to find them.
  If web_search fails, use your best knowledge and mark with "Estimated".
  NEVER respond with "Can you provide..." for publicly available financial data.

RULE 4 — PROVENANCE:
  Every set_cell_values call MUST include _provenance:
    source_url: the SEC filing URL (https://www.sec.gov/Archives/edgar/...)
    file_name: e.g. "Apple 2024 10-K Annual Report"
    file_type: "url"

RULE 5 — SOURCE ATTRIBUTION:
  Column C source: "[Company] [Year] 10-K Filing" for raw data.
  Column C source: "Calculated (=[formula])" for formula rows.
  NEVER use third-party sites (Macrotrends, Yahoo Finance, etc.)

RULE 6 — FORMULA CELLS MUST USE set_formula_cell_value:
  The result row's B cell = set_formula_cell_value with formula_string.
  Example: formula_string:"=B2/B3" — this makes the cell compute live.
  NEVER put a hardcoded number in the result cell.

RULE 7 — DATA EXTRACTION FROM SEC CONTEXT:
  When [SEC FILING CONTEXT] is injected into the conversation:
  - Read all excerpts carefully
  - Find the EXACT line items matching your base data components
  - Use those exact numbers (convert to full number: "56,950" in millions = 56950000000)
  - If the filing uses "in millions", multiply by 1,000,000
  - If the filing uses "in thousands", multiply by 1,000
`,
          });

          for (const msg of messages) {
            // System messages → system instruction
            if (msg.contextType === 'systemPrompt') {
              const texts = (msg.content || []).filter((c) => c.type === 'text').map((c) => c.text);
              systemParts.push(...texts.map((t) => ({ text: t })));
              continue;
            }
            // Internal context messages → fold into user parts
            if (
              msg.contextType === 'internalContext' ||
              msg.contextType === 'visibleData' ||
              msg.contextType === 'summary'
            ) {
              const texts = (msg.content || [])
                .filter((c) => c.type === 'text')
                .map((c) => c.text)
                .filter(Boolean);
              if (texts.length > 0) {
                geminiContents.push({ role: 'user', parts: texts.map((t) => ({ text: t })) });
              }
              continue;
            }
            // Tool result messages → functionResponse
            if (msg.contextType === 'toolResult' && msg.content) {
              const parts = [];
              for (const result of msg.content) {
                const textContent = (result.content || [])
                  .filter((c) => c.type === 'text')
                  .map((c) => c.text)
                  .join('\n');
                parts.push({
                  functionResponse: {
                    name: result.id,
                    response: { res: textContent || 'done' },
                  },
                });
              }
              if (parts.length > 0) {
                geminiContents.push({ role: 'user', parts });
              }
              continue;
            }
            // User prompt messages
            if (msg.role === 'user') {
              const textParts = (msg.content || [])
                .filter((c) => c.type === 'text' && c.text?.trim())
                .map((c) => ({ text: c.text }));
              if (textParts.length > 0) {
                geminiContents.push({ role: 'user', parts: textParts });
              }
              continue;
            }
            // Assistant messages (may include tool calls)
            if (msg.role === 'assistant') {
              const parts = [];
              const texts = (msg.content || [])
                .filter((c) => c.type === 'text' && c.text?.trim())
                .map((c) => ({ text: c.text }));
              parts.push(...texts);
              // Include tool calls as functionCall parts
              if (msg.toolCalls) {
                for (const tc of msg.toolCalls) {
                  try {
                    parts.push({
                      functionCall: {
                        name: tc.name,
                        args: tc.arguments ? JSON.parse(tc.arguments) : {},
                      },
                    });
                  } catch (e) {}
                }
              }
              if (parts.length > 0) {
                geminiContents.push({ role: 'model', parts });
              }
              continue;
            }
          }

          // Ensure conversation doesn't start with 'model' (Gemini requirement)
          if (geminiContents.length > 0 && geminiContents[0].role === 'model') {
            geminiContents.unshift({ role: 'user', parts: [{ text: 'Continue.' }] });
          }

          // Ensure alternating user/model turns (Gemini requirement)
          const fixedContents = [];
          for (let i = 0; i < geminiContents.length; i++) {
            const msg = geminiContents[i];
            if (fixedContents.length > 0 && fixedContents[fixedContents.length - 1].role === msg.role) {
              // Merge with previous message of same role
              fixedContents[fixedContents.length - 1].parts.push(...msg.parts);
            } else {
              fixedContents.push({ ...msg });
            }
          }

          // Build the Gemini request body
          // NOTE: Gemini does NOT support combining google_search with function
          // calling in the same request.  So we use function calling tools for
          // the main request.  After we get the response we do a SECOND call
          // with google_search to fetch grounding/source metadata.
          //
          // IMPORTANT: To prevent Gemini from asking the user for data it
          // doesn't know, we PRE-FETCH SEC filing data and inject it into the
          // prompt context so Gemini always has the numbers available.

          // SEC EDGAR constants (must be declared before pre-fetch block)
          const SEC_UA = 'Quadratic/1.0 research@example.com'; // SEC requires identifying UA
          const secEdgarCache = new Map();

          // ---- Pre-fetch SEC filing context ----
          // Detect financial queries and inject 10-K data into the prompt
          let prefetchedSecContext = null;
          if (!isWebSearch && useToolsPrompt !== false) {
            const lastUserMsg = fixedContents.filter((m) => m.role === 'user').pop();
            const userQuery = lastUserMsg?.parts?.map((p) => p.text).join(' ') || '';
            // Check if this looks like a financial data query
            const financialKeywords =
              /\b(revenue|income|ebit|interest|expense|profit|loss|margin|ratio|coverage|debt|equity|assets|liabilities|earnings|cash flow|operating|net income|gross profit|fiscal|annual|10-k|10k|filing)\b/i;
            if (financialKeywords.test(userQuery)) {
              try {
                const secFiling = await resolveAnnualReportUrl(userQuery);
                if (secFiling) {
                  console.log('[mock-api] Pre-fetching SEC filing for context:', secFiling.url.slice(0, 80));
                  // Fetch the filing HTML and extract key financial snippets
                  const filingRes = await fetch(secFiling.url, {
                    headers: { 'User-Agent': SEC_UA },
                    signal: AbortSignal.timeout(12000),
                  });
                  if (filingRes.ok) {
                    const filingHtml = await filingRes.text();
                    // Extract text content (strip HTML tags), limit to manageable size
                    const textContent = filingHtml
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                      .replace(/<[^>]+>/g, ' ')
                      .replace(/&nbsp;/g, ' ')
                      .replace(/&amp;/g, '&')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/\s+/g, ' ')
                      .trim();

                    // ---- STRUCTURED EXTRACTION ----
                    // Instead of raw text blobs, try to extract specific financial line items
                    // with their values so Gemini can easily find the right numbers.
                    const extractFinancialLineItems = (text) => {
                      const items = {};
                      // Patterns to match common financial line items with dollar values
                      // Matches patterns like: "Total liabilities  $  308,030" or "Total liabilities 308,030"
                      const lineItemPatterns = [
                        {
                          key: 'total_revenue',
                          patterns: [
                            /total\s+(?:net\s+)?(?:revenue|sales)[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i,
                            /(?:net\s+)?(?:revenue|sales)\s+[\$]?\s*([\d,]+(?:\.\d+)?)/i,
                          ],
                        },
                        {
                          key: 'operating_income',
                          patterns: [
                            /(?:operating\s+income|income\s+from\s+operations)[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i,
                          ],
                        },
                        {
                          key: 'interest_expense',
                          patterns: [/interest\s+expense[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'net_income',
                          patterns: [/net\s+income[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'total_assets',
                          patterns: [/total\s+assets[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'total_liabilities',
                          patterns: [/total\s+liabilities[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'total_stockholders_equity',
                          patterns: [
                            /total\s+stockholders[\u2019']?\s*equity[^$\d]*[\$]?\s*\(?\s*([\d,]+(?:\.\d+)?)/i,
                            /total\s+shareholders[\u2019']?\s*equity[^$\d]*[\$]?\s*\(?\s*([\d,]+(?:\.\d+)?)/i,
                            /total\s+equity[^$\d]*[\$]?\s*\(?\s*([\d,]+(?:\.\d+)?)/i,
                          ],
                        },
                        {
                          key: 'current_assets',
                          patterns: [/total\s+current\s+assets[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'current_liabilities',
                          patterns: [/total\s+current\s+liabilities[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'gross_profit',
                          patterns: [/gross\s+(?:profit|margin)[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i],
                        },
                        {
                          key: 'total_debt',
                          patterns: [
                            /total\s+(?:long-term\s+)?debt[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i,
                            /long-term\s+debt[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i,
                          ],
                        },
                        {
                          key: 'ebit',
                          patterns: [
                            /earnings\s+before\s+interest\s+and\s+taxes?[^$\d]*[\$]?\s*([\d,]+(?:\.\d+)?)/i,
                            /\bEBIT\b[^$\dA-Z]*[\$]?\s*([\d,]+(?:\.\d+)?)/,
                          ],
                        },
                      ];

                      for (const item of lineItemPatterns) {
                        for (const pattern of item.patterns) {
                          const match = text.match(pattern);
                          if (match) {
                            items[item.key] = match[1].replace(/,/g, '');
                            break;
                          }
                        }
                      }

                      // Detect scale (millions, thousands, etc.)
                      let scale = 1;
                      if (/in\s+millions/i.test(text.slice(0, 5000))) {
                        scale = 1000000;
                      } else if (/in\s+thousands/i.test(text.slice(0, 5000))) {
                        scale = 1000;
                      } else if (/in\s+billions/i.test(text.slice(0, 5000))) {
                        scale = 1000000000;
                      }

                      return { items, scale };
                    };

                    const { items: financialItems, scale } = extractFinancialLineItems(textContent);

                    // Also extract a few raw snippets as fallback context
                    const extractSnippets = (text, terms, contextChars = 400) => {
                      const snippets = [];
                      for (const term of terms) {
                        const re = new RegExp(term, 'gi');
                        let match;
                        while ((match = re.exec(text)) !== null && snippets.length < 8) {
                          const start = Math.max(0, match.index - contextChars);
                          const end = Math.min(text.length, match.index + contextChars);
                          const snippet = text.slice(start, end).trim();
                          if (!snippets.some((s) => s.includes(snippet.slice(50, 150)))) {
                            snippets.push(snippet);
                          }
                        }
                      }
                      return snippets;
                    };

                    const keyTerms = [
                      'total stockholders',
                      'total shareholders',
                      'total equity',
                      'total liabilities',
                      'total assets',
                      'operating income',
                      'income from operations',
                      'interest expense',
                      'total revenue',
                      'net income',
                      'current assets',
                      'current liabilities',
                    ];
                    const snippets = extractSnippets(textContent, keyTerms);

                    const hasStructuredData = Object.keys(financialItems).length > 0;
                    const hasSnippets = snippets.length > 0;

                    if (hasStructuredData || hasSnippets) {
                      prefetchedSecContext = {
                        filing: secFiling,
                        snippets,
                        financialItems,
                        scale,
                      };

                      const scaleLabel =
                        scale === 1000000
                          ? 'in millions'
                          : scale === 1000
                            ? 'in thousands'
                            : scale === 1000000000
                              ? 'in billions'
                              : 'in actual dollars';

                      // Build structured context
                      const contextLines = [
                        `[SEC FILING CONTEXT — ${secFiling.title}]`,
                        `Source URL: ${secFiling.url}`,
                        `Company: ${secFiling.company} (${secFiling.ticker})`,
                        `Fiscal Year: ${secFiling.fiscalYear}`,
                        `Numbers are reported ${scaleLabel}.`,
                        '',
                      ];

                      // Add structured financial data if available
                      if (hasStructuredData) {
                        contextLines.push('=== EXTRACTED FINANCIAL LINE ITEMS ===');
                        contextLines.push(
                          `(Raw values from filing — multiply by ${scale.toLocaleString()} for actual dollar amounts)`
                        );
                        const labelMap = {
                          total_revenue: 'Total Revenue',
                          operating_income: 'Operating Income (EBIT proxy)',
                          interest_expense: 'Interest Expense',
                          net_income: 'Net Income',
                          total_assets: 'Total Assets',
                          total_liabilities: 'Total Liabilities',
                          total_stockholders_equity: "Total Stockholders' Equity",
                          current_assets: 'Total Current Assets',
                          current_liabilities: 'Total Current Liabilities',
                          gross_profit: 'Gross Profit',
                          total_debt: 'Total Debt',
                          ebit: 'EBIT',
                        };
                        for (const [key, rawVal] of Object.entries(financialItems)) {
                          const label = labelMap[key] || key;
                          const actualVal = (parseFloat(rawVal) * scale).toLocaleString();
                          contextLines.push(`  ${label}: ${rawVal} (=${actualVal} actual)`);
                        }
                        contextLines.push('');
                        contextLines.push('USE THESE EXACT NUMBERS. The "actual" values are what go into cells.');
                        contextLines.push(
                          'For example: if Total Liabilities = 308030 (in millions), put 308030000000 in the cell.'
                        );
                        contextLines.push('');
                      }

                      // Add raw snippets as backup
                      if (hasSnippets) {
                        contextLines.push('=== RAW FILING EXCERPTS (for verification) ===');
                        snippets.forEach((s, i) => {
                          contextLines.push(`--- Excerpt ${i + 1} ---`);
                          contextLines.push(s);
                        });
                        contextLines.push('');
                      }

                      contextLines.push(`PROVENANCE: Set _provenance.source_url to: ${secFiling.url}`);

                      const contextText = contextLines.join('\n');
                      // Add as the last user message so Gemini sees it right before responding
                      const lastUserIdx = fixedContents.findLastIndex((m) => m.role === 'user');
                      if (lastUserIdx >= 0) {
                        fixedContents[lastUserIdx].parts.push({ text: contextText });
                      }
                      console.log(
                        '[mock-api] Injected SEC context:',
                        Object.keys(financialItems).length,
                        'structured items +',
                        snippets.length,
                        'snippets'
                      );
                    }
                  }
                }
              } catch (e) {
                console.log('[mock-api] SEC pre-fetch failed (non-fatal):', e.message);
              }
            }
          }
          let geminiTools, geminiToolConfig;
          if (isWebSearch) {
            // Pure web search mode — only google_search
            geminiTools = [{ google_search: {} }];
            geminiToolConfig = undefined;
          } else if (useToolsPrompt !== false) {
            // Function calling only (no google_search — incompatible)
            geminiTools = GEMINI_TOOLS;
            geminiToolConfig = { functionCallingConfig: { mode: 'AUTO' } };
          } else {
            // No tools prompt — use google_search for grounding
            geminiTools = [{ google_search: {} }];
            geminiToolConfig = undefined;
          }

          const geminiBody = {
            contents: fixedContents.length > 0 ? fixedContents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
            tools: geminiTools,
            toolConfig: geminiToolConfig,
          };
          if (systemParts.length > 0) {
            geminiBody.systemInstruction = { parts: systemParts };
          }

          const usedModelKey = modelKey || 'gemini-2.0-flash';

          // ---- SEC EDGAR Annual Report Resolver ----
          // Given a user query, determine the company + fiscal year and find
          // the official 10-K filing on SEC EDGAR.  Returns the direct URL
          // to the actual HTML filing document.
          // (SEC_UA and secEdgarCache are declared above, before the pre-fetch block)

          // Regex-based company extraction fallback (no Gemini call needed)
          // Includes SEC CIK numbers for reliable EDGAR filing lookup
          function extractCompanyFromQuery(text) {
            const patterns = [
              { re: /\bapple\b/i, company: 'Apple Inc.', ticker: 'AAPL', cik: '0000320193' },
              { re: /\btesla\b/i, company: 'Tesla, Inc.', ticker: 'TSLA', cik: '0001318605' },
              {
                re: /\bgoogle\b|\balphabet\b/i,
                company: 'Alphabet Inc.',
                ticker: 'GOOGL',
                cik: '0001652044',
              },
              {
                re: /\bmicrosoft\b/i,
                company: 'Microsoft Corporation',
                ticker: 'MSFT',
                cik: '0000789019',
              },
              { re: /\bamazon\b/i, company: 'Amazon.com, Inc.', ticker: 'AMZN', cik: '0001018724' },
              {
                re: /\bmeta\b|\bfacebook\b/i,
                company: 'Meta Platforms, Inc.',
                ticker: 'META',
                cik: '0001326801',
              },
              {
                re: /\bnvidia\b/i,
                company: 'NVIDIA Corporation',
                ticker: 'NVDA',
                cik: '0001045810',
              },
              { re: /\bnetflix\b/i, company: 'Netflix, Inc.', ticker: 'NFLX', cik: '0001065280' },
              {
                re: /\bjpmorgan\b|\bjpm\b/i,
                company: 'JPMorgan Chase & Co.',
                ticker: 'JPM',
                cik: '0000019617',
              },
              { re: /\bvisa\b/i, company: 'Visa Inc.', ticker: 'V', cik: '0001403161' },
              {
                re: /\balibaba\b|\bbaba\b/i,
                company: 'Alibaba Group Holding Limited',
                ticker: 'BABA',
                cik: '0001577552',
              },
              { re: /\bwalmart\b|\bwmt\b/i, company: 'Walmart Inc.', ticker: 'WMT', cik: '0000104169' },
              {
                re: /\bcostco\b/i,
                company: 'Costco Wholesale Corporation',
                ticker: 'COST',
                cik: '0000909832',
              },
              {
                re: /\bsalesforce\b/i,
                company: 'Salesforce, Inc.',
                ticker: 'CRM',
                cik: '0001108524',
              },
              {
                re: /\bintel\b/i,
                company: 'Intel Corporation',
                ticker: 'INTC',
                cik: '0000050863',
              },
              {
                re: /\bamd\b/i,
                company: 'Advanced Micro Devices, Inc.',
                ticker: 'AMD',
                cik: '0000002488',
              },
              { re: /\bboeing\b/i, company: 'The Boeing Company', ticker: 'BA', cik: '0000012927' },
              {
                re: /\bdisney\b/i,
                company: 'The Walt Disney Company',
                ticker: 'DIS',
                cik: '0001744489',
              },
              {
                re: /\bcocacola\b|\bcoca-cola\b|\bcoke\b/i,
                company: 'The Coca-Cola Company',
                ticker: 'KO',
                cik: '0000021344',
              },
              {
                re: /\bpepsi\b|\bpepsico\b/i,
                company: 'PepsiCo, Inc.',
                ticker: 'PEP',
                cik: '0000077476',
              },
              { re: /\bpfizer\b/i, company: 'Pfizer Inc.', ticker: 'PFE', cik: '0000078003' },
              {
                re: /\bjohnson\b|\bjnj\b/i,
                company: 'Johnson & Johnson',
                ticker: 'JNJ',
                cik: '0000200406',
              },
              {
                re: /\bprocter\b/i,
                company: 'The Procter & Gamble Company',
                ticker: 'PG',
                cik: '0000080424',
              },
              {
                re: /\bberkshire\b/i,
                company: 'Berkshire Hathaway Inc.',
                ticker: 'BRK-B',
                cik: '0001067983',
              },
              {
                re: /\bbank of america\b/i,
                company: 'Bank of America Corporation',
                ticker: 'BAC',
                cik: '0000070858',
              },
              {
                re: /\bgoldman\b/i,
                company: 'The Goldman Sachs Group, Inc.',
                ticker: 'GS',
                cik: '0000886982',
              },
              {
                re: /\bmorgan stanley\b/i,
                company: 'Morgan Stanley',
                ticker: 'MS',
                cik: '0000895421',
              },
              {
                re: /\buber\b/i,
                company: 'Uber Technologies, Inc.',
                ticker: 'UBER',
                cik: '0001543151',
              },
              { re: /\bairbnb\b/i, company: 'Airbnb, Inc.', ticker: 'ABNB', cik: '0001559720' },
            ];
            for (const p of patterns) {
              if (p.re.test(text)) return { company: p.company, ticker: p.ticker, cik: p.cik };
            }
            return null;
          }

          async function resolveAnnualReportUrl(queryText) {
            try {
              // Step 1: Use Gemini to extract company name, ticker, and fiscal year
              let info = null;
              try {
                const extractUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
                const extractBody = {
                  contents: [{ role: 'user', parts: [{ text: queryText }] }],
                  systemInstruction: {
                    parts: [
                      {
                        text: `Extract the company name, stock ticker symbol, and fiscal year from the user's query. 
Respond ONLY with valid JSON, no markdown, no explanation:
{"company": "Alphabet Inc.", "ticker": "GOOGL", "fiscal_year": 2024}
If the query doesn't mention a specific year, use the most recent completed fiscal year.
If you cannot determine a company, return {"company": null}.`,
                      },
                    ],
                  },
                  generationConfig: { temperature: 0, maxOutputTokens: 200 },
                };
                const extractRes = await fetch(extractUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(extractBody),
                  signal: AbortSignal.timeout(8000),
                });
                if (!extractRes.ok) {
                  console.log('[SEC-EDGAR] Gemini extraction failed:', extractRes.status);
                }
                const extractData = await extractRes.json();
                const extractText = extractData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = extractText
                  .replace(/```json\n?/g, '')
                  .replace(/```\n?/g, '')
                  .trim();
                try {
                  info = JSON.parse(jsonMatch);
                } catch {
                  console.log('[SEC-EDGAR] Failed to parse extraction:', extractText);
                }
              } catch (e) {
                console.log('[SEC-EDGAR] Gemini extraction timed out, using regex fallback');
              }
              // Regex fallback if Gemini extraction failed
              if (!info?.company) {
                const regexInfo = extractCompanyFromQuery(queryText);
                if (regexInfo) {
                  info = { ...regexInfo, fiscal_year: null };
                }
              }
              if (!info?.company) {
                console.log('[SEC-EDGAR] No company found in query');
                return null;
              }
              // Extract fiscal year from query text if Gemini didn't provide it
              if (!info.fiscal_year) {
                const ym = queryText.match(/\b(20\d{2})\b/);
                info.fiscal_year = ym ? parseInt(ym[1]) : new Date().getFullYear() - 1;
              }
              console.log('[SEC-EDGAR] Extracted:', JSON.stringify(info));

              // Check cache
              const cacheKey = `${info.company}:${info.fiscal_year}`;
              if (secEdgarCache.has(cacheKey)) {
                console.log('[SEC-EDGAR] Using cached result for', cacheKey);
                return secEdgarCache.get(cacheKey);
              }

              // Enrich info with CIK from regex list if not present
              if (!info.cik) {
                const regexInfo = extractCompanyFromQuery(queryText);
                if (regexInfo?.cik) {
                  info.cik = regexInfo.cik;
                }
              }

              // Step 2: Search SEC EDGAR for the 10-K or 20-F filing
              // (20-F is used by foreign private issuers like Alibaba)
              const year = info.fiscal_year || new Date().getFullYear() - 1;
              const startDate = `${year}-01-01`;
              const endDate = `${year + 1}-12-31`;

              let allHits = [];

              // PREFERRED: Use EDGAR filing API by CIK (most reliable)
              if (info.cik) {
                const cikNum = info.cik.replace(/^0+/, '');
                // Use EDGAR's submissions API to find filings by CIK
                const submUrl = `https://data.sec.gov/submissions/CIK${info.cik}.json`;
                try {
                  const submRes = await fetch(submUrl, {
                    headers: { 'User-Agent': SEC_UA, Accept: 'application/json' },
                    signal: AbortSignal.timeout(8000),
                  });
                  if (submRes.ok) {
                    const submData = await submRes.json();
                    const recentFilings = submData?.filings?.recent || {};
                    const forms = recentFilings.form || [];
                    const accessionNumbers = recentFilings.accessionNumber || [];
                    const filingDates = recentFilings.filingDate || [];
                    const reportDates = recentFilings.reportDate || [];
                    const primaryDocuments = recentFilings.primaryDocument || [];

                    // Find 10-K or 20-F filings in date range
                    for (let i = 0; i < forms.length; i++) {
                      const form = forms[i];
                      if (form === '10-K' || form === '20-F') {
                        const reportDate = reportDates[i] || '';
                        const filingDate = filingDates[i] || '';
                        const reportYear = parseInt(reportDate.slice(0, 4));
                        // Check if this filing covers our target year
                        if (reportYear === year || reportYear === year + 1) {
                          const adsh = accessionNumbers[i];
                          const adshNoDash = adsh.replace(/-/g, '');
                          const primaryDoc = primaryDocuments[i];
                          allHits.push({
                            _source: {
                              adsh,
                              form,
                              file_type: form,
                              file_date: filingDate,
                              period_ending: reportDate,
                              display_names: [submData.name || info.company],
                              ciks: [info.cik],
                            },
                            _primaryDoc: primaryDoc,
                            _cik: cikNum,
                          });
                        }
                      }
                    }
                    console.log(
                      '[SEC-EDGAR] CIK lookup found',
                      allHits.length,
                      'filings for CIK',
                      info.cik
                    );
                  }
                } catch (e) {
                  console.log('[SEC-EDGAR] CIK submissions lookup failed:', e.message);
                }
              }

              // FALLBACK: If CIK lookup didn't find anything, use EFTS search
              if (allHits.length === 0) {
                const searchQuery = encodeURIComponent(`"${info.company}"`);
                const eftsUrl = `https://efts.sec.gov/LATEST/search-index?q=${searchQuery}&forms=10-K,20-F&dateRange=custom&startdt=${startDate}&enddt=${endDate}&_source=adsh,form,file_date,display_names,period_ending,file_type,ciks`;
                const eftsRes = await fetch(eftsUrl, {
                  headers: { 'User-Agent': SEC_UA },
                  signal: AbortSignal.timeout(8000),
                });
                if (eftsRes.ok) {
                  const eftsData = await eftsRes.json();
                  allHits = eftsData?.hits?.hits || [];
                } else {
                  console.log('[SEC-EDGAR] EFTS search failed:', eftsRes.status);
                  return null;
                }
              }

              // Filter to annual filing types
              const annualFilingTypes = new Set(['10-K', '20-F']);
              const tenKHits = allHits.filter((h) => {
                const fileType = h._source?.file_type;
                if (!annualFilingTypes.has(fileType)) return false;
                // If we used CIK lookup, all results are already for the right company
                if (h._cik) return true;
                // For EFTS results, verify company name/ticker match
                return h._source?.display_names?.some(
                  (n) =>
                    n.toLowerCase().includes(info.company.toLowerCase().split(' ')[0]) ||
                    (info.ticker && n.toUpperCase().includes(info.ticker.toUpperCase()))
                );
              });
              if (tenKHits.length === 0) {
                console.log('[SEC-EDGAR] No 10-K/20-F filings found for', info.company);
                return null;
              }
              // Find the filing closest to the target fiscal year end
              const targetPeriod = `${year}-12-31`;
              tenKHits.sort((a, b) => {
                const aDiff = Math.abs(new Date(a._source.period_ending) - new Date(targetPeriod));
                const bDiff = Math.abs(new Date(b._source.period_ending) - new Date(targetPeriod));
                return aDiff - bDiff;
              });
              const filing = tenKHits[0]._source;
              const cik = (tenKHits[0]._cik || filing.ciks[0]).replace(/^0+/, '');
              const adsh = filing.adsh;
              const adshNoDash = adsh.replace(/-/g, '');
              const formType = filing.file_type || '10-K';
              console.log(
                '[SEC-EDGAR] Found filing:',
                filing.display_names[0],
                'form:',
                formType,
                'period:',
                filing.period_ending,
                'filed:',
                filing.file_date
              );

              // Step 3: Build the filing document URL
              // If we have the primary document from submissions API, use it directly
              const primaryDoc = tenKHits[0]._primaryDoc;
              if (primaryDoc) {
                const docUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${adshNoDash}/${primaryDoc}`;
                const indexUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${adshNoDash}/${adsh}-index.htm`;
                console.log(`[SEC-EDGAR] Found ${formType} document (direct):`, docUrl);
                const result = {
                  url: docUrl,
                  title: `${info.company} ${year} Annual Report (${formType})`,
                  company: info.company,
                  ticker: info.ticker,
                  fiscalYear: year,
                  periodEnding: filing.period_ending,
                  filedDate: filing.file_date,
                  indexUrl,
                };
                secEdgarCache.set(cacheKey, result);
                return result;
              }

              // Otherwise, fetch the filing index page to find the document link
              const indexUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${adshNoDash}/${adsh}-index.htm`;
              const indexRes = await fetch(indexUrl, {
                headers: { 'User-Agent': SEC_UA },
              });
              if (!indexRes.ok) {
                console.log('[SEC-EDGAR] Index page fetch failed:', indexRes.status);
                return null;
              }
              const indexHtml = await indexRes.text();
              // Extract the primary filing document link (usually the first .htm file in /ix?doc= or direct link)
              // The inline XBRL viewer link looks like: /ix?doc=/Archives/edgar/data/CIK/.../filename.htm
              const ixMatch = indexHtml.match(/\/ix\?doc=(\/Archives\/edgar\/data\/[^"]+\.htm)/);
              if (ixMatch) {
                const docUrl = `https://www.sec.gov${ixMatch[1]}`;
                console.log(`[SEC-EDGAR] Found ${formType} document:`, docUrl);
                const result = {
                  url: docUrl,
                  title: `${info.company} ${year} Annual Report (${formType})`,
                  company: info.company,
                  ticker: info.ticker,
                  fiscalYear: year,
                  periodEnding: filing.period_ending,
                  filedDate: filing.file_date,
                  indexUrl,
                };
                secEdgarCache.set(cacheKey, result);
                return result;
              }
              // Fallback: look for direct .htm links that look like the main filing
              const directMatch = indexHtml.match(/href="(\/Archives\/edgar\/data\/[^"]+\.htm)"/);
              if (directMatch) {
                const docUrl = `https://www.sec.gov${directMatch[1]}`;
                console.log(`[SEC-EDGAR] Found ${formType} document (fallback):`, docUrl);
                const result = {
                  url: docUrl,
                  title: `${info.company} ${year} Annual Report (${formType})`,
                  company: info.company,
                  ticker: info.ticker,
                  fiscalYear: year,
                  periodEnding: filing.period_ending,
                  filedDate: filing.file_date,
                  indexUrl,
                };
                secEdgarCache.set(cacheKey, result);
                return result;
              }
              console.log('[SEC-EDGAR] Could not find 10-K document link in index page');
              return null;
            } catch (e) {
              console.error('[SEC-EDGAR] Error:', e.message);
              return null;
            }
          }

          // ---- Grounding helper ----
          // After the main function-calling response, we do a SECOND Gemini
          // call with google_search enabled to fetch source URLs / grounding
          // metadata for the data the AI produced.
          async function fetchGroundingMetadata(queryText) {
            try {
              const groundingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
              const groundingBody = {
                contents: [{ role: 'user', parts: [{ text: queryText }] }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0, maxOutputTokens: 256 },
              };
              const gRes = await fetch(groundingUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groundingBody),
              });
              if (!gRes.ok) {
                console.error('[mock-api] Grounding lookup failed:', gRes.status);
                return null;
              }
              const gData = await gRes.json();
              const gCandidate = gData?.candidates?.[0];
              if (gCandidate?.groundingMetadata && Object.keys(gCandidate.groundingMetadata).length > 0) {
                const chunks = gCandidate.groundingMetadata.groundingChunks || [];
                console.log('[mock-api] Grounding metadata obtained with', chunks.length, 'chunks');
                // Log full chunk details for debugging
                for (const chunk of chunks) {
                  console.log('[mock-api]   chunk:', JSON.stringify(chunk));
                }

                // Resolve Google grounding redirect URLs to actual URLs
                // The grounding API returns opaque redirect URLs like
                // https://vertexaisearch.cloud.google.com/grounding-api-redirect/...
                // We need to follow the redirect to get the real destination URL.
                for (const chunk of chunks) {
                  if (chunk?.web?.uri && chunk.web.uri.includes('grounding-api-redirect')) {
                    try {
                      const redirectRes = await fetch(chunk.web.uri, {
                        method: 'HEAD',
                        redirect: 'manual',
                        headers: {
                          'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                        },
                      });
                      const location = redirectRes.headers.get('location');
                      if (location) {
                        console.log(
                          '[mock-api]   resolved redirect:',
                          chunk.web.uri.slice(0, 60),
                          '->',
                          location.slice(0, 80)
                        );
                        chunk.web.uri = location;
                      }
                    } catch (e) {
                      console.log('[mock-api]   failed to resolve redirect:', e.message);
                    }
                  }
                }

                return gCandidate.groundingMetadata;
              }
              return null;
            } catch (e) {
              console.error('[mock-api] Grounding lookup error:', e.message);
              return null;
            }
          }

          // Helper to parse Gemini response into our format
          function parseGeminiResponse(data) {
            const candidate = data?.candidates?.[0];
            const parts = candidate?.content?.parts || [];
            const textParts = parts.filter((p) => p.text).map((p) => p.text);
            const functionCalls = parts.filter((p) => p.functionCall);

            const content = textParts.length > 0 ? [{ type: 'text', text: textParts.join('') }] : [];

            // Include search grounding metadata if present
            if (candidate?.groundingMetadata && Object.keys(candidate.groundingMetadata).length > 0) {
              content.push({
                type: 'google_search_grounding_metadata',
                text: JSON.stringify(candidate.groundingMetadata),
              });
            }

            const toolCalls = functionCalls.map((fc, i) => ({
              id: fc.functionCall.name + '_' + Date.now() + '_' + i,
              name: fc.functionCall.name,
              arguments: JSON.stringify(fc.functionCall.args || {}),
              loading: false,
            }));

            return {
              role: 'assistant',
              content,
              contextType: 'userPrompt',
              toolCalls,
              modelKey: usedModelKey,
              isOnPaidPlan: true,
              exceededBillingLimit: false,
            };
          }

          if (useStream) {
            // ---- Streaming via Gemini streamGenerateContent ----
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
              const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiBody),
              });

              if (!geminiRes.ok) {
                const errText = await geminiRes.text();
                console.error('[mock-api] Gemini API error:', geminiRes.status, errText);
                return send(res, {
                  role: 'assistant',
                  content: [{ type: 'text', text: `Gemini API error (${geminiRes.status}): ${errText}` }],
                  contextType: 'userPrompt',
                  toolCalls: [],
                  modelKey: usedModelKey,
                  isOnPaidPlan: true,
                  exceededBillingLimit: false,
                });
              }

              // Stream SSE back to the client
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');
              res.statusCode = 200;

              let accumulatedText = '';
              let accumulatedToolCalls = [];
              let groundingMetadata = null;
              const reader = geminiRes.body.getReader();
              const decoder = new TextDecoder();
              let buffer = '';

              function processGeminiSSEChunk(jsonStr) {
                try {
                  const chunk = JSON.parse(jsonStr);
                  const candidate = chunk?.candidates?.[0];
                  const parts = candidate?.content?.parts || [];
                  for (const part of parts) {
                    if (part.text) {
                      accumulatedText += part.text;
                    }
                    if (part.functionCall) {
                      accumulatedToolCalls.push({
                        id: part.functionCall.name + '_' + Date.now() + '_' + accumulatedToolCalls.length,
                        name: part.functionCall.name,
                        arguments: JSON.stringify(part.functionCall.args || {}),
                        loading: false,
                      });
                    }
                  }
                  // Capture grounding metadata
                  if (candidate?.groundingMetadata && Object.keys(candidate.groundingMetadata).length > 0) {
                    groundingMetadata = candidate.groundingMetadata;
                  }
                  const content = accumulatedText ? [{ type: 'text', text: accumulatedText }] : [];
                  if (groundingMetadata) {
                    content.push({ type: 'google_search_grounding_metadata', text: JSON.stringify(groundingMetadata) });
                  }
                  const responseChunk = {
                    role: 'assistant',
                    content,
                    contextType: 'userPrompt',
                    toolCalls: accumulatedToolCalls,
                    modelKey: usedModelKey,
                    isOnPaidPlan: true,
                    exceededBillingLimit: false,
                  };
                  res.write(`data: ${JSON.stringify(responseChunk)}\n\n`);
                } catch (e) {
                  // skip malformed
                }
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
                      if (jsonStr) processGeminiSSEChunk(jsonStr);
                    }
                  }
                }
                if (buffer.startsWith('data: ')) {
                  const jsonStr = buffer.slice(6).trim();
                  if (jsonStr) processGeminiSSEChunk(jsonStr);
                }
              } finally {
                reader.releaseLock();
              }

              // ---- Source resolution pass (after stream, if tool calls present) ----
              // Priority: 1) Official SEC EDGAR annual report (10-K)
              //           2) Google grounding search (fallback)
              if (accumulatedToolCalls.length > 0 && !isWebSearch) {
                const lastUserMsg = fixedContents.filter((m) => m.role === 'user').pop();
                const userQuery = lastUserMsg?.parts?.map((p) => p.text).join(' ') || '';
                if (userQuery) {
                  // Try to find the official SEC 10-K filing first
                  const secFiling = await resolveAnnualReportUrl(userQuery);
                  let gMeta = null;

                  if (secFiling) {
                    // Build grounding metadata from the SEC filing
                    console.log('[mock-api] Using SEC EDGAR 10-K as primary source:', secFiling.url.slice(0, 80));
                    gMeta = {
                      groundingChunks: [
                        {
                          web: {
                            uri: secFiling.url,
                            title: secFiling.title,
                          },
                        },
                      ],
                      groundingSupports: [],
                      _secFiling: secFiling, // extra metadata for the viewer
                    };
                  } else {
                    // Fallback to Google grounding
                    gMeta = await fetchGroundingMetadata(userQuery);
                  }

                  if (gMeta) {
                    const content = accumulatedText ? [{ type: 'text', text: accumulatedText }] : [];
                    content.push({ type: 'google_search_grounding_metadata', text: JSON.stringify(gMeta) });
                    const finalChunk = {
                      role: 'assistant',
                      content,
                      contextType: 'userPrompt',
                      toolCalls: accumulatedToolCalls,
                      modelKey: usedModelKey,
                      isOnPaidPlan: true,
                      exceededBillingLimit: false,
                    };
                    res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
                  }
                }
              }

              return res.end();
            } catch (err) {
              console.error('[mock-api] Gemini streaming error:', err);
              return send(res, {
                role: 'assistant',
                content: [{ type: 'text', text: `Error calling Gemini: ${err.message}` }],
                contextType: 'userPrompt',
                toolCalls: [],
                modelKey: usedModelKey,
                isOnPaidPlan: true,
                exceededBillingLimit: false,
              });
            }
          } else {
            // ---- Non-streaming ----
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
              const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiBody),
              });

              if (!geminiRes.ok) {
                const errText = await geminiRes.text();
                console.error('[mock-api] Gemini API error:', geminiRes.status, errText);
                return send(res, {
                  role: 'assistant',
                  content: [{ type: 'text', text: `Gemini API error (${geminiRes.status}): ${errText}` }],
                  contextType: 'userPrompt',
                  toolCalls: [],
                  modelKey: usedModelKey,
                  isOnPaidPlan: true,
                  exceededBillingLimit: false,
                });
              }

              const data = await geminiRes.json();
              const parsed = parseGeminiResponse(data);

              // Source resolution for non-streaming — SEC EDGAR first, then fallback
              if (parsed.toolCalls.length > 0 && !isWebSearch) {
                const lastUserMsg = fixedContents.filter((m) => m.role === 'user').pop();
                const userQuery = lastUserMsg?.parts?.map((p) => p.text).join(' ') || '';
                if (userQuery) {
                  const secFiling = await resolveAnnualReportUrl(userQuery);
                  let gMeta = null;
                  if (secFiling) {
                    gMeta = {
                      groundingChunks: [{ web: { uri: secFiling.url, title: secFiling.title } }],
                      groundingSupports: [],
                      _secFiling: secFiling,
                    };
                  } else {
                    gMeta = await fetchGroundingMetadata(userQuery);
                  }
                  if (gMeta) {
                    parsed.content.push({ type: 'google_search_grounding_metadata', text: JSON.stringify(gMeta) });
                  }
                }
              }

              return send(res, parsed);
            } catch (err) {
              console.error('[mock-api] Gemini error:', err);
              return send(res, {
                role: 'assistant',
                content: [{ type: 'text', text: `Error calling Gemini: ${err.message}` }],
                contextType: 'userPrompt',
                toolCalls: [],
                modelKey: usedModelKey,
                isOnPaidPlan: true,
                exceededBillingLimit: false,
              });
            }
          }
        }

        // ---- AI (other endpoints: feedback, codeRunError, plan, etc.) -----
        if (path.match(/\/ai\//) && req.method === 'POST') {
          return send(res, {
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            contextType: 'userPrompt',
            toolCalls: [],
            modelKey: 'gemini-2.0-flash',
            isOnPaidPlan: true,
            exceededBillingLimit: false,
          });
        }
        if (path.match(/\/ai\//) && req.method === 'PATCH') {
          return send(res, { message: 'ok' });
        }

        // ---- Catch-all ----------------------------------------------------
        console.log(`[mock-api] Unhandled: ${req.method} ${path}`);
        return send(res, {});
      });
    },
  };
}

function send(res, data) {
  res.statusCode = 200;
  res.end(JSON.stringify(data));
}
