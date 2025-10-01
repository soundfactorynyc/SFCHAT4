# Backups

- Keep dated working snapshots here.
- Example workflow:

```
# Create timestamped backup
mkdir -p backup/$(date +%Y-%m-%d-%H%M)/
cp -r . backup/$(date +%Y-%m-%d-%H%M)/.
```

- Staging workflow for risky edits:
```
cp components/tables.html components/tables-staging.html
# Make changes to -staging, test thoroughly
mv components/tables-staging.html components/tables.html
```
