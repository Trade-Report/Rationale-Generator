#!/bin/bash
set -e

# Update Nginx config
cat <<EOF > /etc/nginx/sites-available/rationale
server {
    listen 80;
    server_name _;

    root /var/www/rationale-frontend;
    index index.html;

    # Backend API proxy
    location /api/ {
        # Proxy to backend, stripping /api/ prefix
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SPA - Forward all other requests to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Reload Nginx
systemctl reload nginx
systemctl status nginx --no-pager
