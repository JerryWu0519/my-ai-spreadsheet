import { useAIModel } from '@/app/ai/hooks/useAIModel';
import { useAIRequestToAPI } from '@/app/ai/hooks/useAIRequestToAPI';
import { useAITransactions } from '@/app/ai/hooks/useAITransactions';
import { useCodeErrorMessages } from '@/app/ai/hooks/useCodeErrorMessages';
import { useCurrentDateTimeContextMessages } from '@/app/ai/hooks/useCurrentDateTimeContextMessages';
import { useFilesContextMessages } from '@/app/ai/hooks/useFilesContextMessages';
import { useGetUserPromptSuggestions } from '@/app/ai/hooks/useGetUserPromptSuggestions';
import { useImportFilesToGrid, type ImportFile } from '@/app/ai/hooks/useImportFilesToGrid';
import { useSqlContextMessages } from '@/app/ai/hooks/useSqlContextMessages';
import { useSummaryContextMessages } from '@/app/ai/hooks/useSummaryContextMessages';
import { useVisibleContextMessages } from '@/app/ai/hooks/useVisibleContextMessages';
import { aiToolsActions } from '@/app/ai/tools/aiToolsActions';
import {
  aiAnalystAbortControllerAtom,
  aiAnalystCurrentChatAtom,
  aiAnalystCurrentChatMessagesAtom,
  aiAnalystCurrentChatMessagesCountAtom,
  aiAnalystLoadingAtom,
  aiAnalystPDFImportAtom,
  aiAnalystPromptSuggestionsAtom,
  aiAnalystShowChatHistoryAtom,
  aiAnalystWaitingOnMessageIndexAtom,
  aiAnalystWebSearchAtom,
  showAIAnalystAtom,
} from '@/app/atoms/aiAnalystAtom';
import { debugFlag } from '@/app/debugFlags/debugFlags';
import { sheets } from '@/app/grid/controller/Sheets';
import { inlineEditorHandler } from '@/app/gridGL/HTMLGrid/inlineEditor/inlineEditorHandler';
import { useConnectionsFetcher } from '@/app/ui/hooks/useConnectionsFetcher';
import { debugAIContext } from '@/app/ui/menus/AIAnalyst/hooks/debugContext';
import { useAnalystPDFImport } from '@/app/ui/menus/AIAnalyst/hooks/useAnalystPDFImport';
import { useAnalystWebSearch } from '@/app/ui/menus/AIAnalyst/hooks/useAnalystWebSearch';
import { aiUser } from '@/app/web-workers/multiplayerWebWorker/aiUser';
import { multiplayer } from '@/app/web-workers/multiplayerWebWorker/multiplayer';
import { trackEvent } from '@/shared/utils/analyticsEvents';
import {
  createTextContent,
  getLastAIPromptMessageIndex,
  getMessagesForAI,
  getPromptAndInternalMessages,
  getUserPromptMessages,
  isAIPromptMessage,
  isContentFile,
  isContentText,
  removeOldFilesInToolResult,
  replaceOldGetToolCallResults,
} from 'quadratic-shared/ai/helpers/message.helper';
import { AITool, aiToolsSpec, type AIToolsArgsSchema } from 'quadratic-shared/ai/specs/aiToolsSpec';
import type {
  AIMessage,
  ChatMessage,
  Content,
  Context,
  ToolResultMessage,
  UserMessagePrompt,
} from 'quadratic-shared/typesAndSchemasAI';
import { ConnectionTypeSchema } from 'quadratic-shared/typesAndSchemasConnections';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import type { z } from 'zod';

const USE_STREAM = true;
const MAX_TOOL_CALL_ITERATIONS = 35;

export type SubmitAIAnalystPromptArgs = {
  messageSource: string;
  content: Content;
  context: Context;
  messageIndex: number;
  importFiles: ImportFile[];
};

