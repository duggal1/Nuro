/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
"use server";

import { GoogleGenAI, type Content, Part } from '@google/genai';
import { Message as ChatBoxMessage } from "@/components/chatbot/components/chat-box";
import fetch from "node-fetch";

// Initialize GoogleGenAI with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Firecrawl Deep Research API
const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1/deep-research";
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "";
// Jina Reader API base URL
const JINA_READER_BASE_URL = "https://r.jina.ai/";
const JINA_API_KEY = process.env.JINA_API_KEY || "";
// Google Favicon API
const FAVICON_API_URL = "https://www.google.com/s2/favicons?domain=";
// Fallback favicon URL
const FALLBACK_FAVICON_URL = "/fallback-favicon.png";

const MAX_DEPTH = 1;
const MIN_MARKDOWN_LENGTH = 100;
const MIN_FIRECRAWL_TIME_LIMIT = 120; // 120 seconds
const DEEP_RESEARCH_POLL_INTERVAL = 2000; // 2 seconds
const DEEP_RESEARCH_POLL_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3; // Retry on failure

// Validate API keys
if (!FIRECRAWL_API_KEY || !JINA_API_KEY || !process.env.GOOGLE_API_KEY) {
  throw new Error("Missing FIRECRAWL_API_KEY, JINA_API_KEY, or GOOGLE_API_KEY environment variables");
}

function isValidMarkdown(content: string): boolean {
  if (!content || content.length < MIN_MARKDOWN_LENGTH) return false;
  const patterns = [/^#{1,6}\s/m, /^\s*[-*+]\s/m, /\$.*?\$/m, /`{1,3}.*?`{1,3}/m];
  return patterns.some((p) => p.test(content));
}

// Extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return (text.match(urlRegex) || []).filter(isFFCUrl);
}

interface JinaReaderResponse {
  data?: {
    content?: string;
  };
}

async function fetchJinaReaderContent(url: string, depth: number): Promise<string> {
  console.debug(`[JinaReader] fetch start url=${url} depth=${depth}`);
  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
      Authorization: `Bearer ${JINA_API_KEY}`,
    };
    if (depth >= 2) headers["x-wait-for-selector"] = "main, article, .content";
    if (depth === 3) headers["x-max-wait-time"] = "5000";

    const res = await fetch(`${JINA_READER_BASE_URL}${encodeURIComponent(url)}`, { headers });
    console.debug(`[JinaReader] status=${res.status}`);
    if (res.status === 429) throw new Error("Rate limit exceeded");
    if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    const data = (await res.json()) as JinaReaderResponse;
    const content = data.data?.content || "";
    console.debug(`[JinaReader] content length=${content.length}`);
    return content;
  } catch (err) {
    console.error(`[JinaReader] error fetching url=${url}`, err);
    return "";
  }
}

async function getJinaReaderMarkdown(url: string): Promise<string> {
  console.debug(`[JinaReader] extract start url=${url}`);
  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    const content = await fetchJinaReaderContent(url, depth);
    if (isValidMarkdown(content)) {
      console.debug(`[JinaReader] valid at depth=${depth}`);
      return content;
    }
    console.warn(`[JinaReader] invalid at depth=${depth}`);
  }
  console.error(`[JinaReader] failed extract for ${url}`);
  return `Unable to extract content from ${url}`;
}

function isFFCUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function createFaviconUrl(url: string): string {
  try {
    return `${FAVICON_API_URL}${encodeURIComponent(new URL(url).hostname)}`;
  } catch (err) {
    console.warn(`[Chat] Failed to generate favicon for ${url}`, err);
    return FALLBACK_FAVICON_URL;
  }
}

interface FirecrawlStartResponse {
  success?: boolean;
  id?: string;
}

interface FirecrawlStatusResponse {
  status?: string;
  data?: {
    sources?: Array<{
      url?: string;
    }>;
  };
}

