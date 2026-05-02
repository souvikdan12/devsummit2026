const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary: gemini-2.5-flash-lite (fast, less quota usage)
// Fallback: gemini-2.5-flash (more capable, higher quota)
const PRIMARY_MODEL = 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = 'gemini-2.5-flash';

// ---------- Retry / queue helpers ----------

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 2000; // 2 seconds initial backoff

/**
 * Check whether an error is a retriable rate-limit / quota error.
 */
function isQuotaError(error) {
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('429') ||
    msg.includes('resource has been exhausted') ||
    msg.includes('too many requests') ||
    msg.includes('please retry')
  );
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simple serial queue – ensures only ONE Gemini request is in-flight at a time
 * so the free-tier per-minute limits are less likely to be hit.
 */
let _queueTail = Promise.resolve();

function enqueue(fn) {
  const task = _queueTail.then(fn, fn); // run even if previous rejected
  _queueTail = task.catch(() => {}); // swallow so queue doesn't stall
  return task;
}

// ---------- Core call with retry + model fallback ----------

/**
 * Call Gemini with automatic retry + exponential backoff on quota errors.
 * Falls back to FALLBACK_MODEL if primary model is rate-limited.
 */
async function callWithRetry(prompt, generationConfig) {
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError;

  for (const modelName of modelsToTry) {
    const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // Strip markdown code fences if present
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        return JSON.parse(text);
      } catch (error) {
        lastError = error;
        console.error(
          `Gemini [${modelName}] Error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
          error.message?.substring(0, 150)
        );

        if (isQuotaError(error) && attempt < MAX_RETRIES) {
          const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 10000);
          console.log(`⏳ Rate-limited. Retrying in ${(delayMs / 1000).toFixed(1)}s ...`);
          await sleep(delayMs);
          continue;
        }

        // If quota error and exhausted retries, break to try fallback model
        if (isQuotaError(error)) {
          console.log(`🔄 Switching to fallback model: ${FALLBACK_MODEL}`);
          break;
        }

        // Non-retriable error — throw immediately
        throw new Error('AI analysis failed: ' + error.message);
      }
    }
  }

  // All models failed
  if (isQuotaError(lastError)) {
    throw new Error(
      'Gemini API free-tier quota exceeded. Please wait a minute and try again, or upgrade your API key to a paid plan.'
    );
  }
  throw new Error('AI analysis failed: ' + lastError.message);
}

// ---------- Public API ----------

/**
 * Send a prompt to Gemini and get structured JSON response.
 * Requests are queued serially and retried on quota errors.
 * @param {string} prompt - The prompt to send
 * @returns {Promise<object>} Parsed JSON response
 */
async function generateJSON(prompt) {
  return enqueue(() => {
    return callWithRetry(prompt, {
      responseMimeType: 'application/json',
      temperature: 0.7,
    });
  });
}

/**
 * Send a prompt to Gemini for text response (cover letters, etc.).
 * Requests are queued serially and retried on quota errors.
 * @param {string} prompt - The prompt to send
 * @returns {Promise<object>} Parsed JSON response
 */
async function generateText(prompt) {
  return enqueue(() => {
    return callWithRetry(prompt, {
      responseMimeType: 'application/json',
      temperature: 0.8,
    });
  });
}

module.exports = { generateJSON, generateText };