// // Include a screenshot of what the user is seeing
// async function getUserScreen(): Promise<ChatMessage | undefined> {
//   const currentScreen = await getScreenImage();
//   if (currentScreen) {
//     const reader = new FileReader();
//     const base64 = await new Promise<string>((resolve) => {
//       reader.onloadend = () => {
//         const result = reader.result as string;
//         resolve(result.split(',')[1]);
//       };
//       reader.readAsDataURL(currentScreen);
//     });
//     return {
//       role: 'user',
//       content: [{ type: 'data', data: base64, mimeType: 'image/png', fileName: 'screen.png' }],
//       contextType: 'userPrompt',
//     };
//   }
// }

export function useSubmitAIAnalystPrompt() {
  const aiModel = useAIModel();
  const { handleAIRequestToAPI } = useAIRequestToAPI();
  const { getSqlContext } = useSqlContextMessages();
  const { getFilesContext } = useFilesContextMessages();
  const { getCurrentDateTimeContext } = useCurrentDateTimeContextMessages();
  const { getVisibleContext } = useVisibleContextMessages();
  const { getSummaryContext } = useSummaryContextMessages();
  const { getCodeErrorContext } = useCodeErrorMessages();
  const { importPDF } = useAnalystPDFImport();
  const { search } = useAnalystWebSearch();
  const { getUserPromptSuggestions } = useGetUserPromptSuggestions();
  const { getAITransactions } = useAITransactions();
  const { importFilesToGrid } = useImportFilesToGrid();
  const { connections } = useConnectionsFetcher();

  const updateInternalContext = useRecoilCallback(
    () =>
      async ({ chatMessages, context }: { chatMessages: ChatMessage[]; context: Context }): Promise<ChatMessage[]> => {
        const [sqlContext, filesContext, visibleContext, summaryContext, codeErrorContext, aiTransactions] =
          await Promise.all([
            getSqlContext({ connections, context }),
            getFilesContext({ chatMessages }),
            getVisibleContext(),
            getSummaryContext(),
            getCodeErrorContext(),
            getAITransactions(),
          ]);

        const messagesWithContext: ChatMessage[] = [
          ...sqlContext,
          ...filesContext,
          ...getCurrentDateTimeContext(),
          ...aiTransactions,
          ...visibleContext,
          ...summaryContext,
          ...codeErrorContext,
          ...getPromptAndInternalMessages(chatMessages),
        ];

        return messagesWithContext;
      },
    [
      connections,
      getSqlContext,
      getFilesContext,
      getCurrentDateTimeContext,
      getVisibleContext,
      getSummaryContext,
      getCodeErrorContext,
      getAITransactions,
    ]
  );

  const submitPrompt = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({ messageSource, content, context, messageIndex, importFiles }: SubmitAIAnalystPromptArgs) => {
        set(showAIAnalystAtom, true);
        set(aiAnalystShowChatHistoryAtom, false);

        // Abort any in-flight suggestion request and clear suggestions.
        // PromptSuggestions delays unmounting (see AIAnalystMessages) so HoverCard portals can tear down safely.
        const prevSuggestions = snapshot.getLoadable(aiAnalystPromptSuggestionsAtom).getValue();
        const abortedBefore = prevSuggestions.abortController?.signal.aborted;
        prevSuggestions.abortController?.abort();
        queueMicrotask(() => {
          // Skip update if already aborted, as component state may be stale or tearing down.
          if (abortedBefore) return;
          // Only clear if the atom still has the controller we aborted; a newer submitPrompt may have run.
          set(aiAnalystPromptSuggestionsAtom, (current) => {
            if (current.abortController !== prevSuggestions.abortController) return current;
            return { abortController: undefined, suggestions: [] };
          });
        });

        const previousLoading = await snapshot.getPromise(aiAnalystLoadingAtom);
        if (previousLoading) return;

        const currentMessageCount = await snapshot.getPromise(aiAnalystCurrentChatMessagesCountAtom);
        if (messageIndex === 0) {
          set(aiAnalystCurrentChatAtom, {
            id: v4(),
            name: '',
            lastUpdated: Date.now(),
            messages: [],
          });
        }
        // fork chat, if we are editing an existing chat
        else if (messageIndex < currentMessageCount) {
          set(aiAnalystCurrentChatAtom, (prev) => {
            return {
              id: v4(),
              name: '',
              lastUpdated: Date.now(),
              messages: prev.messages.slice(0, messageIndex).map((message) => ({ ...message })),
            };
          });
        }

        // Look up connection from connections array if available, otherwise use the context directly
        // (context.connection may already have complete info from URL params)
        const connectionInContext = connections.find((connection) => connection.uuid === context.connection?.id);
        const resolvedConnection = connectionInContext
          ? {
              type: connectionInContext.type,
              id: connectionInContext.uuid,
              name: connectionInContext.name,
            }
          : context.connection && ConnectionTypeSchema.safeParse(context.connection.type).success
            ? context.connection
            : undefined; // Only use fallback if connection type is valid

        context = {
          codeCell: context.codeCell,
          connection: resolvedConnection,
          importFiles:
            importFiles.length > 0
              ? {
                  prompt: '',
                  files: importFiles.map((file) => ({ name: file.name, size: file.size })),
                }
              : undefined,
        };

        const onExceededBillingLimit = (exceededBillingLimit: boolean) => {
          if (!exceededBillingLimit) {
            return;
          }

          set(aiAnalystCurrentChatMessagesAtom, (prev) => {
            const currentMessage = [...prev];
            currentMessage.pop();
            messageIndex = currentMessage.length - 1;
            return currentMessage;
          });

          set(aiAnalystWaitingOnMessageIndexAtom, messageIndex);

          trackEvent('[Billing].ai.exceededBillingLimit', {
            exceededBillingLimit: exceededBillingLimit,
            location: 'AIAnalyst',
          });
        };

        const abortController = new AbortController();
        abortController.signal.addEventListener('abort', () => {
          let prevWaitingOnMessageIndex: number | undefined = undefined;
          set(aiAnalystWaitingOnMessageIndexAtom, (prev) => {
            prevWaitingOnMessageIndex = prev;
            return undefined;
          });
          set(aiAnalystPDFImportAtom, (prev) => {
            prev.abortController?.abort();
            return { abortController: undefined, loading: false };
          });
          set(aiAnalystWebSearchAtom, (prev) => {
            prev.abortController?.abort();
            return { abortController: undefined, loading: false };
          });

          set(aiAnalystCurrentChatMessagesAtom, (prevMessages) => {
            const lastMessage = prevMessages.at(-1);
            if (!!lastMessage && isAIPromptMessage(lastMessage)) {
              const newLastMessage = { ...lastMessage };
              let currentContent = { ...(newLastMessage.content.at(-1) ?? createTextContent('')) };
              if (currentContent?.type !== 'text') {
                currentContent = createTextContent('');
              }
              currentContent.text += '\n\nRequest aborted by the user.';
              currentContent.text = currentContent.text.trim();
              newLastMessage.toolCalls = [];
              newLastMessage.content = [...newLastMessage.content.slice(0, -1), currentContent];
              return [...prevMessages.slice(0, -1), newLastMessage];
            } else if (lastMessage?.role === 'user') {
              if (prevWaitingOnMessageIndex !== undefined) {
                return prevMessages;
              }

              const newLastMessage: AIMessage = {
                role: 'assistant',
                content: [createTextContent('Request aborted by the user.')],
                contextType: 'userPrompt',
                toolCalls: [],
                modelKey: aiModel.modelKey,
              };
              return [...prevMessages, newLastMessage];
            }
            return prevMessages;
          });

          set(aiAnalystWaitingOnMessageIndexAtom, undefined);
        });
        set(aiAnalystAbortControllerAtom, abortController);

        const userMessage: UserMessagePrompt = {
          role: 'user' as const,
          content: [...content],
          contextType: 'userPrompt' as const,
          context: { ...context },
        };
        set(aiAnalystCurrentChatMessagesAtom, (prevMessages) => {
          return [...prevMessages, { ...userMessage }];
        });

        set(aiAnalystLoadingAtom, true);

        // Show AI cursor at A1 when AI joins the document
        try {
          // Initialize AI user in multiplayer system
          multiplayer.setAIUser(true);

          // Update AI cursor to A1
          const sheetId = sheets.current;
          const jsSelection = sheets.stringToSelection('A1', sheetId);
          const selectionString = jsSelection.save();
          aiUser.updateSelection(selectionString, sheetId);
        } catch (e) {
          console.warn('Failed to initialize AI cursor:', e);
        }

        await importFilesToGrid({ importFiles, userMessage });

        let lastMessageIndex = -1;
        let chatId = '';
        let chatMessages: ChatMessage[] = [];
        set(aiAnalystCurrentChatAtom, (prev) => {
          chatId = prev.id ? prev.id : v4();
          chatMessages = [...prev.messages];
          return {
            ...prev,
            id: chatId,
            lastUpdated: Date.now(),
            messages: [...chatMessages],
          };
        });

        try {
          // Handle tool calls
          let toolCallIterations = 0;

          // Cache grounding data across multi-turn iterations so that
          // grounding URLs from a web_search turn persist into the next
          // set_cell_values turn (Gemini often splits these into separate turns).
          let cachedGroundingUrls: Array<{ title: string; uri: string }> = [];
          let cachedGroundingSupports: Array<{
            segment: { text: string };
            chunkIndices: number[];
          }> = [];
          let cachedResponseText = '';

          while (toolCallIterations < MAX_TOOL_CALL_ITERATIONS) {
            toolCallIterations++;

            // Update internal context
            chatMessages = await updateInternalContext({ chatMessages, context });
            set(aiAnalystCurrentChatMessagesAtom, chatMessages);

            const messagesForAI = getMessagesForAI(chatMessages);
            lastMessageIndex = getLastAIPromptMessageIndex(messagesForAI);

            if (debugFlag('debugLogJsonAIInternalContext')) {
              debugAIContext(messagesForAI);
              console.log('AIAnalyst messages:', messagesForAI);
            }

            if (debugFlag('debugLogReadableAIInternalContext')) {
              console.log(
                getUserPromptMessages(messagesForAI)
                  .map((message) => {
                    return `${message.role}: ${message.content.map((content) => {
                      if (isContentText(content)) {
                        return content.text;
                      } else {
                        return 'data';
                      }
                    })}`;
                  })
                  .join('\n')
              );
            }

            const response = await handleAIRequestToAPI({
              chatId,
              source: 'AIAnalyst',
              messageSource,
              modelKey: aiModel.modelKey,
              messages: messagesForAI,
              useStream: USE_STREAM,
              toolName: undefined,
              useToolsPrompt: true,
              language: undefined,
              useQuadraticContext: true,
              setMessages: (updater) => set(aiAnalystCurrentChatMessagesAtom, updater),
              signal: abortController.signal,
              onExceededBillingLimit,
            });

            const waitingOnMessageIndex = await snapshot.getPromise(aiAnalystWaitingOnMessageIndexAtom);
            if (waitingOnMessageIndex !== undefined) {
              break;
            }

            if (response.error) {
              break;
            }

            let nextChatMessages: ChatMessage[] = [];
            set(aiAnalystCurrentChatMessagesAtom, (prev) => {
              nextChatMessages = replaceOldGetToolCallResults(prev);
              return nextChatMessages;
            });
            chatMessages = nextChatMessages;

            if (abortController.signal.aborted) {
              break;
            }

            if (response.toolCalls.length === 0) {
              getUserPromptSuggestions();
              break;
            }

            messageSource = response.toolCalls.map((toolCall) => toolCall.name).join(', ');

            // Extract grounding data from THIS iteration's response
            // BEFORE the per-tool-call loop (so web_search grounding is captured)
            {
              const iterUrls: Array<{ title: string; uri: string }> = [];
              const iterSupports: Array<{
                segment: { text: string };
                chunkIndices: number[];
              }> = [];
              for (const c of response.content ?? []) {
                if ((c as any).type === 'google_search_grounding_metadata') {
                  try {
                    const meta = JSON.parse((c as any).text);
                    if (meta?.groundingChunks) {
                      for (const chunk of meta.groundingChunks) {
                        if (chunk?.web?.uri) {
                          iterUrls.push({
                            title: chunk.web.title || chunk.web.uri,
                            uri: chunk.web.uri,
                          });
                        }
                      }
                    }
                    if (meta?.groundingSupports) {
                      for (const support of meta.groundingSupports) {
                        if (support?.segment?.text) {
                          iterSupports.push({
                            segment: { text: support.segment.text },
                            chunkIndices: support.groundingChunkIndices || [],
                          });
                        }
                      }
                    }
                  } catch {
                    // ignore parse errors
                  }
                }
              }
              const iterText = (response.content ?? [])
                .filter((c: any) => c.type === 'text')
                .map((c: any) => c.text)
                .join(' ');
              // Update cache: prefer fresh data, keep old if new is empty
              if (iterUrls.length > 0) {
                cachedGroundingUrls = iterUrls;
                cachedGroundingSupports = iterSupports;
              }
              if (iterText) cachedResponseText = iterText;
            }

            // Message containing tool call results
            const toolResultMessage: ToolResultMessage = {
              role: 'user',
              content: [],
              contextType: 'toolResult',
            };

            let promptSuggestions: z.infer<
              (typeof AIToolsArgsSchema)[AITool.UserPromptSuggestions]
            >['prompt_suggestions'] = [];

            for (const toolCall of response.toolCalls) {
              if (toolCall.name === AITool.PDFImport || toolCall.name === AITool.WebSearch) {
                continue;
              }

              if (Object.values(AITool).includes(toolCall.name as AITool)) {
                try {
                  inlineEditorHandler.close({ skipFocusGrid: true });
                  const aiTool = toolCall.name as AITool;
                  const argsObject = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};

                  // Save server-side injected source URLs BEFORE Zod strips them
                  const rawSourceUrls = argsObject._sourceUrls;
                  const rawResponseText = argsObject._responseText;
                  const rawGroundingSupports = argsObject._groundingSupports;

                  // Prefer client-extracted grounding (from SSE content), fall back to
                  // server-injected (from tool call args) — belt-and-suspenders approach
                  const effectiveUrls =
                    cachedGroundingUrls.length > 0
                      ? cachedGroundingUrls
                      : Array.isArray(rawSourceUrls) && rawSourceUrls.length > 0
                        ? rawSourceUrls
                        : [];
                  const effectiveText = cachedResponseText || rawResponseText || '';
                  const effectiveSupports =
                    cachedGroundingSupports.length > 0
                      ? cachedGroundingSupports
                      : Array.isArray(rawGroundingSupports) && rawGroundingSupports.length > 0
                        ? rawGroundingSupports
                        : [];

                  if (effectiveUrls.length > 0 || effectiveText) {
                    argsObject._sourceUrls = effectiveUrls;
                    argsObject._responseText = effectiveText;
                    argsObject._groundingSupports = effectiveSupports;
                  }

                  // Save _provenance before Zod strips it
                  const rawProvenance = argsObject._provenance;
                  // Save _assumptionPack from 3-role orchestrator before Zod strips it
                  const rawAssumptionPack = argsObject._assumptionPack;

                  const args = aiToolsSpec[aiTool].responseSchema.parse(argsObject);

                  // Re-inject ALL extra fields after Zod parse (Zod strips unknown keys)
                  if (effectiveUrls.length > 0 || effectiveText) {
                    (args as any)._sourceUrls = effectiveUrls;
                    (args as any)._responseText = effectiveText;
                    (args as any)._groundingSupports = effectiveSupports;
                  }
                  if (rawProvenance) {
                    (args as any)._provenance = rawProvenance;
                  }
                  if (rawAssumptionPack) {
                    (args as any)._assumptionPack = rawAssumptionPack;
                  }

                  const toolResultContent = await aiToolsActions[aiTool](args as any, {
                    source: 'AIAnalyst',
                    chatId,
                    messageIndex: lastMessageIndex + 1,
                  });
                  toolResultMessage.content.push({
                    id: toolCall.id,
                    content: toolResultContent,
                  });

                  if (aiTool === AITool.UserPromptSuggestions) {
                    promptSuggestions = (args as any).prompt_suggestions;
                  }
                } catch (error) {
                  toolResultMessage.content.push({
                    id: toolCall.id,
                    content: [createTextContent(`Error parsing ${toolCall.name} tool's arguments: ${error}`)],
                  });
                }
              } else {
                toolResultMessage.content.push({
                  id: toolCall.id,
                  content: [createTextContent('Unknown tool')],
                });
              }
            }

            const importPDFToolCalls = response.toolCalls.filter((toolCall) => toolCall.name === AITool.PDFImport);
            for (const toolCall of importPDFToolCalls) {
              const argsObject = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
              const pdfImportArgs = aiToolsSpec[AITool.PDFImport].responseSchema.parse(argsObject);
              const toolResultContent = await importPDF({ pdfImportArgs, chatMessages });
              toolResultMessage.content.push({
                id: toolCall.id,
                content: toolResultContent,
              });
            }

            const webSearchToolCalls = response.toolCalls.filter((toolCall) => toolCall.name === AITool.WebSearch);
            for (const toolCall of webSearchToolCalls) {
              const argsObject = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
              const searchArgs = aiToolsSpec[AITool.WebSearch].responseSchema.parse(argsObject);
              const { toolResultContent, internal } = await search({ searchArgs });
              toolResultMessage.content.push({
                id: toolCall.id,
                content: toolResultContent,
              });

              if (internal) {
                let nextChatMessages: ChatMessage[] = [];
                set(aiAnalystCurrentChatMessagesAtom, (prev) => {
                  nextChatMessages = [...prev, internal];
                  return nextChatMessages;
                });
                chatMessages = nextChatMessages;
              }
            }

            const filesInToolResult = toolResultMessage.content.reduce((acc, result) => {
              result.content.forEach((content) => {
                if (isContentFile(content)) {
                  acc.add(content.fileName);
                }
              });
              return acc;
            }, new Set<string>());

            set(aiAnalystCurrentChatMessagesAtom, (prev) => {
              nextChatMessages = [...removeOldFilesInToolResult(prev, filesInToolResult), toolResultMessage];
              return nextChatMessages;
            });
            chatMessages = nextChatMessages;

            // prompt suggestion requires user input, break the loop
            if (promptSuggestions.length > 0) {
              set(aiAnalystPromptSuggestionsAtom, {
                abortController: undefined,
                suggestions: promptSuggestions,
              });
              break;
            }
          }
        } catch (error) {
          set(aiAnalystCurrentChatMessagesAtom, (prevMessages) => {
            const lastMessage = prevMessages.at(-1);
            if (!!lastMessage && isAIPromptMessage(lastMessage)) {
              const newLastMessage = { ...lastMessage };
              let currentContent = { ...(newLastMessage.content.at(-1) ?? createTextContent('')) };
              if (currentContent?.type !== 'text') {
                currentContent = createTextContent('');
              }
              currentContent.text += '\n\nLooks like there was a problem. Please try again.';
              currentContent.text = currentContent.text.trim();
              newLastMessage.toolCalls = [];
              newLastMessage.content = [...newLastMessage.content.slice(0, -1), currentContent];
              return [...prevMessages.slice(0, -1), newLastMessage];
            } else if (lastMessage?.role === 'user') {
              const newLastMessage: AIMessage = {
                role: 'assistant',
                content: [createTextContent('Looks like there was a problem. Please try again.')],
                contextType: 'userPrompt',
                toolCalls: [],
                modelKey: aiModel.modelKey,
              };
              return [...prevMessages, newLastMessage];
            }
            return prevMessages;
          });

          console.error(error);
        }

        set(aiAnalystAbortControllerAtom, undefined);
        set(aiAnalystLoadingAtom, false);
      },
    [
      aiModel.modelKey,
      connections,
      handleAIRequestToAPI,
      updateInternalContext,
      importPDF,
      search,
      getUserPromptSuggestions,
      importFilesToGrid,
    ]
  );

  return { submitPrompt };
}
