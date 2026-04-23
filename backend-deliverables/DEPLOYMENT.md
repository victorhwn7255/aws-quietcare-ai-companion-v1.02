# Phase 7 Deployment — User AWS Console Tasks

This document walks you through deploying QuietPal to S3 + CloudFront and updating the Lambda CORS config. All steps are manual AWS Console work that the user executes. Claude Code does not have AWS credentials and should not attempt these steps.

## Prerequisites

- AWS account with access to us-east-1 (same region as the Lambda)
- The `out/` directory in this project (produced by `npm run build`)
- The existing Lambda function `quietcare-reflect` (from Phase 4A)

## Step 1 — Create S3 bucket for static hosting

1. AWS Console → S3 → Create bucket
2. Bucket name: `quietpal-frontend-<yourname>-<yymmdd>` (must be globally unique — adjust as needed)
3. Region: us-east-1
4. **Uncheck** "Block all public access" (CloudFront needs access, and for diagnostics you may want direct S3 access too)
5. Acknowledge the public-access warning
6. Create bucket

## Step 2 — Configure S3 for static website hosting

1. Open the new bucket → Properties tab → scroll to "Static website hosting"
2. Edit → Enable
3. Hosting type: "Host a static website"
4. Index document: `index.html`
5. Error document: `index.html` (this is correct for SPAs — any 404 routes to the index and lets client-side handle it)
6. Save

Note the "Bucket website endpoint" URL — you'll use this for diagnostics. CloudFront will be the production URL.

## Step 3 — Add a bucket policy for public read

1. Permissions tab → Bucket policy → Edit
2. Paste this policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

3. Save

## Step 4 — Upload the build

From your local machine:

```bash
cd <project-root>/aws-quietpal
aws s3 sync out/ s3://YOUR_BUCKET_NAME/ --delete
```

If you don't have `aws` CLI configured, use the Console:

1. Bucket → Objects tab → Upload
2. Drag the entire contents of `out/` (not the `out/` folder itself — its contents)
3. Upload

Verify by visiting the bucket website endpoint from Step 2. The app should load. CORS will fail when you try to send a letter (the Lambda's allowlist doesn't yet include the S3 endpoint), but the UI should render.

## Step 5 — Create a CloudFront distribution

1. AWS Console → CloudFront → Create distribution
2. **Origin**:
   - Origin domain: select your S3 bucket from the dropdown. **Important**: choose the bucket itself, not the website endpoint. CloudFront will connect via S3's REST endpoint.
   - Origin access: "Origin access control settings (recommended)" → Create new OAC → accept defaults. This replaces the public bucket policy with a CloudFront-only access pattern (more secure). Alternatively, leave the bucket public and use "Public" origin access — simpler for demos.
3. **Default cache behavior**:
   - Viewer protocol policy: "Redirect HTTP to HTTPS"
   - Allowed HTTP methods: "GET, HEAD"
   - Cache policy: CachingOptimized (default)
4. **Default root object**: `index.html`
5. **Settings**:
   - Price class: "Use only North America and Europe" (cheaper; fine for demo)
   - WAF: skip for demo
6. Create distribution

Wait for status to change from "Deploying" to "Enabled" — this takes 5–15 minutes.

If you used OAC in Step 5.2, CloudFront will show a banner prompting you to update the S3 bucket policy to allow CloudFront. Follow that prompt — it auto-generates the correct policy.

Note the distribution's domain name (e.g., `d1a2b3c4d5.cloudfront.net`). This is your production URL.

## Step 6 — Test the CloudFront URL

Visit `https://d1a2b3c4d5.cloudfront.net` (use your actual domain). The app should load. Sending a letter will fail with a CORS error — this is expected and is what Step 7 fixes.

## Step 7 — Update the Lambda's CORS config (AWS layer)

1. AWS Console → Lambda → `quietcare-reflect` → Configuration tab → Function URL (left sidebar)
2. Edit
3. Under CORS "Allow origin", add a new origin:
   ```
   https://d1a2b3c4d5.cloudfront.net
   ```
   (no trailing slash, no quotes, exact string from Step 5)
4. Keep the existing origins (`http://localhost:3000`, `http://localhost:3001`) so local dev continues to work.
5. Save

## Step 8 — Update the Lambda's `ALLOWED_ORIGINS` list (application layer)

This is the second of the two CORS layers (you'll remember this pattern from Phase 4A).

1. Open your existing backend folder (where `lambda_function.py` lives — likely `../quietcare/backend/`).
2. Open `lambda_function.py` in a text editor.
3. Find the `ALLOWED_ORIGINS` list and add your CloudFront domain:
   ```python
   ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://localhost:3001",
       "https://d1a2b3c4d5.cloudfront.net",  # production
   ]
   ```
4. Save.
5. Re-zip the Lambda package:
   ```bash
   cd <path-to-backend-folder>
   zip -g quietcare-lambda.zip lambda_function.py
   ```
6. AWS Console → Lambda → `quietcare-reflect` → Code tab → Upload from → .zip file → Save.
7. Wait for "successfully updated" banner.

## Step 9 — Deploy the updated system prompt (if not already done)

If you haven't yet deployed the v2 system prompt from `backend-deliverables/system_prompt.py`:

1. Copy it into your backend folder, replacing the existing `system_prompt.py`.
2. `zip -g quietcare-lambda.zip system_prompt.py`
3. Upload via Console as in Step 8.

If you've already deployed v2, skip this step.

## Step 10 — Smoke test the deployed app

1. Open `https://d1a2b3c4d5.cloudfront.net` in a fresh browser tab (preferably incognito — avoids caching confusion)
2. Write a test letter, click Send
3. Confirm:
   - Waiting row appears immediately in the inbox
   - ~30 seconds later, the row transitions to unread
   - Clicking the row opens the reply
   - Iris's voice matches the v2 system prompt (not the old reflection-companion voice)
4. Open browser DevTools → Network tab → find the Lambda POST request → confirm:
   - Status 200
   - Response has `{ "reply": "..." }`
   - No CORS errors in console

If anything fails, the DevTools Network tab is the first place to look. Common failures:

- CORS error: the CloudFront URL in Step 7 or Step 8 has a typo, or you forgot to re-upload the Lambda zip in Step 8
- 403 from CloudFront: the distribution is still deploying, or the S3 bucket policy didn't update
- 500 from Lambda: the system prompt deploy (Step 9) might have gone wrong; check CloudWatch logs for the Lambda

## Step 11 — Update documentation

Edit `tasks/todo.md` (on your local machine — the agent handles this if you ask in a follow-up prompt) to note the production CloudFront URL for future reference. Also consider updating `README.md` at the project root with a "Live demo" link.

## Post-deployment

Your demo URL is `https://d1a2b3c4d5.cloudfront.net`. Keep it safe — the Function URL is still unauthenticated, so anyone who visits can spend your OpenAI credits. For a hackathon demo this is acceptable; for anything longer-lived, revisit P1 and P3 from `tasks/audit-findings.md`.

## Rebuilding and redeploying after code changes

For future updates:

```bash
cd aws-quietpal
npm run build
aws s3 sync out/ s3://YOUR_BUCKET_NAME/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

The invalidation is important — CloudFront caches aggressively, so without it users may see old bundles for up to 24 hours.
