"""
QuietPal — Lambda handler for Iris's reply calls.

Flow:
    Browser POSTs { "messages": [...] } to Lambda Function URL
    Lambda prepends system prompt, calls OpenAI, returns response
    Browser renders the reply

CORS note:
    CORS response headers are set by the Lambda Function URL's CORS
    configuration (AWS edge layer), NOT by this handler. Returning them
    from both layers causes duplicate Access-Control-Allow-Origin headers,
    which browsers reject. This handler still performs an application-layer
    origin check as defense in depth — the AWS config tells the browser
    what's allowed, this check decides whether to actually process the
    request.

Environment variables required:
    OPENAI_API_KEY  — OpenAI API key with access to gpt-4o
"""

import json
import os
from typing import Any

from openai import OpenAI
from system_prompt import SYSTEM_PROMPT

# ─── Configuration ─────────────────────────────────────────────

MODEL = "gpt-4o"
MAX_OUTPUT_TOKENS = 400
TEMPERATURE = 0.7

# Application-layer origin allowlist. Must be kept in sync with the
# Function URL's CORS "Allow origin" config in the AWS Console.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dbwomll77c53u.cloudfront.net",
]

# ─── Lambda entry point ────────────────────────────────────────

def lambda_handler(event: dict, context: Any) -> dict:
    """Lambda Function URL entry point."""
    origin = _get_origin(event)
    cors_headers = _build_cors_headers(origin)

    # Handle CORS preflight. In practice this branch never fires because
    # AWS's Function URL CORS config intercepts OPTIONS before the handler
    # runs. Kept as a safety net in case CORS is ever disabled at the edge.
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": cors_headers,
            "body": "",
        }

    if method != "POST":
        return _error(405, "Method not allowed", cors_headers)

    # Application-layer origin check (defense in depth — AWS CORS also enforces)
    if origin and origin not in ALLOWED_ORIGINS:
        return _error(403, "Origin not allowed", cors_headers)

    # Parse request body
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _error(400, "Invalid JSON body", cors_headers)

    # ── Route by payload shape: a jobs-KB question ({"query": ...}) goes to the
    #    RAG handler; a letter ({"messages": [...]}) goes to Iris (unchanged). ──
    if "query" in body:
        return _handle_rag(body, cors_headers)

    messages = body.get("messages")
    if not isinstance(messages, list) or len(messages) == 0:
        return _error(400, "Request must include a non-empty 'messages' array", cors_headers)

    # Validate each message has role + content
    for m in messages:
        if not isinstance(m, dict) or "role" not in m or "content" not in m:
            return _error(400, "Each message must have 'role' and 'content'", cors_headers)
        if m["role"] not in ("user", "assistant"):
            return _error(400, "Message role must be 'user' or 'assistant'", cors_headers)

    # Call the AI provider
    try:
        reply = call_openai(messages)
    except Exception as exc:
        # Log the full error server-side, return a generic message to the client
        print(f"[error] OpenAI call failed: {type(exc).__name__}: {exc}")
        return _error(500, "The companion couldn't respond just now. Try again in a moment.", cors_headers)

    return {
        "statusCode": 200,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps({"reply": reply}),
    }


# ─── Provider: OpenAI ──────────────────────────────────────────

def call_openai(messages: list[dict]) -> str:
    """Call OpenAI GPT-4o with the system prompt prepended."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable not set")

    client = OpenAI(api_key=api_key)

    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    response = client.chat.completions.create(
        model=MODEL,
        messages=full_messages,
        max_tokens=MAX_OUTPUT_TOKENS,
        temperature=TEMPERATURE,
    )

    return response.choices[0].message.content or ""


# ─── RAG: jobs knowledge base ──────────────────────────────────

def _handle_rag(body: dict, cors_headers: dict) -> dict:
    """Answer a jobs-KB question via retrieval-augmented generation.

    Fully separate from Iris: different module (`rag`), different system prompt.
    Imported lazily so a problem here can never affect the letter flow."""
    query = body.get("query")
    if not isinstance(query, str) or not query.strip():
        return _error(400, "Request must include a non-empty 'query' string", cors_headers)

    try:
        from rag import answer_question
        result = answer_question(query.strip())
    except Exception as exc:
        # Log server-side, return a generic message to the client.
        print(f"[error] RAG call failed: {type(exc).__name__}: {exc}")
        return _error(500, "The jobs assistant couldn't respond just now. Try again in a moment.", cors_headers)

    return {
        "statusCode": 200,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps(result),
    }


# ─── Utilities ─────────────────────────────────────────────────

def _get_origin(event: dict) -> str:
    headers = event.get("headers") or {}
    # Headers may be lowercased by Lambda Function URL
    for key in ("origin", "Origin"):
        if key in headers:
            return headers[key]
    return ""


def _build_cors_headers(origin: str) -> dict:
    """
    CORS response headers are handled by the Lambda Function URL's CORS
    configuration, not by this handler. Returning an empty dict here
    avoids duplicate Access-Control-Allow-Origin headers, which browsers
    reject. Origin-based application-layer authorization still happens
    via the ALLOWED_ORIGINS check in lambda_handler.
    """
    return {}


def _error(status: int, message: str, cors_headers: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps({"error": message}),
    }
