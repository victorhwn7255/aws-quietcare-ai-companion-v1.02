# QuietCare Lambda — Deployment Guide (Part 2)

This is the manual-deployment walkthrough. You'll do this in the AWS Console.
Claude Code wrote the code in `backend/`; you'll package it, upload it, and
wire it up here. Plan for ~30 minutes the first time.

## Prerequisites

- AWS account with Console access
- OpenAI API key (from platform.openai.com, with billing configured)
- Region: **us-east-1** (North Virginia) — stick with this for consistency

## Step 1: Package the Lambda code as a zip

Lambda needs a zip containing your Python code and its dependencies.

From the project root:

```bash
cd backend
mkdir -p package
pip install -r requirements.txt --target ./package
cp lambda_function.py system_prompt.py ./package/
cd package
zip -r ../quietcare-lambda.zip .
cd ..
rm -rf package
```

You now have `backend/quietcare-lambda.zip` — a ~2 MB file containing your
Lambda code plus the OpenAI SDK and its dependencies. Keep this file; you'll
upload it in Step 3.

(If you prefer a one-liner later for updates: the script above.)

## Step 2: Create the Lambda function

1. Open the AWS Console → search **Lambda** → open the service
2. Confirm top-right region shows **N. Virginia (us-east-1)**
3. Click **Create function**
4. Select **Author from scratch**
5. Fill in:
   - **Function name**: `quietcare-reflect`
   - **Runtime**: **Python 3.12**
   - **Architecture**: **x86_64** (default — don't change to arm64)
   - **Permissions**: expand "Change default execution role". Keep "Create a new role with basic Lambda permissions" selected. This creates an IAM role named like `quietcare-reflect-role-<random>` with CloudWatch logging permission — all we need.
6. Click **Create function**

You should land on the function's detail page. No code runs yet — we'll upload the zip next.

## Step 3: Upload the zip

1. On the function page, scroll to the **Code** tab (usually selected by default)
2. On the right of the code editor, click **Upload from → .zip file**
3. Choose your `backend/quietcare-lambda.zip` file
4. Click **Save**
5. Wait 10–20 seconds for the upload to complete. The Code source view will refresh to show your `lambda_function.py` at the root.

## Step 4: Configure the environment variable

The Lambda needs the OpenAI API key.

1. Click the **Configuration** tab (top of the function page)
2. Click **Environment variables** in the left sidebar
3. Click **Edit**
4. Click **Add environment variable**:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: your actual OpenAI API key (starts with `sk-`)
5. Click **Save**

## Step 5: Increase the timeout

By default Lambda times out after 3 seconds. GPT-4o responses can take 3–8
seconds for longer reflections. Bump to 30 seconds.

1. Still in **Configuration** tab
2. Click **General configuration** in the left sidebar
3. Click **Edit**
4. Change **Timeout** to `30 sec`
5. (Optional) Bump **Memory** to `512 MB` — improves cold-start speed
6. Click **Save**

## Step 6: Create the Function URL

This gives your Lambda a public HTTPS endpoint.

1. Still in **Configuration** tab
2. Click **Function URL** in the left sidebar
3. Click **Create function URL**
4. Configure:
   - **Auth type**: **NONE**

     (This makes the URL publicly callable. Acceptable for this hackathon
     scope; see Security notes below.)

   - Expand **Configure cross-origin resource sharing (CORS)**
   - **Allow origin**: `http://localhost:3000`
   - **Allow methods**: `POST` and `OPTIONS`
   - **Allow headers**: `content-type`
   - **Expose headers**: leave blank
   - **Max age**: `86400`
   - **Allow credentials**: leave unchecked
5. Click **Save**

You'll see a **Function URL** appear at the top of the page. It looks like:

    https://abc123xyz789.lambda-url.us-east-1.on.aws/

**Copy this URL.** You'll paste it into the frontend in Step 8.

## Step 7: Test the Lambda from the Console

Before wiring the frontend, verify the Lambda works.

1. Click the **Test** tab
2. Click **Create new event**
3. **Event name**: `HelloTest`
4. **Event JSON**:

```json
{
  "requestContext": {
    "http": {
      "method": "POST"
    }
  },
  "headers": {
    "origin": "http://localhost:3000",
    "content-type": "application/json"
  },
  "body": "{\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}"
}
```

5. Click **Save**, then click **Test**

Expected: you see a response with `"statusCode": 200` and a body containing
a `"reply"` field with Claude-like text.

If you see `"statusCode": 500`, click the **Logs** section → check the error.
Common issues:
- `OPENAI_API_KEY environment variable not set` — go back to Step 4
- `401 Unauthorized` — OpenAI key is invalid, regenerate at platform.openai.com
- `429` — OpenAI rate limit, wait 10 seconds and try again

## Step 8: Wire the frontend

1. In the project root, create `.env.local` (copy from `.env.local.example`)
2. Set the value:

   ```
   NEXT_PUBLIC_LAMBDA_URL=https://abc123xyz789.lambda-url.us-east-1.on.aws/
   ```

   Paste your actual Function URL from Step 6. Keep the trailing slash.

3. In `lib/bedrock-client.ts`, verify `MOCK_MODE` is set to `false`

4. Restart your dev server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 and click Reflect with any text. You should get
   a real GPT-4o response within 3–8 seconds.

## Updating the Lambda later

When you iterate on the Python code (prompt tweaks, bug fixes):

1. Re-run the zip command from Step 1
2. In the Lambda console: **Code → Upload from → .zip file → select new zip → Save**
3. Test with the Console test event to confirm

No need to reconfigure anything else.

## Security notes (read before going public)

- **Auth type NONE**: anyone who discovers your Function URL can call it and
  burn your OpenAI credits. Acceptable for hackathon dev; for real deployment
  add a shared-secret header check in `lambda_handler` or switch to API
  Gateway with API keys.
- **CORS origin**: currently `http://localhost:3000`. In Phase 4B (S3 +
  CloudFront), update this to your CloudFront domain.
- **OpenAI API key**: lives in Lambda environment variables, never exposed
  to the browser. Good. Don't commit `.env.local` to git (it's already in
  `.gitignore`).
- **Crisis callouts**: are bypassed client-side before Lambda is called, so
  the safety layer works even if the Lambda is unreachable.

## Switching to Bedrock later

When AWS Bedrock quota lands:

1. Implement the body of `call_bedrock()` in `lambda_function.py` using boto3
2. Change `call_openai(messages)` to `call_bedrock(messages)` in `lambda_handler`
3. Add the `bedrock:InvokeModel` permission to the Lambda's IAM role
4. Remove the `OPENAI_API_KEY` environment variable
5. Re-deploy the zip

Everything else stays identical.
