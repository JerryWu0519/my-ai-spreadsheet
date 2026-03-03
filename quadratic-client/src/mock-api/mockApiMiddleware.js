/**
 * Vite middleware that intercepts requests to the BankSheet API
 * and returns mock data so the frontend can run standalone without a backend.
 *
 * Only active when VITE_AUTH_TYPE=local.
 */

import path from 'path';
import { runOrchestrator, shouldUseRolePipeline } from './roleOrchestrator.js';
import { buildStatementMap, buildMapContextForLLM } from './statementMapper.js';

// Initialize filing HTML cache at module level so it's available to all handlers
if (!globalThis._filingHtmlCache) globalThis._filingHtmlCache = new Map();

// ---------------------------------------------------------------------------
// fetchWithRetry — handles slow-network connect timeouts with retry
// ---------------------------------------------------------------------------
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
        console.log(`[mock-api] ${label} attempt ${attempt}/${retries} timed out, retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

const MOCK_TEAM_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_USER_ID = 1;
const NOW = new Date().toISOString();

// ---------------------------------------------------------------------------
// Gemini configuration – populated by mockApiPlugin() from Vite's loadEnv
// ---------------------------------------------------------------------------
let GEMINI_API_KEY = '';
let GEMINI_MODEL = 'gemini-2.0-flash';

// ---------------------------------------------------------------------------
// OpenAI configuration – for PLANNER and ASSUMPTIONS roles
// ---------------------------------------------------------------------------
let OPENAI_API_KEY = '';
let OPENAI_MODEL = 'gpt-4o';
let PROVIDER_ROUTING = { planner: 'openai', assumptions: 'openai', executor: 'gemini' };

// ---------------------------------------------------------------------------
// Gemini-compatible function declarations for BankSheet AI tools
// Dynamically loaded from aiToolsSpec at server startup via ssrLoadModule
// ---------------------------------------------------------------------------
let GEMINI_TOOL_DECLARATIONS = [];

// Build the Gemini tools payload
let GEMINI_TOOLS = [];

// QuadraticDocs + PythonDocs + FormulaDocs + A1Docs + ValidationDocs
let QUADRATIC_CONTEXT_TEXT = '';

// Per-tool prompt instructions from aiToolsSpec
let TOOL_USE_CONTEXT_TEXT = '';

// Promise that resolves when tools and docs are loaded
let toolsLoadedPromise = null;

// ---------------------------------------------------------------------------
// Convert aiToolsSpec JSON Schema parameters → Gemini Schema format
// (Ported from quadratic-api/src/ai/helpers/genai.helper.ts)
// ---------------------------------------------------------------------------
function convertSingleTypeToGemini(type) {
  const typeMap = { string: 'STRING', number: 'NUMBER', boolean: 'BOOLEAN', null: 'NULL' };
  return { type: typeMap[type] || 'STRING' };
}

function convertParametersToGemini(parameter) {
  if (!parameter) return { type: 'OBJECT', properties: {} };
  // Handle union types (array of type strings like ['string', 'null'])
  if (Array.isArray(parameter.type)) {
    const types = parameter.type;
    if (types.length === 2 && types.includes('null')) {
      const nonNullType = types.find((t) => t !== 'null');
      if (nonNullType) {
        return { ...convertSingleTypeToGemini(nonNullType), nullable: true, description: parameter.description };
      }
    }
    return { anyOf: types.map((t) => convertSingleTypeToGemini(t)), description: parameter.description };
  }
  switch (parameter.type) {
    case 'object':
      return {
        type: 'OBJECT',
        properties: Object.fromEntries(
          Object.entries(parameter.properties || {}).map(([key, value]) => [key, convertParametersToGemini(value)])
        ),
        required: parameter.required,
      };
    case 'array':
      return { type: 'ARRAY', items: convertParametersToGemini(parameter.items) };
    case 'string':
      return { type: 'STRING', description: parameter.description };
    case 'number':
      return { type: 'NUMBER', description: parameter.description };
    case 'boolean':
      return { type: 'BOOLEAN', description: parameter.description };
    case 'null':
      return { type: 'NULL', description: parameter.description };
    default:
      return { type: 'STRING', description: parameter.description };
  }
}

// ---------------------------------------------------------------------------
// Load tools and documentation from the real shared/api source files
// Uses Vite's ssrLoadModule for transparent TypeScript support
// ---------------------------------------------------------------------------
async function loadToolsAndDocs(server) {
  const projectRoot = server.config.root; // quadratic-client/
  const sharedRoot = path.resolve(projectRoot, '../quadratic-shared');
  const apiRoot = path.resolve(projectRoot, '../quadratic-api');

  // --- Load aiToolsSpec ---
  try {
    const specModule = await server.ssrLoadModule(path.resolve(sharedRoot, 'ai/specs/aiToolsSpec.ts'));
    const { aiToolsSpec } = specModule;

    // Filter to AIAnalyst tools compatible with 'fast' mode (Gemini Flash)
    const aiModelMode = 'fast';
    const toolEntries = Object.entries(aiToolsSpec).filter(
      ([_, spec]) => spec.sources?.includes('AIAnalyst') && spec.aiModelModes?.includes(aiModelMode)
    );

    GEMINI_TOOL_DECLARATIONS = toolEntries.map(([name, spec]) => ({
      name,
      description: spec.description,
      parameters: convertParametersToGemini(spec.parameters),
    }));
    GEMINI_TOOLS = [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }];
    console.log(`[mock-api] ✓ Loaded ${GEMINI_TOOL_DECLARATIONS.length} tools from aiToolsSpec`);

    // Build ToolUseContext (per-tool prompts)
    TOOL_USE_CONTEXT_TEXT = toolEntries
      .filter(([_, spec]) => spec.prompt)
      .map(([name, spec]) => `#${name}\n${spec.prompt}`)
      .join('\n\n');
    console.log(
      `[mock-api] ✓ Built ToolUseContext (${TOOL_USE_CONTEXT_TEXT.length} chars, ${toolEntries.filter(([_, s]) => s.prompt).length} tool prompts)`
    );
  } catch (e) {
    console.error('[mock-api] ✗ Could not load aiToolsSpec:', e.message);
    console.error('[mock-api]   AI tool calling will not work!');
  }

  // --- Load documentation files ---
  try {
    const docsDir = path.resolve(apiRoot, 'src/ai/docs');
    const [quadDocs, pyDocs, fDocs, a1Docs, vDocs] = await Promise.all([
      server.ssrLoadModule(path.resolve(docsDir, 'QuadraticDocs.ts')),
      server.ssrLoadModule(path.resolve(docsDir, 'PythonDocs.ts')),
      server.ssrLoadModule(path.resolve(docsDir, 'FormulaDocs.ts')),
      server.ssrLoadModule(path.resolve(docsDir, 'A1Docs.ts')),
      server.ssrLoadModule(path.resolve(docsDir, 'ValidationDocs.ts')),
    ]);

    QUADRATIC_CONTEXT_TEXT = [
      quadDocs.QuadraticDocs || '',
      pyDocs.PythonDocs || '',
      fDocs.FormulaDocs || '',
      a1Docs.A1Docs || '',
      vDocs.ValidationDocs || '',
    ]
      .filter(Boolean)
      .join('\n\n');
    console.log(`[mock-api] ✓ Loaded documentation (${QUADRATIC_CONTEXT_TEXT.length} chars)`);
  } catch (e) {
    console.error('[mock-api] ✗ Could not load documentation:', e.message);
  }
}

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
export function mockApiPlugin(apiUrl, env = {}) {
  // Hydrate Gemini config from Vite's loadEnv (includes .env.local values)
  GEMINI_API_KEY = env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  GEMINI_MODEL = env.VITE_GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
  OPENAI_API_KEY = env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
  OPENAI_MODEL = env.VITE_OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || 'gpt-4o';
  PROVIDER_ROUTING = {
    planner: env.VITE_PLANNER_PROVIDER || 'openai',
    assumptions: env.VITE_ASSUMPTIONS_PROVIDER || 'openai',
    executor: env.VITE_EXECUTOR_PROVIDER || 'gemini',
  };
  console.log('[mock-api] Gemini API key loaded:', GEMINI_API_KEY ? 'YES (ends ...' + GEMINI_API_KEY.slice(-4) + ')' : 'MISSING');
  console.log('[mock-api] OpenAI API key loaded:', OPENAI_API_KEY ? 'YES (ends ...' + OPENAI_API_KEY.slice(-4) + ')' : 'MISSING');
  console.log('[mock-api] Provider routing:', JSON.stringify(PROVIDER_ROUTING));
  return {
    name: 'mock-api',
    configureServer(server) {
      // Start loading tools + docs from the real shared/api source files
      toolsLoadedPromise = loadToolsAndDocs(server);

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

          // Check if we already have this filing's HTML cached from the SEC pre-fetch.
          // This avoids re-fetching from SEC EDGAR (which can 404 due to rate limits,
          // URL changes, or network issues). The middleware already fetched and cached
          // the HTML when building the StatementMap.
          if (globalThis._filingHtmlCache && globalThis._filingHtmlCache.has(url)) {
            console.log('[mock-api] fetch-url: serving cached filing HTML for', url.slice(0, 80));
            return send(res, { html: globalThis._filingHtmlCache.get(url), resolvedUrl: url });
          }

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            // SEC EDGAR requires an identifying User-Agent; other sites need browser-like UA
            const isSEC = url.includes('sec.gov');
            const ua = isSEC
              ? 'BankSheet/1.0 research@example.com'
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

          // ---- Extract original user query text (for source resolution) ----
          // IMPORTANT: We extract this BEFORE building Gemini contents because
          // in multi-turn conversations the last user message in fixedContents
          // may contain only functionResponse parts (tool results) with no .text.
          // We only want the ACTUAL user-typed prompt text, not internal context
          // messages (which have contextType like 'fileSummary', 'visibleData', etc.)
          // The user-typed prompt has contextType === 'userPrompt'.
          const originalUserQuery = (messages || [])
            .filter(
              (m) =>
                m.role === 'user' &&
                m.contextType === 'userPrompt'
            )
            .flatMap((m) =>
              (m.content || []).filter((c) => c.type === 'text' && c.text?.trim()).map((c) => c.text.trim())
            )
            .filter((t) => !t.startsWith('Note: This is an internal message'))
            .join(' ')
            .trim();
          if (originalUserQuery) {
            console.log('[mock-api] Original user query for source resolution:', originalUserQuery.slice(0, 120));
          }

          // ---- Build Gemini contents from BankSheet messages ----
          const geminiContents = [];
          const systemParts = [];

          // Wait for tools/docs to finish loading before proceeding
          if (toolsLoadedPromise) {
            await toolsLoadedPromise;
          }

          // ---- Inject QuadraticDocs system context ----
          // (Matches real API's getQuadraticContext + getToolUseContext)
          systemParts.push({
            text: `Note: This is an internal message for context. Do not quote it in your response.\n\n` +
              `You are a helpful assistant inside of a spreadsheet application called BankSheet.\n` +
              `Keep text responses concise - prefer one sentence and bullet points, use more sentences when necessary for clarity (e.g., explaining errors or complex data transformations). Do not add text comments between tool calls unless necessary; only provide a brief summary after all tools have completed. No fluff or filler language.\n` +
              `You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.\n` +
              `If you are not sure about sheet data content pertaining to the user's request, use your tools to read data and gather the relevant information: do NOT guess or make up an answer.\n` +
              `Be proactive. When the user makes a request, use your tools to solve it.\n\n` +
              `# Reasoning Strategy\n` +
              `1. Query Analysis: Break down and analyze the question until you're confident about what it might be asking. Consider the provided context to help clarify any ambiguous or confusing information.\n` +
              `2. Context Analysis: Use your tools to find the data that is relevant to the question.\n` +
              `3. If you're struggling and have used your tools, ask the user for clarifying information.\n\n` +
              `This is the documentation for the spreadsheet application:\n\n` +
              (QUADRATIC_CONTEXT_TEXT || '') + `\n\n` +
              `Choose the language of your response based on the context and user prompt.\n` +
              `Provide complete code blocks with language syntax highlighting. Don't provide small code snippets of changes.\n\n` +
              `# FINANCIAL DATA RULES (CRITICAL)\n` +
              `When the user asks for ANY financial ratio, metric, or analysis for a public company:\n` +
              `1. NEVER just look up a pre-computed ratio from the web. Instead, extract the RAW COMPONENT DATA (e.g., Total Debt, Total Equity, Revenue, Net Income) from official SEC EDGAR 10-K filings.\n` +
              `2. Put the raw components into an Inputs section with clear labels.\n` +
              `3. CALCULATE the ratio/metric in the sheet using FORMULAS (e.g., =B3/B4 for Debt-to-Equity), not hardcoded values.\n` +
              `4. The Source column for every data cell must show the filing URL (e.g., sec.gov/Archives/...), NOT "Web Search".\n` +
              `5. Only fall back to web search if the data CANNOT be found in SEC filings (e.g., private companies, very recent quarters not yet filed).\n` +
              `6. For ratio analysis, ALWAYS decompose into components: Debt-to-Equity → needs Total Debt + Total Stockholders Equity; Current Ratio → needs Current Assets + Current Liabilities; etc.\n` +
              `7. After writing data, VERIFY each sourced number by cross-checking it against the source document text. If the SEC EDGAR context includes extracted financial items, use those exact numbers.\n` +
              `8. Every cell containing original financial data MUST include a valid source reference (sourceUrl) pointing to the actual filing document.\n` +
              `\n# FORMATTING & UNITS (CRITICAL)\n` +
              `9. ONLY format cells as PERCENTAGE (%) when the value is a rate, ratio, or growth rate (e.g., Revenue Growth = 19.9%, Debt-to-Equity = 0.18).\n` +
              `10. NEVER format Revenue, Net Income, Total Assets, Total Debt, EBIT, Interest Expense, or ANY monetary/dollar value as percentage. Use number or currency format.\n` +
              `11. When calling formatCells, ALWAYS separate dollar-amount cells from ratio/growth cells into DIFFERENT formatCells calls. Example: formatCells for Revenue cells → "#,##0", separate formatCells for Growth Rate cells → "0.00%".\n` +
              `12. Before applying percentage format, CHECK the cell value — if it's in billions (like 97.69) or millions (like 307,394), it's a DOLLAR amount, NOT a percentage.\n` +
              `\n# EXPLICIT UNITS IN SHEET (CRITICAL)\n` +
              `16. ALWAYS show units explicitly in the sheet. Either: (a) add a dedicated "Units" row right after headers (e.g., Row 2: Units | $ millions | $ millions | ...) OR (b) include units in column headers (e.g., "2023 ($M)", "2024 ($M)").\n` +
              `17. All monetary values in the same table MUST be in the SAME unit (all millions, or all billions). NEVER mix units. The unit label must match the actual numbers.\n` +
              `18. If a 10-K reports in millions (e.g., Revenue = 307,394), write 307394 and label the column "$ millions". Do NOT silently convert units without changing the label.\n` +
              `\n# FORMULA EXECUTION (CRITICAL)\n` +
              `19. ALWAYS write data cells first (set_cell_values), THEN write formulas (set_formula_cell_value) as a SEPARATE tool call.\n` +
              `20. NEVER embed formulas (strings starting with =) inside set_cell_values. Formulas MUST use set_formula_cell_value.\n` +
              `21. When writing formulas, carefully count the row numbers to ensure cell references are correct. Example: if EBIT is in row 3 and Interest Expense is in row 4, Interest Coverage = =B3/B4.\n` +
              `22. After writing formulas, verify results with get_cell_values. If any cell shows #REF, #VALUE, or #NAME error, fix the formula.\n` +
              `\n# MULTI-YEAR DATA FROM 10-K FILINGS (CRITICAL)\n` +
              `13. A single 10-K filing contains COMPARATIVE financial data for the current year AND prior year(s). When the user asks for multi-year data, extract ALL years from the SAME 10-K filing.\n` +
              `14. The Source column MUST show "SEC 10-K" for EVERY year's original data — NEVER fall back to "Web Search" for prior years when the 10-K has comparative tables.\n` +
              `15. If a specific value cannot be found in the 10-K filing, explicitly state "Not in 10-K" in the Source column and provide the actual source used.\n`,
          });

          // ---- Inject ToolUseContext (per-tool prompts) ----
          if (TOOL_USE_CONTEXT_TEXT && useToolsPrompt !== false) {
            systemParts.push({
              text: `Note: This is an internal message for context. Do not quote it in your response.\n\n` +
                `Following are the tools you should use to do actions in the spreadsheet, use them to respond to the user prompt.\n\n` +
                `Never guess the answer itself and never make up information to attempt to answer a user's question.\n\n` +
                `Don't include tool details in your response. Reply in layman's terms what actions you are taking.\n\n` +
                `Use multiple tools in a single response if required, use same tool multiple times in a single response if required. Try to reduce tool call iterations.\n\n` +
                TOOL_USE_CONTEXT_TEXT,
            });
          }

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
          const SEC_UA = 'BankSheet/1.0 research@example.com'; // SEC requires identifying UA
          const secEdgarCache = new Map();

          // Known CIK cache — declared here BEFORE the pre-fetch block so
          // extractCompanyFromQuery() can iterate it without hitting TDZ/undefined.
          const KNOWN_CIKS = new Map([
            ['apple', { company: 'Apple Inc.', ticker: 'AAPL', cik: '0000320193' }],
            ['tesla', { company: 'Tesla, Inc.', ticker: 'TSLA', cik: '0001318605' }],
            ['google', { company: 'Alphabet Inc.', ticker: 'GOOGL', cik: '0001652044' }],
            ['alphabet', { company: 'Alphabet Inc.', ticker: 'GOOGL', cik: '0001652044' }],
            ['microsoft', { company: 'Microsoft Corporation', ticker: 'MSFT', cik: '0000789019' }],
            ['amazon', { company: 'Amazon.com, Inc.', ticker: 'AMZN', cik: '0001018724' }],
            ['meta', { company: 'Meta Platforms, Inc.', ticker: 'META', cik: '0001326801' }],
            ['facebook', { company: 'Meta Platforms, Inc.', ticker: 'META', cik: '0001326801' }],
            ['nvidia', { company: 'NVIDIA Corporation', ticker: 'NVDA', cik: '0001045810' }],
            ['netflix', { company: 'Netflix, Inc.', ticker: 'NFLX', cik: '0001065280' }],
            ['jpmorgan', { company: 'JPMorgan Chase & Co.', ticker: 'JPM', cik: '0000019617' }],
            ['coca-cola', { company: 'The Coca-Cola Company', ticker: 'KO', cik: '0000021344' }],
            ['cocacola', { company: 'The Coca-Cola Company', ticker: 'KO', cik: '0000021344' }],
            ['coke', { company: 'The Coca-Cola Company', ticker: 'KO', cik: '0000021344' }],
            ['pepsi', { company: 'PepsiCo, Inc.', ticker: 'PEP', cik: '0000077476' }],
            ['pepsico', { company: 'PepsiCo, Inc.', ticker: 'PEP', cik: '0000077476' }],
            ['walmart', { company: 'Walmart Inc.', ticker: 'WMT', cik: '0000104169' }],
            ['disney', { company: 'The Walt Disney Company', ticker: 'DIS', cik: '0001744489' }],
            ['boeing', { company: 'The Boeing Company', ticker: 'BA', cik: '0000012927' }],
            ['berkshire', { company: 'Berkshire Hathaway Inc.', ticker: 'BRK-B', cik: '0001067983' }],
            ['goldman', { company: 'The Goldman Sachs Group, Inc.', ticker: 'GS', cik: '0000886982' }],
          ]);
          const dynamicCikCache = new Map();

          // ---- Detect internal tool-calling messages ----
          // The client sends separate /v0/ai/chat requests for internal tools like
          // set_chat_name, user_prompt_suggestions, set_file_name, categorized_empty_chat_prompt_suggestions.
          // These do NOT need SEC pre-fetch or source resolution — skip them to avoid
          // wasteful API calls and connection errors.
          const INTERNAL_TOOL_RE = /^(?:Use\s+(?:set_chat_name|user_prompt_suggestions|set_file_name|categorized_empty_chat_prompt_suggestions)\s+tool|Based on the spreadsheet data above,\s*call)/i;
          const isInternalToolCall = INTERNAL_TOOL_RE.test(originalUserQuery);

          // ---- Filing HTML cache (avoids re-fetching the same filing on each request) ----
          // Static cache that persists across requests within the same server lifetime
          if (!globalThis._filingHtmlCache) globalThis._filingHtmlCache = new Map();
          const filingHtmlCache = globalThis._filingHtmlCache;

          // ---- Global caches to prevent redundant SEC operations across tool-call iterations ----
          // resolveAllCompanyFilings results, keyed by normalized query text
          if (!globalThis._allFilingsCache) globalThis._allFilingsCache = new Map();
          // Set of normalized queries that already had SEC context injected into the prompt
          if (!globalThis._secContextInjectedFor) globalThis._secContextInjectedFor = new Set();
          // Set of normalized queries that already had post-stream source resolution done
          if (!globalThis._sourceResolutionDoneFor) globalThis._sourceResolutionDoneFor = new Set();

          const normalizedQuery = originalUserQuery.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

          // Detect tool-call continuation: if the conversation already contains
          // toolResult messages, this is NOT the first iteration — skip heavy work
          const isToolCallContinuation = (messages || []).some(
            (m) => m.contextType === 'toolResult'
          );
          if (isToolCallContinuation) {
            console.log('[mock-api] Tool-call continuation detected — will skip SEC pre-fetch and re-injection');
          }

          // ---- Pre-fetch SEC filing context ----
          // Detect financial queries and inject 10-K data into the prompt
          // ONLY on the FIRST iteration — continuation requests re-use cached context
          let prefetchedSecContext = null;
          if (!isWebSearch && useToolsPrompt !== false && !isInternalToolCall && !isToolCallContinuation && !globalThis._secContextInjectedFor.has(normalizedQuery)) {
            const userQuery = originalUserQuery;
            // Check if this looks like a financial data query
            const financialKeywords =
              /\b(revenue|income|ebit|interest|expense|profit|loss|margin|ratio|coverage|debt|equity|assets|liabilities|earnings|cash flow|operating|net income|gross profit|fiscal|annual|10-k|10k|filing)\b/i;
            if (financialKeywords.test(userQuery)) {
              try {
                // Resolve ALL companies mentioned in the query
                const allFilings = await resolveAllCompanyFilings(userQuery);
                const secFiling = allFilings[0]; // primary filing for context injection
                if (secFiling) {
                  console.log('[mock-api] Pre-fetching SEC filing for context:', secFiling.url.slice(0, 80),
                    '(total companies:', allFilings.length, ')');
                  // Fetch the filing HTML and extract key financial snippets (with cache)
                  let filingHtml = filingHtmlCache.get(secFiling.url);
                  if (!filingHtml) {
                    const filingRes = await fetch(secFiling.url, {
                      headers: { 'User-Agent': SEC_UA },
                      signal: AbortSignal.timeout(30000),
                    });
                    if (filingRes.ok) {
                      filingHtml = await filingRes.text();
                      filingHtmlCache.set(secFiling.url, filingHtml);
                    }
                  }
                  if (filingHtml) {
                    // ---- STATEMENT MAP EXTRACTION (v2) ----
                    // Use structural HTML table parsing instead of regex to extract
                    // financial data with full table/row/column context.
                    const statementMap = buildStatementMap(filingHtml);

                    if (statementMap.tables.length > 0) {
                      // Cache the statement map for potential use by orchestrator
                      if (!globalThis._statementMapCache) globalThis._statementMapCache = new Map();
                      globalThis._statementMapCache.set(secFiling.url, statementMap);

                      prefetchedSecContext = {
                        filing: secFiling,
                        statementMap,
                      };

                      // Build rich context text from the structural map
                      const contextText = buildMapContextForLLM(
                        statementMap,
                        secFiling.url,
                        secFiling.company,
                        secFiling.ticker,
                        secFiling.fiscalYear
                      );

                      // Append critical instructions
                      const instructions = [
                        '',
                        '=== CRITICAL: UNITS & FORMATTING ===',
                        'These are DOLLAR amounts — write them as plain numbers. Format as NUMBER, NOT PERCENTAGE.',
                        'Only format cells as percentage when the value is a RATE or GROWTH — Revenue, Income, Assets, Debt are NEVER percentages.',
                        '',
                        '=== MULTI-YEAR COMPARATIVE DATA ===',
                        `This ${secFiling.fiscalYear} 10-K filing contains COMPARATIVE financial data for prior year(s) (typically ${secFiling.fiscalYear - 1} and/or ${secFiling.fiscalYear - 2}).`,
                        'For multi-year queries: extract ALL years\' data from THIS filing. Do NOT use web search for prior years.',
                        'The prior year values appear in the same financial statements as the current year — they are in adjacent columns of the same tables.',
                        `Source ALL years' data as "SEC 10-K" with this filing URL: ${secFiling.url}`,
                        '',
                        `Source document: ${secFiling.url}`,
                        'IMPORTANT: Do NOT include this URL or the raw filing numbers in your text response. Use the data silently to fill cells.',
                        'IMPORTANT: Revenue and dollar amounts must use NUMBER format, NEVER percentage format. Only growth rates and ratios use percentage format.',
                        'IMPORTANT: For multi-year data, ALL years must be sourced from this 10-K filing. NEVER use "Web Search" as source for any year.',
                        '',
                        '=== EVIDENCE SNIPPET REQUIREMENT ===',
                        'For each SOURCED value in the AssumptionPack, you MUST include an "evidence_snippet" field containing the EXACT row text from the filing table.',
                        'Format: "Row Label | Value1 | Value2 | ..." — copy the row as it appears in the table above.',
                        'Also include "table_id" (e.g. "table_1_income_statement") and "column_label" (e.g. "2024") from the Statement Map.',
                        'These fields enable precise source verification in the Source Viewer.',
                      ].join('\n');

                      const fullContext = contextText + instructions;

                      // Add as the last user message so Gemini sees it right before responding
                      const lastUserIdx = fixedContents.findLastIndex((m) => m.role === 'user');
                      if (lastUserIdx >= 0) {
                        fixedContents[lastUserIdx].parts.push({ text: fullContext });
                      }
                      // Mark as injected so we don't re-inject on tool-call continuations
                      globalThis._secContextInjectedFor.add(normalizedQuery);
                      console.log(
                        `[mock-api] Injected StatementMap context: ${statementMap.tables.length} tables, ` +
                        `periods=[${statementMap.availablePeriods.join(',')}], ` +
                        `statements=[${statementMap.meta.primaryStatements.join(',')}]`
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

          // ---- Dynamic CIK resolver ----
          // Uses SEC EDGAR's company search API to find the CIK for ANY company.
          // (KNOWN_CIKS and dynamicCikCache are declared above, before the pre-fetch block)

          // Fast-path: check the known cache first (case-insensitive word match)
          function extractCompanyFromQuery(text) {
            const lowerText = text.toLowerCase();
            for (const [keyword, info] of KNOWN_CIKS) {
              if (new RegExp(`\\b${keyword}\\b`, 'i').test(lowerText)) {
                return info;
              }
            }
            return null;
          }

          // Extract ALL companies mentioned in the query (for multi-company support)
          function extractAllCompaniesFromQuery(text) {
            const lowerText = text.toLowerCase();
            const seen = new Set();
            const results = [];
            for (const [keyword, info] of KNOWN_CIKS) {
              if (new RegExp(`\\b${keyword}\\b`, 'i').test(lowerText)) {
                // Deduplicate by CIK (e.g., 'google' and 'alphabet' both map to same CIK)
                if (!seen.has(info.cik)) {
                  seen.add(info.cik);
                  results.push(info);
                }
              }
            }
            return results;
          }

          // Dynamic CIK lookup via SEC EDGAR company search API
          // Works for ANY public company — no hardcoded list needed
          async function lookupCIK(companyName, ticker) {
            const cacheKey = `${companyName}|${ticker}`;
            if (dynamicCikCache.has(cacheKey)) return dynamicCikCache.get(cacheKey);

            // Try ticker-based lookup first (most precise)
            if (ticker) {
              try {
                const tickerUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ticker)}%22&dateRange=custom&startdt=2020-01-01&enddt=2030-01-01&forms=10-K,10-Q,20-F&_source=ciks,display_names&from=0&size=1`;
                const tickerRes = await fetch(tickerUrl, {
                  headers: { 'User-Agent': SEC_UA },
                  signal: AbortSignal.timeout(20000),
                });
                if (tickerRes.ok) {
                  const tickerData = await tickerRes.json();
                  const hit = tickerData?.hits?.hits?.[0];
                  if (hit?._source?.ciks?.[0]) {
                    const cik = hit._source.ciks[0];
                    const padded = cik.padStart(10, '0');
                    console.log(`[SEC-EDGAR] Dynamic CIK lookup (ticker ${ticker}):`, padded);
                    dynamicCikCache.set(cacheKey, padded);
                    return padded;
                  }
                }
              } catch (e) {
                console.log('[SEC-EDGAR] Ticker-based CIK lookup failed:', e.message);
              }
            }

            // Fallback: company name search via company_search endpoint
            try {
              const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(companyName)}%22&dateRange=custom&startdt=2020-01-01&enddt=2030-01-01&forms=10-K,20-F&_source=ciks,display_names&from=0&size=3`;
              const searchRes = await fetch(searchUrl, {
                headers: { 'User-Agent': SEC_UA },
                signal: AbortSignal.timeout(20000),
              });
              if (searchRes.ok) {
                const searchData = await searchRes.json();
                const hit = searchData?.hits?.hits?.[0];
                if (hit?._source?.ciks?.[0]) {
                  const cik = hit._source.ciks[0];
                  const padded = cik.padStart(10, '0');
                  console.log(`[SEC-EDGAR] Dynamic CIK lookup (name "${companyName}"):`, padded);
                  dynamicCikCache.set(cacheKey, padded);
                  return padded;
                }
              }
            } catch (e) {
              console.log('[SEC-EDGAR] Name-based CIK lookup failed:', e.message);
            }

            // Last resort: EDGAR company API (tickers endpoint)
            try {
              const tUrl = `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&CIK=&type=10-K&dateb=&owner=include&count=5&search_text=&action=getcompany&output=atom`;
              const tRes = await fetch(tUrl, {
                headers: { 'User-Agent': SEC_UA },
                signal: AbortSignal.timeout(20000),
              });
              if (tRes.ok) {
                const atomText = await tRes.text();
                // Parse CIK from Atom XML: <CIK>0001234567</CIK> or cik= in URLs
                const cikMatch = atomText.match(/CIK=(\d+)/i) || atomText.match(/<CIK>(\d+)<\/CIK>/i);
                if (cikMatch) {
                  const padded = cikMatch[1].padStart(10, '0');
                  console.log(`[SEC-EDGAR] Dynamic CIK lookup (EDGAR browse):`, padded);
                  dynamicCikCache.set(cacheKey, padded);
                  return padded;
                }
              }
            } catch (e) {
              console.log('[SEC-EDGAR] EDGAR browse CIK lookup failed:', e.message);
            }

            dynamicCikCache.set(cacheKey, null);
            return null;
          }

          // Resolve ALL companies in the query and return an array of filing objects.
          // Each filing has { url, title, company, ticker, fiscalYear }.
          // Uses globalThis._allFilingsCache to avoid re-resolving across tool-call iterations.
          async function resolveAllCompanyFilings(queryText) {
            const cacheKey = queryText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
            if (globalThis._allFilingsCache.has(cacheKey)) {
              const cached = globalThis._allFilingsCache.get(cacheKey);
              console.log('[SEC-EDGAR] Using globally cached filings for query:', cacheKey.slice(0, 60), '→', cached.length, 'filings');
              return cached;
            }
            const allCompanies = extractAllCompaniesFromQuery(queryText);
            if (allCompanies.length === 0) {
              // Fall back to single-company Gemini extraction
              const singleFiling = await resolveAnnualReportUrl(queryText);
              const result = singleFiling ? [singleFiling] : [];
              globalThis._allFilingsCache.set(cacheKey, result);
              return result;
            }
            // For each company found, resolve its 10-K filing
            const filings = [];
            for (const companyInfo of allCompanies) {
              try {
                // Build a focused query for this specific company
                const focusedQuery = `${companyInfo.company} (${companyInfo.ticker}) ${queryText.match(/\b(20\d{2})\b/)?.[1] || ''}`;
                const filing = await resolveAnnualReportUrl(focusedQuery);
                if (filing) filings.push(filing);
              } catch (e) {
                console.log(`[SEC-EDGAR] Failed to resolve ${companyInfo.company}:`, e.message);
              }
            }
            globalThis._allFilingsCache.set(cacheKey, filings);
            return filings;
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
                  signal: AbortSignal.timeout(20000),
                });
                if (extractRes.ok) {
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
                } else {
                  console.log('[SEC-EDGAR] Gemini extraction failed:', extractRes.status);
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

              // Enrich info with CIK — fast-path from cache, then dynamic lookup
              if (!info.cik) {
                const regexInfo = extractCompanyFromQuery(queryText);
                if (regexInfo?.cik) {
                  info.cik = regexInfo.cik;
                } else {
                  // Dynamic lookup for ANY company via SEC EDGAR APIs
                  const dynamicCik = await lookupCIK(info.company, info.ticker);
                  if (dynamicCik) {
                    info.cik = dynamicCik;
                  }
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
                    signal: AbortSignal.timeout(20000),
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
                  signal: AbortSignal.timeout(20000),
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

          // ---- 3-ROLE ORCHESTRATOR CHECK ----
          // For structured data-creation queries (financial models, analysis, etc.),
          // route through the PLANNER → ASSUMPTIONS → EXECUTOR pipeline.
          // For simple queries, pass through to direct Gemini call.
          if (
            !isWebSearch &&
            !isInternalToolCall &&
            !isToolCallContinuation &&
            useToolsPrompt !== false &&
            shouldUseRolePipeline(originalUserQuery)
          ) {
            console.log('[mock-api] ✓ Routing to 3-role orchestrator pipeline');
            try {
              // Gather spreadsheet context for the planner
              const spreadsheetContext = fixedContents
                .filter(m => m.role === 'user')
                .flatMap(m => (m.parts || []).filter(p => p.text))
                .map(p => p.text)
                .join('\n')
                .slice(0, 8000); // limit context size

              // Gather SEC context if available (matches both SEC EDGAR and SEC FILING CONTEXT headers)
              const secContext = fixedContents
                .filter(m => m.role === 'user')
                .flatMap(m => (m.parts || []).filter(p => p.text && (
                  p.text.includes('SEC EDGAR') ||
                  p.text.includes('SEC FILING CONTEXT') ||
                  p.text.includes('EXTRACTED FINANCIAL LINE ITEMS') ||
                  p.text.includes('STATEMENT MAP') ||
                  p.text.includes('Source URL: https://www.sec.gov')
                )))
                .map(p => p.text)
                .join('\n');

              const providerConfig = {
                gemini: { apiKey: GEMINI_API_KEY, model: GEMINI_MODEL },
                openai: { apiKey: OPENAI_API_KEY, model: OPENAI_MODEL },
                routing: PROVIDER_ROUTING,
              };

              await runOrchestrator({
                userQuery: originalUserQuery,
                providerConfig,
                systemContext: QUADRATIC_CONTEXT_TEXT,
                spreadsheetContext,
                secContext: secContext || null,
                geminiContents: fixedContents,
                geminiTools,
                geminiToolConfig,
                systemParts,
                res,
                modelKey: usedModelKey,
              });
              return; // orchestrator handled the response
            } catch (orchErr) {
              console.error('[mock-api] Orchestrator failed, falling back to direct mode:', orchErr.message);
              // If orchestrator already started streaming, we can't fall back — the connection is committed
              if (res.headersSent) {
                console.error('[mock-api] Headers already sent, cannot fall back to direct mode');
                try { res.end(); } catch {}
                return;
              }
              // Fall through to direct Gemini call
            }
          }

          if (useStream) {
            // ---- Streaming via Gemini streamGenerateContent ----
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
              const geminiRes = await fetchWithRetry(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiBody),
              }, { retries: 3, timeout: 120000, label: 'GeminiDirect' });

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

              // ---- Source resolution pass (after stream) ----
              // Inject _sourceUrls into tool call args so the client can build provenance.
              // On the FIRST iteration, resolve SEC filings. On continuations, use cache.
              // Skip for internal tool calls (set_chat_name, user_prompt_suggestions, etc.)
              if (accumulatedToolCalls.length > 0 && !isWebSearch && !isInternalToolCall) {
                const userQuery = originalUserQuery;
                if (userQuery) {
                  let gMeta = null;

                  // Use globally cached filings (resolveAllCompanyFilings itself caches)
                  try {
                    const allFilings = await resolveAllCompanyFilings(userQuery);
                    if (allFilings.length > 0) {
                      gMeta = {
                        groundingChunks: allFilings.map(f => ({ web: { uri: f.url, title: f.title } })),
                        groundingSupports: [],
                        _secFilings: allFilings,
                      };
                    }
                  } catch (e) {
                    console.log('[mock-api] SEC source resolution failed (non-fatal):', e.message);
                  }

                  // Only fall back to Google grounding on the FIRST iteration
                  // (avoids extra Gemini API call on continuations)
                  if (!gMeta && !isToolCallContinuation) {
                    gMeta = await fetchGroundingMetadata(userQuery);
                  }

                  if (gMeta) {
                    // Belt-and-suspenders: inject _sourceUrls directly into each tool call's
                    // arguments JSON so the client has them even if content-based extraction fails
                    const sourceUrlsForArgs = (gMeta.groundingChunks || [])
                      .filter(c => c?.web?.uri)
                      .map(c => ({ title: c.web.title || c.web.uri, uri: c.web.uri }));
                    for (const tc of accumulatedToolCalls) {
                      try {
                        const parsedArgs = JSON.parse(tc.arguments);
                        parsedArgs._sourceUrls = sourceUrlsForArgs;
                        parsedArgs._responseText = accumulatedText || '';
                        tc.arguments = JSON.stringify(parsedArgs);
                      } catch {}
                    }

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
                    console.log('[mock-api] ✓ Writing grounding SSE chunk with', content.length, 'content items,',
                      'groundingChunks:', JSON.stringify((gMeta.groundingChunks || []).map(c => c?.web?.uri?.slice(0, 60))),
                      'toolCallsWithSourceUrls:', accumulatedToolCalls.length);
                    res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
                  } else {
                    console.log('[mock-api] ✗ No grounding metadata obtained for source resolution');
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

              // Source resolution for non-streaming — uses global cache
              if (parsed.toolCalls.length > 0 && !isWebSearch && !isInternalToolCall) {
                const userQuery = originalUserQuery;
                if (userQuery) {
                  let gMeta = null;
                  try {
                    const allFilings = await resolveAllCompanyFilings(userQuery);
                    if (allFilings.length > 0) {
                      gMeta = {
                        groundingChunks: allFilings.map(f => ({ web: { uri: f.url, title: f.title } })),
                        groundingSupports: [],
                        _secFilings: allFilings,
                      };
                    }
                  } catch (e) {
                    console.log('[mock-api] SEC source resolution failed (non-fatal):', e.message);
                  }
                  if (!gMeta && !isToolCallContinuation) {
                    gMeta = await fetchGroundingMetadata(userQuery);
                  }
                  if (gMeta) {
                    parsed.content.push({ type: 'google_search_grounding_metadata', text: JSON.stringify(gMeta) });
                    // Also inject _sourceUrls into tool call args (belt-and-suspenders)
                    const sourceUrlsForArgs = (gMeta.groundingChunks || [])
                      .filter(c => c?.web?.uri)
                      .map(c => ({ title: c.web.title || c.web.uri, uri: c.web.uri }));
                    for (const tc of parsed.toolCalls) {
                      try {
                        const parsedArgs = JSON.parse(tc.arguments);
                        parsedArgs._sourceUrls = sourceUrlsForArgs;
                        tc.arguments = JSON.stringify(parsedArgs);
                      } catch {}
                    }
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