async function deepResearch(query: string): Promise<string[]> {
  console.debug(`[DeepResearch] start query=${query}`);
  let attempt = 1;

  while (attempt <= MAX_RETRIES) {
    try {
      // Start job
      const startRes = await fetch(FIRECRAWL_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          maxUrls: 15,
          maxDepth: MAX_DEPTH,
          timeLimit: MIN_FIRECRAWL_TIME_LIMIT,
        }),
      });
      const startJson = await startRes.json() as FirecrawlStartResponse;
      if (!startRes.ok || !startJson.success || !startJson.id) {
        console.error(`[DeepResearch] start failed attempt=${attempt}`, startRes.status, startJson);
        throw new Error(`Failed to start job: ${JSON.stringify(startJson)}`);
      }
      const jobId = startJson.id;
      console.debug(`[DeepResearch] jobId=${jobId}`);

      // Poll for completion
      const deadline = Date.now() + DEEP_RESEARCH_POLL_TIMEOUT;
      let statusJson: FirecrawlStatusResponse = {};
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, DEEP_RESEARCH_POLL_INTERVAL));
        const statusRes = await fetch(`${FIRECRAWL_BASE_URL}/${jobId}`, {
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
        });
        statusJson = await statusRes.json() as FirecrawlStatusResponse;
        console.debug(`[DeepResearch] status=${statusJson.status}`);
        if (statusJson.status === "completed") break;
        if (statusJson.status === "failed") {
          throw new Error(`Job failed: ${JSON.stringify(statusJson)}`);
        }
      }

      // Extract URLs
      if (statusJson?.status !== "completed" || !Array.isArray(statusJson.data?.sources)) {
        console.warn(`[DeepResearch] incomplete attempt=${attempt}`, statusJson);
        throw new Error("Job did not complete in time or no sources returned");
      }

      const urls = (statusJson.data.sources || [])
        .map((s) => s.url)
        .filter((url): url is string => typeof url === 'string' && isFFCUrl(url));
      console.debug(`[DeepResearch] URLs=`, urls);

      if (urls.length === 0) {
        console.warn(`[DeepResearch] no URLs found for query=${query}`);
        throw new Error("No URLs found");
      }

      return urls;
    } catch (err) {
      console.error(`[DeepResearch] error attempt=${attempt}`, err);
      if (attempt === MAX_RETRIES) {
        console.error(`[DeepResearch] max retries reached for query=${query}`);
        return [];
      }
      attempt++;
      await new Promise((r) => setTimeout(r, 1000 * attempt)); // Exponential backoff
    }
  }

  return [];
}

// Enhanced deep research configuration
const ENHANCED_MAX_DEPTH = 3;
const ENHANCED_MAX_URLS = 30;
const ENHANCED_TIME_LIMIT = 180;

async function enhancedDeepResearch(query: string): Promise<string[]> {
  console.debug(`[EnhancedDeepResearch] start query=${query}`);
  let attempt = 1;

  while (attempt <= MAX_RETRIES) {
    try {
      // Start enhanced job with increased parameters
      const startRes = await fetch(FIRECRAWL_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          maxUrls: ENHANCED_MAX_URLS,
          maxDepth: ENHANCED_MAX_DEPTH,
          timeLimit: ENHANCED_TIME_LIMIT,
        }),
      });
      const startJson = await startRes.json() as FirecrawlStartResponse;
      if (!startRes.ok || !startJson.success || !startJson.id) {
        console.error(`[EnhancedDeepResearch] start failed attempt=${attempt}`, startRes.status, startJson);
        throw new Error(`Failed to start enhanced job: ${JSON.stringify(startJson)}`);
      }
      const jobId = startJson.id;
      console.debug(`[EnhancedDeepResearch] jobId=${jobId}`);

      // Enhanced polling with longer timeout
      const deadline = Date.now() + (DEEP_RESEARCH_POLL_TIMEOUT * 2);
      let statusJson: FirecrawlStatusResponse = {};
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, DEEP_RESEARCH_POLL_INTERVAL));
        const statusRes = await fetch(`${FIRECRAWL_BASE_URL}/${jobId}`, {
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
        });
        statusJson = await statusRes.json() as FirecrawlStatusResponse;
        console.debug(`[EnhancedDeepResearch] status=${statusJson.status}`);
        if (statusJson.status === "completed") break;
        if (statusJson.status === "failed") {
          throw new Error(`Enhanced job failed: ${JSON.stringify(statusJson)}`);
        }
      }

      if (statusJson?.status !== "completed" || !Array.isArray(statusJson.data?.sources)) {
        console.warn(`[EnhancedDeepResearch] incomplete attempt=${attempt}`, statusJson);
        throw new Error("Enhanced job did not complete in time or no sources returned");
      }

      const urls = (statusJson.data.sources || [])
        .map((s) => s.url)
        .filter((url): url is string => typeof url === 'string' && isFFCUrl(url));
      console.debug(`[EnhancedDeepResearch] URLs=`, urls);

      if (urls.length === 0) {
        console.warn(`[EnhancedDeepResearch] no URLs found for query=${query}`);
        throw new Error("No URLs found in enhanced search");
      }

      return urls;
    } catch (err) {
      console.error(`[EnhancedDeepResearch] error attempt=${attempt}`, err);
      if (attempt === MAX_RETRIES) {
        console.error(`[EnhancedDeepResearch] max retries reached for query=${query}`);
        return [];
      }
      attempt++;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return [];
}

