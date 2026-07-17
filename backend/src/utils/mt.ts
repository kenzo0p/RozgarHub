import logger from './logger.js';
import type { Language } from './constants.js';

/**
 * Machine translation provider for user-generated job content.
 *
 * Dev/demo provider: MyMemory (https://mymemory.translated.net) — a free,
 * no-key MT API. Its anonymous quota is small, which is fine here because
 * translations are cached per (job, language) in Mongo and each job is only
 * ever translated once per language. Set MYMEMORY_EMAIL to raise the quota.
 *
 * PRODUCTION: swap `translateChunk` for a real provider — Bhashini
 * (https://bhashini.gov.in, the Indian government's free MT service, ideal
 * for Indic languages) or Google Cloud Translation. Only this file changes;
 * the caching layer and API stay the same.
 */

// MyMemory rejects long inputs; split on sentence boundaries under this size.
const MAX_CHUNK = 450;
const TIMEOUT_MS = 6000;

function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text];
  const sentences = text.split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length > MAX_CHUNK && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  // A single "sentence" longer than the cap gets hard-split.
  return chunks.flatMap((c) =>
    c.length <= MAX_CHUNK
      ? [c]
      : Array.from({ length: Math.ceil(c.length / MAX_CHUNK) }, (_, i) =>
          c.slice(i * MAX_CHUNK, (i + 1) * MAX_CHUNK),
        ),
  );
}

async function translateChunk(text: string, targetLang: Language): Promise<string | null> {
  const params = new URLSearchParams({ q: text, langpair: `en|${targetLang}` });
  // Optional, unvalidated tuning knob: an email raises MyMemory's daily quota.
  if (process.env.MYMEMORY_EMAIL) params.set('de', process.env.MYMEMORY_EMAIL);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      responseStatus?: number | string;
      responseData?: { translatedText?: string };
    };
    // MyMemory reports errors inside a 200 body (e.g. quota exceeded).
    if (Number(body.responseStatus) !== 200) return null;
    const translated = body.responseData?.translatedText?.trim();
    return translated || null;
  } catch (error) {
    logger.warn(`MT request failed (${targetLang}): ${(error as Error).message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Translate English text into the target language. Returns null when the
 * provider is unavailable — callers degrade to the original text.
 */
export async function translateText(
  text: string,
  targetLang: Language,
): Promise<string | null> {
  const trimmed = text?.trim();
  if (!trimmed) return '';

  const chunks = chunkText(trimmed);
  const translated: string[] = [];
  // Sequential on purpose: MyMemory rate-limits parallel bursts.
  for (const chunk of chunks) {
    const result = await translateChunk(chunk, targetLang);
    if (result == null) return null;
    translated.push(result);
  }
  return translated.join(' ');
}
