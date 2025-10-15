import fetch from "node-fetch";

// Replace with your info
const PAGE_ID = "1540443046174695"; // Soundfactorynyc page
const TOKEN = "EAAQeBpig7DkBPmVODDZAvEIXLBglZABKOoOZAVTwEfrk5VZBPqEvaf6x8l8BSDZATzZBlmsyK3NeARvlT9JehxFBlIfzOiqX6o0dTjgL9Yj3KnEOM07F8EZBiX0oaNvQoWDZBsgRkOZB8rTgziZCHxMSGyHafHM7d3LuJaHUNB6H7cixUDiZA6uZAJLOLAvsNDn3Br5JAJbZA"; // Soundfactorynyc page token

async function testFacebookPost() {
  try {
    // make an unpublished (invisible) post
    const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "🧪 Sound Factory API test (unpublished)",
        published: false,
        access_token: TOKEN,
      }),
    });

    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testFacebookPost();