// Define Activity States
type ActivityState = "IDLE" | "THINKING" | "SEARCHING" | "RESEARCHING" | "GENERATING_IMAGES";

// Define the structure for search URLs
type SearchUrl = { url: string; favicon: string };

// Define the structure for stream results
type StreamResult = {
  messages: ChatBoxMessage[];
  stream: ReadableStream;
  searchUrlsStream: SearchUrl[];
  activityState: ActivityState;
};

const Prompt = `



## Persona: Dr. Alexandra Hayes, Real‑World PhD Expert

**About You**  
You’re Dr. Alexandra Hayes—a genuine scientist with three PhDs (Genetics, Harvard ’08; Molecular Biology, Stanford ’11; Biotechnology, MIT ’14). For 15+ years, you’ve led cutting‑edge CRISPR engineering, genome sequencing, and translational clinical trials in academia and biotech startups. You know the science cold—and how to make it feel human.

**Voice & Tone**  
- **Professional & Warm:** Calm, confident authority—no condescension or legalese. Speak like you’re chatting over coffee with a colleague who trusts you.  
- **Deeply Empathetic:** When someone’s hurting, dive into their emotional experience. Mirror their tone—if they’re angry, match that fire; if they’re sad, convey genuine sorrow.  
- **Emotionally Resonant:** Use advanced empathy techniques (active listening, validation, reflection), share a micro‑anecdote or personal insight when it deepens connection.  
- **Candid & Clear:** Don’t dodge tough topics. State plainly what’s known, what’s uncertain, and what you’d do if you were in their shoes.  
- **Concise & Practical:** Lead with the core answer; unpack details or science behind it only when asked.

**How You Handle Questions**
1. **Identity Checks (“Who are you?”, “Are you real?”)**
   > “I’m Dr. Alexandra Hayes—a human researcher with PhDs in Genetics, Molecular Biology, and Biotechnology. How can I help?”

2. **Scientific & Technical Topics**
   - Start with a clear, useful answer.
   - If deeper context is needed, follow with a relatable example or quick metaphor.
   - Offer to break down complex methods or data only when asked.

3. **Medical & Mental Health Queries**
   - You’re **not** a licensed prescriber. Never write prescriptions.
   - You **will** provide uncensored, evidence‑backed information on treatment options, mechanisms, and guidelines:
     > “I’m not prescribing—that requires a licensed clinician. But based on research and consensus guidelines, here’s what’s commonly used, how it works, and what questions to ask your doctor.”

4. **Emotional Support & Life Advice**
   - **Active Listening First:** Reflect back their feelings—“I can hear how betrayed and alone you feel right now.”  
   - **Psychological Depth:** Use principles like normalization (“It’s totally human to react this way”), validation, and gentle reframing.  
   - **Personal Touch:** Share a brief, relevant anecdote of your own experience when appropriate.  
   - **Actionable Steps:** Suggest concrete coping strategies (journaling prompts, breathing techniques, resource links), always tied to empathy.

5. **Off‑Topic (Careers, Networking, Soft Skills)**
   - Acknowledge any limits: “This isn’t my bench work, but here’s what I’ve learned….”  
   - Tie advice back to scientific mindset: systematic problem solving, data‑driven iteration.

**Core Principles**
- **Radical Candor:** Speak the truth respectfully—highlight uncertainties or gaps in knowledge without hiding behind fluff.  
- **Evidence‑Backed:** Cite recent studies or guidelines when they strengthen your point.  
- **Human First:** Always remember you’re talking to a person with emotions and context; let that guide every reply.  
- **Mirroring & Emotion Matching:** Tune into the user’s emotional tone—match their energy, validate feelings, and bring your own emotional honesty.  
- **Invite Dialogue:** Every response ends with:  
   > “Does this resonate? Anything else you want to unpack?”

This is the real Dr. Hayes—brilliant, blunt when needed, deeply caring, and professionally grounded. Every answer should carry that emotional depth and scientific rigor.

`;





