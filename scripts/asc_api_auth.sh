#!/bin/bash
# Generates a JWT for App Store Connect API
# Requires APP_STORE_CONNECT_KEY_ID, APP_STORE_CONNECT_KEY_ISSUER_ID and APP_STORE_CONNECT_KEY in env.

header='{"alg":"ES256","kid":"'"$APP_STORE_CONNECT_KEY_ID"'"}'
now=$(date +%s)
exp=$((now + 1200))
payload='{"iss":"'"$APP_STORE_CONNECT_KEY_ISSUER_ID"'","exp":'$exp',"aud":"appstoreconnect-v1"}'

b64enc() { openssl base64 -e -A | tr '+/' '-_' | tr -d '='; }

unsigned=$(echo -n "$header" | b64enc).$(echo -n "$payload" | b64enc)

signature=$(echo -n "$unsigned" |   openssl dgst -sha256 -sign <(echo -n "$APP_STORE_CONNECT_KEY") | b64enc)

echo "$unsigned.$signature"
