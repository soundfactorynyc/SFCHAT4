# Twilio SMS Verification Mode

This project implements a custom phone verification flow (instead of Supabase native OTP) using Twilio.

## Overview
1. User enters phone -> `netlify/functions/send-sms.js`
2. Function normalizes phone, rate limits, generates cryptographically secure 6‑digit code.
3. Code is hashed with SHA-256 (code:phone:SMS_PEPPER) and stored:
   - In-memory (cold start ephemeral) AND optionally persisted in `phone_verifications` table (if Supabase service role env vars provided).
4. User submits code -> `netlify/functions/verify-sms.js` which:
   - Normalizes phone identically
   - Recomputes hash & compares
   - Increments attempts (max 5)
   - Marks consumed & returns a lightweight session object (kept in `localStorage`).

## Why Custom?
- Full control over rate limiting & hashing
- Avoids incubating real auth sessions yet (MVP), simple localStorage identity
- Ability to swap providers (Twilio -> another) without auth vendor coupling

## Environment Variables
Refer to `.env.example` for a full list. Critical for Twilio mode:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM` (must be a verified / owned number in E.164)
- `SMS_PEPPER` (random long secret, rotate periodically)
- `ALLOW_DEMO_CODES` (keep true only locally to receive `demo_code` in responses)

Set `USE_SUPABASE_PHONE_OTP=false` (or unset) to ensure Twilio path is used.

## Demo Mode
If Twilio credentials are missing the functions still work in 'demo' mode and the response includes `demo_code`. NEVER enable this in production.
Disable by setting `ALLOW_DEMO_CODES=false` in production environment.

## Phone Normalization
Implemented consistently in:
- `send-sms.js`
- `verify-sms.js`
- `js/sms-auth.js`

Normalization strategy (E.164 oriented):
- Convert leading `00` to `+`
- Strip whitespace, parentheses, dashes, dots
- If lacks `+`:
  - 10 digits -> assume NANP -> prepend `+1`
  - 11 digits starting with `1` -> `+` + digits
  - 8–15 digits -> assume includes country code -> prepend `+`
- Validate: final pattern `^\+\d{8,15}$`

## Security Notes
- Codes hashed with pepper; leak of DB rows does not expose raw codes.
- TTL = 10 minutes (adjust `CODE_TTL_MS` in functions if needed).
- Attempts limited to 5; after that phone must request a new code.
- IP rate limiting (basic, memory) + per-phone hourly cap.
- For scale: replace in-memory maps with Redis / Upstash or Supabase row updates with a limited active index.

## Operational Considerations
- Rotating `SMS_PEPPER` immediately invalidates all active codes.
- Twilio errors bubble as 500 (send path). Monitor Netlify function logs.
- Consider adding alerting (e.g., ping production-monitor script) if errors > threshold.

## Migration / Future Upgrade
To switch to Supabase native OTP later:
1. Set `USE_SUPABASE_PHONE_OTP=true` (ensure Auth SMS template configured in Supabase dashboard).
2. Remove or bypass local verification UI specifics if Supabase returns a real auth session (update storage logic accordingly).
3. Optionally decommission custom tables & functions (retain for audit if needed).

## Troubleshooting
| Symptom | Possible Cause | Resolution |
|---------|----------------|-----------|
| 500 on send | Invalid Twilio credentials | Verify SID/token & number formatting `+1555...` |
| Always demo_code | Missing Twilio env vars | Set TWILIO_* vars & redeploy |
| Verification always fails | PEPPER mismatch or phone normalization drift | Confirm SMS_PEPPER consistent and normalization identical in both functions |
| Too many requests | IP or phone rate limit triggered | Wait for window (1 min IP / hourly phone cap) |
| Code accepted after rotation | Function not redeployed | Redeploy so new PEPPER is loaded |

## Extending
- Add analytics event on successful verification -> new table or existing events log.
- Issue signed JWT for downstream API access (add signing secret & expiry).
- Add direct Supabase profile bootstrap using service role after verification.

## Cleanup Function
`cleanup_old_phone_verifications` keeps only the latest N (default 3) unconsumed rows per phone to avoid table bloat.

---
Document version: 1.0
