"""
ALLOWED_ORIGINS update for Phase 7 deployment.

This file contains ONLY the updated ALLOWED_ORIGINS list. Do NOT replace
your entire lambda_function.py with this file. Instead:

1. Open your existing lambda_function.py (in your backend folder)
2. Find the ALLOWED_ORIGINS list
3. Replace it with the version below (updating the CloudFront domain)
4. Re-zip and upload to Lambda

See backend-deliverables/DEPLOYMENT.md Steps 7-8 for full instructions.
"""

# Application-layer origin allowlist. Keep in sync with the Function URL's
# CORS "Allow origin" config in the AWS Console.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net",  # replace with actual CloudFront domain after deployment
]
