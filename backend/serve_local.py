#!/usr/bin/env python3
"""
serve_local.py — run the RAG endpoint on your laptop so you can test the WHOLE
stack (browser -> this server -> OpenAI) WITHOUT deploying to AWS.

It's a thin HTTP adapter around the exact same rag.answer_question() the Lambda
uses — so what you see locally is what you'll get in production.

Usage:
    cd backend
    OPENAI_API_KEY=sk-... python serve_local.py        # serves http://localhost:8000

Then point ONLY the jobs page at it (leaves Iris on the real Lambda):
    # add to .env.local at the project root:
    NEXT_PUBLIC_RAG_URL=http://localhost:8000/
    # restart the dev server so it picks up the env change:
    npm run dev
    # open http://localhost:3000/jobs and ask a question

When you're done testing, delete the NEXT_PUBLIC_RAG_URL line and restart.
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from rag import answer_question  # same module the Lambda calls

PORT = 8000

# Local dev only: allow the Next dev server (localhost:3000) to call us.
# Because we send Content-Type: application/json, the browser sends a CORS
# preflight (OPTIONS) first — we must answer both it and the POST.
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
}


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        for k, v in CORS.items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:          # CORS preflight
        self.send_response(204)
        for k, v in CORS.items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            body = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            return self._send(400, {"error": "Invalid JSON body"})

        query = body.get("query")
        if not isinstance(query, str) or not query.strip():
            return self._send(400, {"error": "Request must include a non-empty 'query'"})

        try:
            result = answer_question(query.strip())   # embed -> retrieve -> generate
        except Exception as exc:
            print(f"[error] {type(exc).__name__}: {exc}")
            return self._send(500, {"error": "RAG failed — check the server logs"})

        self._send(200, result)

    def log_message(self, fmt, *args):     # quieter, prefixed logs
        print("  " + (fmt % args))


if __name__ == "__main__":
    print(f"RAG dev server → http://localhost:{PORT}   (POST {{\"query\": \"...\"}})")
    print("Set NEXT_PUBLIC_RAG_URL=http://localhost:8000/ in .env.local, then `npm run dev`.")
    print("Ctrl+C to stop.\n")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
