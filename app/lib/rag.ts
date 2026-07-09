// Client-side wrapper for the RAG "jobs" endpoint.
//
// It POSTs { query } to the SAME Lambda Function URL as Iris. The Lambda routes
// by payload shape: { query } -> RAG jobs assistant, { messages } -> Iris. So the
// browser never needs to know two URLs — just which shape to send.
//
// Mirrors app/lib/lambda.ts: 45s AbortController timeout + runtime validation.

export interface RagSource {
  source: string;   // filename the chunk came from
  heading: string;  // nearest heading (may be "")
  score: number;    // cosine similarity to the question
  text: string;     // the chunk text that was fed to the model
}

export interface RagResponse {
  answer: string;
  sources: RagSource[];
}

// The jobs page uses NEXT_PUBLIC_RAG_URL if set, else falls back to the shared
// Lambda URL. In production RAG_URL is unset → same URL as Iris (routed by payload).
// For local end-to-end testing, set NEXT_PUBLIC_RAG_URL=http://localhost:8000/ so
// only /jobs hits your local server while Iris keeps using the real Lambda.
const LAMBDA_URL = process.env.NEXT_PUBLIC_RAG_URL ?? process.env.NEXT_PUBLIC_LAMBDA_URL;

export async function askJobs(query: string): Promise<RagResponse> {
  if (!LAMBDA_URL) {
    throw new Error("NEXT_PUBLIC_LAMBDA_URL is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Lambda responded with ${res.status}`);
    }

    const data = await res.json();

    // Runtime validation — never trust the shape of a network response.
    if (typeof data?.answer !== "string" || !Array.isArray(data?.sources)) {
      throw new Error("Lambda returned a malformed RAG response");
    }

    return data as RagResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}
