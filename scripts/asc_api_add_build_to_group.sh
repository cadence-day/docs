#!/bin/bash
set -e
BUILD_ID="$1"
GROUP_ID="$2"

JWT=$(./scripts/asc_api_auth.sh)

curl -s -X POST   -H "Authorization: Bearer $JWT"   -H "Content-Type: application/json"   -d "{
    \"data\": {
      \"type\": \"betaGroupBuilds\",
      \"relationships\": {
        \"build\": {\"data\": {\"type\": \"builds\",\"id\": \"$BUILD_ID\"}},
        \"betaGroup\": {\"data\": {\"type\": \"betaGroups\",\"id\": \"$GROUP_ID\"}}
      }
    }
  }"   "https://api.appstoreconnect.apple.com/v1/betaGroupBuilds" > /dev/null

echo "Build $BUILD_ID added to group $GROUP_ID"
