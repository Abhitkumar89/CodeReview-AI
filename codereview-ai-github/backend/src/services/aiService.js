import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * The exact JSON shape we ask the model to return. Keeping it explicit makes the
 * frontend rendering predictable and lets us validate/normalise the response.
 */
const RESPONSE_SHAPE = `{
  "qualityScore": number (0-10),
  "summary": string,
  "bugs": string[],
  "securityIssues": string[],
  "performanceImprovements": string[],
  "readabilitySuggestions": string[],
  "bestPractices": string[],
  "cleanedCode": string,
  "timeComplexity": string,
  "spaceComplexity": string
}`;

function buildPrompt(language, code) {
  return `You are a meticulous senior software engineer performing a thorough code review.
Review the following ${language} code and respond with ONLY a valid JSON object — no markdown fences, no commentary.

The JSON must strictly match this shape:
${RESPONSE_SHAPE}

Guidelines:
- "qualityScore": an honest overall score from 0 to 10.
- Each array contains concise, specific, actionable bullet strings. Use [] when nothing applies.
- "cleanedCode": a corrected, idiomatic, production-ready rewrite of the code. Preserve the original language.
- "timeComplexity" / "spaceComplexity": Big-O of the main logic with a short justification.
- "summary": 2-4 sentences summarising the overall assessment.

Code to review:
\`\`\`${language}
${code}
\`\`\``;
}

/** Extracts a JSON object from a model response that may contain extra text. */
function extractJson(text) {
  if (!text) throw ApiError.internal('Empty response from AI provider');
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw ApiError.internal('AI response did not contain valid JSON');
  }
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw ApiError.internal('Failed to parse AI response as JSON');
  }
}

/** Coerces an arbitrary parsed object into our strict review schema. */
function normalize(raw) {
  const toArray = (v) => (Array.isArray(v) ? v.map(String).filter(Boolean) : v ? [String(v)] : []);
  let score = Number(raw.qualityScore);
  if (Number.isNaN(score)) score = 0;
  score = Math.max(0, Math.min(10, score));

  return {
    qualityScore: Math.round(score * 10) / 10,
    summary: String(raw.summary || ''),
    bugs: toArray(raw.bugs),
    securityIssues: toArray(raw.securityIssues),
    performanceImprovements: toArray(raw.performanceImprovements),
    readabilitySuggestions: toArray(raw.readabilitySuggestions),
    bestPractices: toArray(raw.bestPractices),
    cleanedCode: String(raw.cleanedCode || ''),
    timeComplexity: String(raw.timeComplexity || ''),
    spaceComplexity: String(raw.spaceComplexity || ''),
  };
}

async function reviewWithGemini(language, code) {
  const { apiKey, model } = env.ai.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(language, code) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw ApiError.internal(`Gemini request failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return normalize(extractJson(text));
}

async function reviewWithOpenAI(language, code) {
  const { apiKey, model } = env.ai.openai;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a meticulous senior engineer. Respond with valid JSON only.',
        },
        { role: 'user', content: buildPrompt(language, code) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw ApiError.internal(`OpenAI request failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  return normalize(extractJson(text));
}

/**
 * Deterministic offline fallback used when no API key is configured. Keeps the
 * full app usable in local development and demos without external credentials.
 */
function mockReview(language, code) {
  const lines = code.split('\n').length;
  return normalize({
    qualityScore: 7.5,
    summary: `Offline demo review for ${language}. Configure an AI provider key to get real, AI-generated feedback. The snippet has ${lines} line(s).`,
    bugs: ['No AI provider configured — this is placeholder output.'],
    securityIssues: ['Validate and sanitise all external input before use.'],
    performanceImprovements: ['Avoid repeated work inside loops where possible.'],
    readabilitySuggestions: ['Use descriptive variable names and add concise comments.'],
    bestPractices: ['Add unit tests and handle error cases explicitly.'],
    cleanedCode: code,
    timeComplexity: 'O(n) — estimated from a single pass over the input.',
    spaceComplexity: 'O(1) — estimated, no large auxiliary structures detected.',
  });
}

/**
 * Reviews code using the configured AI provider. Falls back to a deterministic
 * mock when the provider's API key is missing.
 */
export async function reviewCode(language, code) {
  const provider = env.ai.provider;

  if (provider === 'openai') {
    if (!env.ai.openai.apiKey) return mockReview(language, code);
    return reviewWithOpenAI(language, code);
  }

  // default: gemini
  if (!env.ai.gemini.apiKey) return mockReview(language, code);
  return reviewWithGemini(language, code);
}
