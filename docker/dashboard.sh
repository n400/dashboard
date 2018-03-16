#!/bin/bash
set -e

envsubst '${DASHBOARD_SERVER_NAME}' < /etc/nginx/conf.d/dashboard.conf.template > /etc/nginx/conf.d/dashboard.conf
if [[ "$DASHBOARD_PROTOCOL" == "https" ]]; then
  sed -i 's/#ENFORCE_HTTPS: //g' /etc/nginx/conf.d/dashboard.conf
fi

nginx -g 'daemon off;'
