#!/bin/sh
set -e

BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-http://backend:3001}"

case "$BACKEND_UPSTREAM" in
  http://*|https://*) ;;
  *) BACKEND_UPSTREAM="https://${BACKEND_UPSTREAM}" ;;
esac

envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
