#!/bin/bash
set -e

# Disable conflicting site
if [ -f /etc/nginx/sites-enabled/admin-panel ]; then
    rm /etc/nginx/sites-enabled/admin-panel
    echo "Removed admin-panel site"
fi

# Reload Nginx
systemctl reload nginx
systemctl status nginx --no-pager
