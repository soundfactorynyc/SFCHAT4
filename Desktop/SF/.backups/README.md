# 🔒 BACKUP DIRECTORY

This directory contains critical backups of protected files.

## DO NOT DELETE THIS FOLDER

### Contents:
- `halloween/` - Halloween tables page backups

### How to Use:
To restore a backup:
```bash
cp .backups/halloween/halloween-tables.html.backup halloween-tables.html
netlify deploy --prod
```

### Creating New Backups:
```bash
# Create timestamped backup
cp halloween-tables.html .backups/halloween/halloween-tables-$(date +%Y%m%d-%H%M%S).html
```

**KEEP THIS FOLDER SAFE!**
