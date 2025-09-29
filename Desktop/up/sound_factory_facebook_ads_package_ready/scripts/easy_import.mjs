#!/usr/bin/env node
/**
 * EASIEST Facebook Ads Importer
 * - Reads ./facebook_ads_import_prepared.json in this folder
 * - Creates Campaigns -> Ad Sets -> Creatives -> Ads via Graph API
 *
 * Usage:
 *   FB_ACCESS_TOKEN=YOUR_TOKEN FB_AD_ACCOUNT_ID=act_123 node ./scripts/easy_import.mjs --go
 *   (omit --go for dry run)
 */
import fs from "fs";
const API_VERSION = "v20.0";
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;
const DO_CREATE = process.argv.includes("--go");
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || "";
const AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID || "";
if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) {
  console.error("Set FB_ACCESS_TOKEN and FB_AD_ACCOUNT_ID env vars.");
  process.exit(1);
}
const headers = { "Content-Type": "application/x-www-form-urlencoded" };
function cents(x){ return Math.round(Number(x)*100); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function fb(endpoint, params){
  const body = new URLSearchParams({ access_token: ACCESS_TOKEN });
  for (const [k,v] of Object.entries(params||{})){
    body.append(k, (typeof v === "object") ? JSON.stringify(v) : String(v));
  }
  if (!DO_CREATE){
    console.log("DRY RUN →", endpoint, JSON.stringify(params).slice(0,500));
    return { id: "dry_"+Math.random().toString(36).slice(2) };
  }
  let tries=0;
  while(true){
    tries++;
    const res = await fetch(`${GRAPH}${endpoint}`, { method:"POST", headers, body });
    const json = await res.json();
    if (res.ok && !json.error) return json;
    const code = json?.error?.code;
    if ([4,17,32].includes(code) && tries<5){
      const wait = 800*tries;
      console.log(`Rate limited, retrying in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    console.error("FB Error:", json);
    throw new Error(json?.error?.message || "Graph error");
  }
}
const data = JSON.parse(fs.readFileSync("./facebook_ads_import_prepared.json","utf8"));
async function run(){
  console.log(`Importing ${data.length} campaign bundle(s). DO_CREATE=${DO_CREATE}`);
  for (const bundle of data){
    const campaign = bundle.campaign;
    const adsets = bundle.adsets || [];
    const ads = bundle.ads || [];
    // Campaign
    const campRes = await fb(`/${AD_ACCOUNT_ID}/campaigns`, {
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status || "PAUSED",
      special_ad_categories: campaign.special_ad_categories || []
    });
    console.log("Campaign:", campaign.name, campRes.id);
    // AdSets
    const adsetIds = [];
    for (const adset of adsets){
      const daily = (adset.daily_budget || campaign.daily_budget || 50);
      const asetRes = await fb(`/${AD_ACCOUNT_ID}/adsets`, {
        name: adset.name,
        campaign_id: campRes.id,
        daily_budget: cents(daily),
        optimization_goal: adset.optimization_goal,
        billing_event: adset.billing_event,
        bid_amount: adset.bid_amount ? cents(adset.bid_amount) : undefined,
        targeting: adset.targeting,
        start_time: adset.start_time,
        end_time: adset.end_time,
        promoted_object: adset.promoted_object
      });
      console.log("  AdSet:", adset.name, asetRes.id);
      adsetIds.push(asetRes.id);
    }
    // Ads + Creatives
    let i=0;
    for (const ad of ads){
      const creative = await fb(`/${AD_ACCOUNT_ID}/adcreatives`, {
        name: ad.name + " Creative",
        object_story_spec: ad.creative?.object_story_spec,
        asset_feed_spec: ad.creative?.asset_feed_spec,
        url_tags: ad.url_tags
      });
      const adRes = await fb(`/${AD_ACCOUNT_ID}/ads`, {
        name: ad.name,
        status: ad.status || "PAUSED",
        adset_id: adsetIds[i % adsetIds.length],
        creative: { creative_id: creative.id },
        url_tags: ad.url_tags
      });
      console.log("    Ad:", ad.name, adRes.id);
      i++;
    }
  }
  console.log("✅ Import complete.");
}
run().catch(e=>{ console.error("❌ Import failed:", e.message); process.exit(1); });
