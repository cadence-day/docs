#!/bin/bash
set -e

APP_ID="$1"
VERSION="$2"

JWT=$(./scripts/asc_api_auth.sh)

# Get pre-release builds for the app, sorted by version/upload date descending
# Filter by version if provided
if [ -n "$VERSION" ]; then
  # Get builds for specific version
  resp=$(curl -s -H "Authorization: Bearer $JWT" \
    "https://api.appstoreconnect.apple.com/v1/apps/$APP_ID/preReleaseVersions?filter[version]=$VERSION&sort=-version&limit=1")

  pre_release_id=$(echo "$resp" | jq -r '.data[0].id')

  if [ "$pre_release_id" = "null" ] || [ -z "$pre_release_id" ]; then
    echo "No pre-release version found for version $VERSION" >&2
    exit 1
  fi

  # Get builds for this pre-release version
  builds_resp=$(curl -s -H "Authorization: Bearer $JWT" \
    "https://api.appstoreconnect.apple.com/v1/preReleaseVersions/$pre_release_id/builds?sort=-uploadedDate&limit=1")
else
  # Get all builds, sorted by upload date descending
  builds_resp=$(curl -s -H "Authorization: Bearer $JWT" \
    "https://api.appstoreconnect.apple.com/v1/apps/$APP_ID/builds?sort=-uploadedDate&limit=1")
fi

build_id=$(echo "$builds_resp" | jq -r '.data[0].id')

if [ "$build_id" = "null" ] || [ -z "$build_id" ]; then
  echo "No build found" >&2
  exit 1
fi

echo "$build_id"