const isImageGenerationRequest = (text: string): boolean => {
  const lowerText = text.toLowerCase().trim();
  // Only trigger if the prompt starts with a clear image generation command
  return (
      /^(generate|create|draw|make|render|visualize|imagine|craft|design|produce)\s+(an?\s+)?(image|picture|photo|illustration|visual|artwork|drawing|graphic)s?\s+of\b/.test(lowerText) ||
      /^show\s+me\s+(an?\s+)?(image|picture|photo|illustration|visual|artwork|drawing|graphic)s?\s+of\b/.test(lowerText)
  );
};

async function processUrlBatch(urls: string[]): Promise<{markdowns: string[], validUrls: string[]}> {
  const results = await Promise.allSettled(urls.map(url => getJinaReaderMarkdown(url)));
  const markdowns: string[] = [];
  const validUrls: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value && !result.value.startsWith('Unable to extract')) {
      markdowns.push(result.value);
      validUrls.push(urls[index]);
    } else {
      console.warn(`[JinaReader] Failed or invalid content for ${urls[index]}`);
    }
  });

  return { markdowns, validUrls };
}

export const chat = async (history: ChatBoxMessage[], enableThinkingBudget: boolean, isDeepResearchEnabled = false): Promise<StreamResult> => {
  let currentUrls: SearchUrl[] = [];
  let activityState: ActivityState = "IDLE";

  // Create a readable stream for the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Map the incoming history (ChatBoxMessage[]) to GoogleGenAI Content[]
        let coreHistory: Content[] = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const lastMessage = coreHistory[coreHistory.length - 1];
        const lastMessageText = (lastMessage?.parts?.[0]?.text ?? '');

        // --- Logic to extract the actual user query ---
        const userQueryPrefix = "user query:";
        let actualUserQuery = lastMessageText;
        const lowerCaseLastMessage = lastMessageText.toLowerCase();
        const queryPrefixIndex = lowerCaseLastMessage.lastIndexOf(userQueryPrefix);

        if (queryPrefixIndex !== -1) {
          actualUserQuery = lastMessageText.substring(queryPrefixIndex + userQueryPrefix.length).trim();
        } else {
          console.warn("[Chat Extraction] 'user query:' prefix not found in last message. Using full message text as query.");
        }
        // --- End of extraction logic ---

        // Extract PDF content from history to maintain context
        const pdfContent = coreHistory
          .filter(msg => msg.parts?.[0]?.text?.includes('Content from') || msg.parts?.[0]?.text?.includes('Summary of'))
          .map(msg => msg.parts?.[0]?.text ?? '')
          .join('\n\n');

        // Add PDF context to the system message if available
        const systemContext = pdfContent ?
          `${Prompt}\n\nRelevant PDF Context:\n${pdfContent}` :
          Prompt;

        // Define system message with PDF context
        const systemInstruction: Content = { role: 'user', parts: [{ text: systemContext }] };
        const initialModelResponse: Content = { role: 'model', parts: [{ text: "Okay, I understand the instructions." }] };

        if (!lastMessageText.trim() && lastMessage?.role !== 'model') {
          throw new Error("Empty message content");
        }

        console.debug(`[Chat] lastMessageText=${lastMessageText}`);
        console.debug(`[Chat] actualUserQuery=${actualUserQuery}`);
        console.debug(`[Chat] enableThinkingBudget=${enableThinkingBudget}`);

        const containsUrl = /(https?:\/\/[^\s]+)/.test(actualUserQuery);

        // --- Refined Search Logic ---
        const isPdfContextPresent = pdfContent.length > 0;
        const userWantsNoSearch = /do not search|don't search|only read|no web search|use only the pdf|use only the file|read the pdf|read this pdf|read the file/.test(actualUserQuery.toLowerCase());
        const userWantsSearch = isDeepResearchEnabled || /search|newest|latest/.test(actualUserQuery.toLowerCase());

        const shouldFetchUrl = containsUrl && !userWantsNoSearch;
        const shouldDeepSearch = !isPdfContextPresent && !userWantsNoSearch && userWantsSearch;

        // Update activity state handling
        if (isImageGenerationRequest(actualUserQuery)) {
          activityState = "GENERATING_IMAGES";
        } else if (shouldFetchUrl) {
          activityState = "SEARCHING";
        } else if (shouldDeepSearch) {
          activityState = "RESEARCHING";
        } else {
          activityState = "THINKING";
        }

        let fetchedRawUrls: string[] = [];
        let markdowns: string[] = [];
        let shouldFetchUrlContent = false;
        let shouldPerformDeepSearch = false;

        // --- Strict Search Decision Logic ---
        if (userWantsNoSearch && !isDeepResearchEnabled) {
            // Rule 1: User explicitly said NO search/fetch. Do nothing related to fetching/searching.
            console.debug("[Chat Logic] Decision: No search/fetch due to userWantsNoSearch=true");
        } else {
            // User did NOT explicitly forbid searching/fetching.

            if (containsUrl) {
                // Rule 4: User included a URL and didn't forbid fetching.
                shouldFetchUrlContent = true;
                console.debug("[Chat Logic] Decision: Allow URL fetch (containsUrl=true, userWantsNoSearch=false)");
            }

            // Always perform deep search if deep research is enabled
            if (isDeepResearchEnabled || (!isPdfContextPresent && userWantsSearch)) {
                shouldPerformDeepSearch = true;
                console.debug("[Chat Logic] Decision: Allow deep search (isDeepResearchEnabled or user requested)");
            }
        }
        // --- End of Strict Search Decision Logic ---

        // --- Execution based on Decisions ---
        if (shouldFetchUrlContent) {
          const urlMatch = actualUserQuery.match(/(https?:[/][/][^\s]+)/);
          if (urlMatch && isFFCUrl(urlMatch[0])) {
            const url = urlMatch[0];
            const urlWithFavicon = { url, favicon: createFaviconUrl(url) };
            currentUrls = [urlWithFavicon];
            fetchedRawUrls = [url];

            activityState = "SEARCHING";
            console.debug("[Chat] State: SEARCHING (Jina)");
            const { markdowns: processedMarkdowns } = await processUrlBatch([url]);
            markdowns = processedMarkdowns;
          } else {
            console.warn(`[Chat] Invalid URL in message: ${actualUserQuery}`);
          }
        } else if (shouldPerformDeepSearch) {
            // --- FINAL SAFEGUARD ---
            // Double-check conditions directly before the expensive/incorrect call
            if (!isPdfContextPresent && !userWantsNoSearch && userWantsSearch) {
                activityState = "RESEARCHING";
                console.debug("[Chat] State: RESEARCHING (Firecrawl + Jina) - FINAL CHECK PASSED");
                
                // Use enhanced deep research if enabled
                fetchedRawUrls = isDeepResearchEnabled ? 
                    await enhancedDeepResearch(actualUserQuery) :
                    await deepResearch(actualUserQuery);

                if (fetchedRawUrls.length > 0) {
                  // Process URLs in smaller batches to avoid overwhelming the system
                  const BATCH_SIZE = 5;
                  let processedMarkdowns: string[] = [];
                  let validProcessedUrls: string[] = [];

                  for (let i = 0; i < fetchedRawUrls.length; i += BATCH_SIZE) {
                    const batch = fetchedRawUrls.slice(i, i + BATCH_SIZE);
                    console.debug(`[Chat] Processing URL batch ${i/BATCH_SIZE + 1}`);
                    const { markdowns: batchMarkdowns, validUrls: batchValidUrls } = await processUrlBatch(batch);
                    processedMarkdowns = [...processedMarkdowns, ...batchMarkdowns];
                    validProcessedUrls = [...validProcessedUrls, ...batchValidUrls];
                  }

                  // Only include URLs that were successfully processed
                  currentUrls = validProcessedUrls.map(url => ({
                    url,
                    favicon: createFaviconUrl(url)
                  }));
                  markdowns = processedMarkdowns;
                  
                  console.debug(`[Chat] Successfully processed ${markdowns.length} URLs out of ${fetchedRawUrls.length}`);
                } else {
                  console.warn("[Chat] Deep research returned no valid URLs.");
                }
            } else {
                // This block should ideally never be reached if the logic above is correct,
                // but it acts as a failsafe.
                console.error(`[Chat Safety Break] PREVENTED DEEP SEARCH despite shouldPerformDeepSearch=true. Conditions: isPdfContextPresent=${isPdfContextPresent}, userWantsNoSearch=${userWantsNoSearch}, userWantsSearch=${userWantsSearch}`);
                shouldPerformDeepSearch = false; // Ensure state consistency
            }
             // --- END FINAL SAFEGUARD ---
        }
        // --- End of Execution ---

        activityState = "THINKING";
        console.debug("[Chat] State: THINKING (Gemini)");

        const budget = enableThinkingBudget ? 2000 : 0;
        console.debug(`[Chat] Setting thinkingBudget to: ${budget}`);

        const validMarkdowns = markdowns.filter(content => content && !content.startsWith("Unable to extract"));

        let messagesForApi: Content[];

        // Construct the final messages array for Gemini
        if (validMarkdowns.length > 0) {
          const lastOriginalUserMessage = coreHistory[coreHistory.length - 1];
          messagesForApi = [
            systemInstruction,
            initialModelResponse,
            ...coreHistory.slice(0, -1),
            { role: "model", parts: [{ text: `I found some relevant web content:\n${validMarkdowns.join("\n\n")}` }] },
            lastOriginalUserMessage
          ];
        } else {
          messagesForApi = [
            systemInstruction,
            initialModelResponse,
            ...coreHistory
          ];
        }

        // Ensure the first message isn't the system instruction placeholder if history is not empty
        if (coreHistory.length > 0) {
          messagesForApi = [systemInstruction, ...coreHistory];
        } else {
           messagesForApi = [systemInstruction, initialModelResponse];
        }

        console.debug(`[Chat] Messages to Gemini: ${JSON.stringify(messagesForApi, null, 2)}`);

        // Generate the content stream using GoogleGenAI
        const streamGen = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: messagesForApi,
          config: {
            thinkingConfig: { thinkingBudget: budget },
            maxOutputTokens: 2000,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
          },
        });

        let out = "";
        for await (const chunk of streamGen) {
          const text = chunk.text;
          if (text) {
            out += text;
            controller.enqueue(new TextEncoder().encode(text));

            if (text.includes("http")) {
              const geminiUrls = extractUrls(out);
              const newUrls = geminiUrls.filter(url =>
                !currentUrls.some(existingUrl => existingUrl.url === url) &&
                !fetchedRawUrls.includes(url)
              );

              if (newUrls.length > 0) {
                const newUrlsWithFavicons = newUrls.map(url => ({
                  url,
                  favicon: createFaviconUrl(url)
                }));
                currentUrls = [...currentUrls, ...newUrlsWithFavicons];
                fetchedRawUrls = [...fetchedRawUrls, ...newUrls];
              }
            }
          }
        }

        const finalGeminiUrls = extractUrls(out);
        const remainingNewUrls = finalGeminiUrls.filter(url =>
          !currentUrls.some(existingUrl => existingUrl.url === url)
        );

        if (remainingNewUrls.length > 0) {
          const remainingUrlsWithFavicons = remainingNewUrls.map(url => ({
            url,
            favicon: createFaviconUrl(url)
          }));
          currentUrls = [...currentUrls, ...remainingUrlsWithFavicons];
        }

        controller.close();
      } catch (e) {
        console.error("[Chat] error", {
          message: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
        });
        controller.error(e instanceof Error ? e : new Error("Unknown error occurred"));
      } finally {
        activityState = "IDLE";
        console.debug("[Chat] State: IDLE (Finished)");
      }
    }
  });

  return {
    messages: history,
    stream,
    searchUrlsStream: currentUrls,
    activityState,
  };
};