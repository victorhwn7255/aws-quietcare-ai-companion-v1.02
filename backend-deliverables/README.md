# Backend deliverables

This folder contains files that need to be manually deployed to the AWS Lambda backend. The frontend in this repo calls the Lambda over HTTP; the Lambda's source code lives in a separate backend folder (from the earlier QuietCare project) and is deployed via the AWS Console.

## Files

- `system_prompt.py` — new system prompt for Iris (v2). Tuned for the correspondence product: shapes Iris's voice, persona, length discipline, banned vocabulary, bracketed-context convention, and safety floor.

## Deployment steps

1. Locate your existing backend folder (likely `../quietcare/backend/` or wherever the Phase 4A Lambda source lives).
2. Replace the existing `system_prompt.py` there with this version. Keep `lambda_function.py` unchanged.
3. Re-zip the Lambda package from inside the backend folder:
   ```bash
   cd <path to backend folder>
   zip -g quietcare-lambda.zip system_prompt.py
   ```
   (Or if you've been renaming things, whatever your zip filename is.)
4. Upload via AWS Console → Lambda function `quietcare-reflect` → Code tab → Upload from → .zip file → Save.
5. Wait for the "successfully updated" banner.
6. Test from the Console with an event containing a bracketed context line, e.g.:
   ```json
   {
     "version": "2.0",
     "requestContext": { "http": { "method": "POST" } },
     "headers": {
       "content-type": "application/json",
       "origin": "http://localhost:3000"
     },
     "body": "{\"messages\": [{\"role\": \"user\", \"content\": \"[Context: the sender set their weather to \\\"low\\\" (2/7) and noted feeling tired, behind.]\\n\\nDear Iris,\\nI've been staring at my laptop for three hours and written nothing. The juniors shipped two features today and I can't even frame the problem I'm supposed to solve.\"}]}",
     "isBase64Encoded": false
   }
   ```
7. Expected: Iris's reply is short (~150–250 words), addresses one thread from the letter, does not reference the bracket, does not use any banned vocabulary, signs off with "— Iris".

## Verification checklist after deployment

Send two identical letter bodies with wildly different mood/keyword settings (e.g., mood=1 with keywords=[lonely, behind] vs mood=7 with keywords=[grateful, steady]) from the frontend. Iris's two replies should differ in tone while addressing the same concrete content.

If Iris starts a reply with "I noticed you're feeling heavy" or quotes the keywords back, the bracket instruction didn't hold — revisit the prompt.
