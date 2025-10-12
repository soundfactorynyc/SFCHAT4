# 🔒 PROTECTED FILES - DO NOT DELETE

## Halloween Tables Page
**CRITICAL:** These files are PROTECTED and must NOT be deleted or modified without backup.

### Main File
- `halloween-tables.html` - The main Halloween tables reservation page

### URLs (All three must work)
1. https://seance.soundfactorynyc.com/halloween-tables.html (Main)
2. https://seance.soundfactorynyc.com/halloween (Redirect)
3. https://seance.soundfactorynyc.com/tables-halloween (Redirect)

### Redirects Configuration
The redirects are configured in `netlify.toml`:
```toml
[[redirects]]
  from = "/tables-halloween"
  to = "/halloween-tables.html"
  status = 301

[[redirects]]
  from = "/halloween"
  to = "/halloween-tables.html"
  status = 301
```

### Backup Location
- Backup stored in: `.backups/halloween/halloween-tables.html.backup`
- Create new backup before any changes: `cp halloween-tables.html .backups/halloween/halloween-tables.html.backup`

### Recovery Instructions
If file is accidentally deleted:
1. `cp .backups/halloween/halloween-tables.html.backup halloween-tables.html`
2. `netlify deploy --prod`

## DO NOT:
- ❌ Delete `halloween-tables.html`
- ❌ Modify `netlify.toml` redirects without backup
- ❌ Delete `.backups/` folder
- ❌ Change file names without updating redirects

## Before Making Changes:
1. Create backup: `cp halloween-tables.html .backups/halloween/halloween-tables-$(date +%Y%m%d-%H%M%S).html`
2. Test locally first
3. Deploy to production
4. Verify all 3 URLs work

**Last Updated:** $(date)
