#!/bin/bash

# Temporarily link to sffinal to get its env vars
echo "Getting environment variables from sffinal..."
netlify unlink 2>/dev/null
netlify link --name sffinal

# Get all env vars from sffinal
echo "Fetching sffinal environment variables..."
netlify env:list --json > sffinal-env.json

# Link to teamsf
echo "Linking to teamsf..."
netlify unlink
netlify link --name teamsf

# Parse and set each variable
echo "Setting environment variables on teamsf..."
cat sffinal-env.json | jq -r 'to_entries[] | "\(.key)=\(.value)"' | while IFS='=' read -r key value; do
  if [ -n "$key" ] && [ -n "$value" ] && [ "$value" != "null" ]; then
    echo "Setting $key..."
    netlify env:set "$key" "$value" 2>&1 | grep -v "Set environment variable"
  fi
done

echo "Done! All variables copied from sffinal to teamsf"
rm sffinal-env.json
