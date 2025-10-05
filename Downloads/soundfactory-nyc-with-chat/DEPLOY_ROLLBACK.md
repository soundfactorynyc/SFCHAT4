# Deployment & Rollback Playbook

This document gives you a fast, repeatable checklist for deploying, validating, monitoring, and rolling back the Sound Factory stack.

---
## 1. Pre-Deploy Checklist
| Item | Command / Action | Goal |
|------|------------------|------|
| Git clean | `git status` | No stray local changes unless intended |
| Build locally (if build step) | `npm run build` (if applicable) | Surface compilation errors early |
| Verify env vars (Netlify) | Check Netlify UI / `verify-production.sh` | All required secrets present |
| Run verification script | `./verify-production.sh` | Endpoint + header sanity |
| Apply latest SQL patches | Supabase SQL Editor or migration pipeline | DB schema aligned |
| Twilio keys set (if using custom SMS) | Netlify env panel | Avoid demo code exposure |
| Supabase OTP flag set correctly | `USE_SUPABASE_PHONE_OTP=true/false` | Intended auth path |

Required env (minimum): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `SMS_PEPPER`, plus Twilio or Supabase OTP.

---
## 2. Deployment (Netlify)
1. Commit & push main branch.
2. Confirm Netlify build triggers.
3. Watch deploy logs for errors.
4. When live, run:
```
./verify-production.sh
```
5. Start monitor (optional long-run):
```
NODE_ENV=production MONITOR_INTERVAL=30000 node production-monitor.js
```

---
## 3. Post-Deploy Validation
| Check | How |
|-------|-----|
| Homepage loads | `curl -I https://soundfactorynyc.com` status 200 + security headers |
| Live stream container present | Manual browser check |
| SMS send (custom) | Inspect Network → `/.netlify/functions/send-sms` 200 |
| SMS verify (custom) | Enter code, verify localStorage session updated |
| Supabase OTP (if enabled) | Check `auth.users` row created + valid session via devtools |
| Stripe webhook reachable | Netlify function logs show 200 on test event |
| Rate limiting unaffected | Burst a few requests; ensure no 429 unless intended |

---
## 4. Monitoring & Logs
| Tool | Usage |
|------|-------|
| Production monitor | `node production-monitor.js` (interval 15–30s) |
| Netlify function logs | Netlify UI → Functions → Logs |
| Stripe CLI (optional) | `stripe listen --forward-to /.netlify/functions/stripe-webhook` |
| Supabase logs | Supabase dashboard → Logs → API/Auth |

---
## 5. Rollback Strategy
Priority is speed and safety. You have 3 layers:
1. Frontend rollback (Netlify deploy restore)
2. Function rollback (older commit redeploy)
3. Database rollback (rare; prefer forward fixes)

### 5.1 Quick Frontend/Functions Rollback
If the last deploy broke something:
1. In Netlify UI → Deploys → Pick previous successful → “Rollback to this deploy”.
2. Confirm by re-running `./verify-production.sh`.

### 5.2 Git Revert & Redeploy
```
git revert <bad_commit_sha>
git push origin main
```
Netlify auto-builds reverted code.

### 5.3 Emergency Disable Risky Feature
- Flip feature flag: e.g. set `USE_SUPABASE_PHONE_OTP=false`.
- Redeploy (faster than code revert if code path gracefully branches).

### 5.4 Stripe Webhook Issues
- Temporarily comment out commissioning logic or guard with ENV flag (e.g. `PROCESS_COMMISSIONS=false`).
- Redeploy minimal patch.

---
## 6. Database Safety
| Action | Guidance |
|--------|----------|
| Avoid destructive rollbacks | Prefer additive patches; never drop columns in panic |
| Hotfix constraint | Add new partial index or disable trigger with `ALTER TABLE ... DISABLE TRIGGER` (short window) |
| Realtime issues | Disable triggers generating events instead of dropping tables |

If a patch caused failure, create a new “revert” patch (do not edit existing migration files in production history).

---
## 7. SMS Auth Path Switch
| Scenario | Action |
|----------|--------|
| Twilio only | Ensure `USE_SUPABASE_PHONE_OTP` unset/false; Twilio env vars present |
| Supabase OTP | Set `USE_SUPABASE_PHONE_OTP=true`; optional removal of custom functions later |
| Fallback desire | Keep both; add runtime fallback logic (still optional) |

Verification after switch: Open fresh browser session → trigger code → confirm network calls (Supabase vs custom function) align with config.

---
## 8. Observability Thresholds
| Metric | Trigger | Action |
|--------|---------|--------|
| Consecutive monitor FAIL >= 5 | Endpoint unstable | Inspect Netlify logs, consider rollback |
| SMS send failure > 10% | Provider or throttling issue | Check Twilio / Supabase OTP quotas |
| Stripe webhook latency > 3s | Performance issue | Add logging around handler segments |

---
## 9. Incident Flow (Condensed)
1. Detect anomaly (monitor output / user report).
2. Snapshot logs (`netlify functions:tail` or UI export).
3. Toggle feature flag if isolated.
4. Roll back to last known good deploy (UI or git revert) if wide impact.
5. Open task list for root cause; apply forward patch.

---
## 10. Useful Commands (Local / SSH / Container)
```
# Headers & reachability
auth curl -I https://soundfactorynyc.com
# Verification script
./verify-production.sh
# Production monitor (one cycle only)
MONITOR_CYCLES=1 node production-monitor.js
# Tail logs (Docker example environments)
docker-compose logs -f --tail=100
# Resource usage
docker stats
# Restart all
docker-compose down && docker-compose up -d
# Redis flush (CAUTION)
docker exec redis redis-cli FLUSHALL
```

---
## 11. Backups
Add crontab entry on server (if self-hosting DB or other assets):
```
0 2 * * * /path/to/your/backup-script.sh
```
Ensure backup script: exports critical env, dumps DB, rotates, uploads to secure storage.

---
## 12. Next Enhancements (Optional)
- Add automatic canary check to `production-monitor.js` for a full round-trip (OTP send/verify in staging environment).
- Integrate structured logging (JSON) and use a log shipper (Vector / Logflare).
- Add Slack / Discord webhook alert on monitor failure threshold.

---
### Fast TL;DR
Deploy → Run verification script → Start monitor → If broken, rollback via Netlify previous deploy or revert commit → Confirm fix.

Stay additive, prefer flags over emergency code surgery.
