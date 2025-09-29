# Sound Factory Facebook Ads — Ready Package

This folder is prepped with your IDs injected. Do this:

## 1) Start the dynamic content API (optional, for dynamic ads)
```bash
cd server
npm i
npm start
```
This exposes endpoints like `/api/site-activity`, `/api/inventory`, `/api/recent-activity` used by your dynamic ad.

## 2) Import campaigns via API (super simple)
From this folder's root:
```bash
FB_ACCESS_TOKEN=YOUR_LONG_LIVED_TOKEN \FB_AD_ACCOUNT_ID=act_XXXXXXXXXXXXX \node ./scripts/easy_import.mjs --go
```
- Omit `--go` for a DRY RUN preview.
- Uses `facebook_ads_import_prepared.json` (with your IDs already applied).

## 3) If you prefer Ads Manager (no code)
- Open Ads Manager → **Create** → **Import JSON**
- Upload `facebook_ads_import_prepared.json`

## 4) Install Pixel on your site
Use `facebook_pixel_implementation_prepared.js` — it already contains your Pixel ID `987654321098765`.

## Included
- `facebook_ads_import_prepared.json` — your full campaign/adset/ads with IDs injected
- `dynamic_ad_parameters_prepared.json` — dynamic config with pixel updated
- `creatives/` — HTML/CSS creatives
- `server/` — Node API for dynamic content
- `scripts/easy_import.mjs` — 1-file importer
