# SF 2025 Landing (SMS-free)

Script-free static page designed for ads. Includes OG tags and CTA to https://soundfactorynyc.com/tables.

## Deploy (Netlify UI)
1) Create a new site from existing project
2) Select the `sf-2025-landing` folder
3) Build command: (leave blank) | Publish dir: `.`
4) Deploy
5) Copy the generated URL (e.g., `https://sf-2025-landing.netlify.app`)
6) Optional: Add custom domain (e.g., `jonathanpeters.com` or `2025.soundfactorynyc.com`)
   - Point A/ALIAS or CNAME to Netlify per their instructions

## Deploy (Netlify CLI)
```bash
# from the sf-2025-landing directory
netlify init --manual
netlify deploy --prod --dir .
```

## After it’s live
- Use the live URL in your Facebook ads
- Or ask to point `seance.soundfactorynyc.com/2025` to this new site via a 301 redirect
