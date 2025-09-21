#!/bin/bash
set -e
GROUP_NAME="$2"
MODE="$1"

if [ "$MODE" != "get-or-create" ]; then
  echo "Usage: $0 get-or-create <group-name>" >&2
  exit 1
fi

JWT=$(./scripts/asc_api_auth.sh)

resp=$(curl -s -H "Authorization: Bearer $JWT"   "https://api.appstoreconnect.apple.com/v1/betaGroups?filter[app]=$APP_STORE_CONNECT_APP_ID")

group_id=$(echo "$resp" | jq -r ".data[] | select(.attributes.name==\"$GROUP_NAME\") | .id")

if [ -z "$group_id" ] || [ "$group_id" = "null" ]; then
  create=$(curl -s -X POST     -H "Authorization: Bearer $JWT"     -H "Content-Type: application/json"     -d "{\"data\": {\"type\": \"betaGroups\", \"attributes\": {\"name\": \"$GROUP_NAME\"}, \"relationships\": {\"app\": {\"data\": {\"type\": \"apps\", \"id\": \"$APP_STORE_CONNECT_APP_ID\"}}}}}"     "https://api.appstoreconnect.apple.com/v1/betaGroups")
  group_id=$(echo "$create" | jq -r ".data.id")
fi

echo "$group_id"
