import { MOOD_LABELS } from "./constants";

const LAMBDA_URL = process.env.NEXT_PUBLIC_LAMBDA_URL;

interface LambdaResponse {
  reply: string;
}

export function buildLetterContent(letterText: string, mood: number, keywords: string[]): string {
  const moodLabel = MOOD_LABELS[mood];
  const keywordList = keywords.length > 0 ? keywords.join(", ") : "none";

  const context = `[Context: the sender set their weather to "${moodLabel}" (${mood}/7) and noted feeling ${keywordList}.]`;

  return `${context}\n\n${letterText}`;
}

export async function sendToLambda(content: string): Promise<LambdaResponse> {
  if (!LAMBDA_URL) {
    throw new Error("NEXT_PUBLIC_LAMBDA_URL is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Lambda responded with ${res.status}`);
    }

    const data = await res.json();

    if (typeof data?.reply !== "string" || data.reply.length === 0) {
      throw new Error("Lambda returned malformed or empty reply");
    }

    return data as LambdaResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}
