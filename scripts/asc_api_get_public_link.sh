#!/bin/bash
set -e
GROUP_ID="$1"

JWT=$(./scripts/asc_api_auth.sh)

resp=$(curl -s -H "Authorization: Bearer $JWT"   "https://api.appstoreconnect.apple.com/v1/betaGroups/$GROUP_ID")

link=$(echo "$resp" | jq -r '.data.attributes.publicLink')

if [ "$link" = "null" ]; then
  curl -s -X PATCH     -H "Authorization: Bearer $JWT"     -H "Content-Type: application/json"     -d "{\"data\":{\"id\":\"$GROUP_ID\",\"type\":\"betaGroups\",\"attributes\":{\"publicLinkEnabled\":true}}}"     "https://api.appstoreconnect.apple.com/v1/betaGroups/$GROUP_ID" > /dev/null

  resp=$(curl -s -H "Authorization: Bearer $JWT"     "https://api.appstoreconnect.apple.com/v1/betaGroups/$GROUP_ID")
  link=$(echo "$resp" | jq -r '.data.attributes.publicLink')
fi

echo "$link"
