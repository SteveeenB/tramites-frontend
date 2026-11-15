#!/bin/sh
set -eu

API_URL_VALUE="${API_URL:-http://localhost:8080/api}"
GOOGLE_CLIENT_ID_VALUE="${GOOGLE_CLIENT_ID:-}"

API_URL_ESCAPED=$(printf '%s' "$API_URL_VALUE" | sed 's/\\/\\\\/g; s/"/\\"/g')
GOOGLE_CLIENT_ID_ESCAPED=$(printf '%s' "$GOOGLE_CLIENT_ID_VALUE" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat <<EOF >/usr/share/nginx/html/config.js
window.__APP_CONFIG__ = {
  API_URL: "${API_URL_ESCAPED}",
  GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID_ESCAPED}",
};
EOF

exec nginx -g 'daemon off;'
