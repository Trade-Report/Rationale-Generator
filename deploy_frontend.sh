#!/bin/bash
set -e

# Install Nginx and unzip
apt-get update
apt-get install -y nginx unzip

# Prepare frontend directory
rm -rf /var/www/rationale-frontend
mkdir -p /var/www/rationale-frontend

# Unzip frontend files
unzip -o /root/frontend_deploy.zip -d /var/www/rationale-frontend

# Configure Nginx
cat <<EOF > /etc/nginx/sites-available/rationale
server {
    listen 80;
    server_name _;

    root /var/www/rationale-frontend;
    index index.html;

    # Backend API proxy
    location /api/ {
        # Rewrite /api/foo to /foo for backend
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:8000;
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

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/rationale /etc/nginx/sites-enabled/

# Test and restart
nginx -t
systemctl restart nginx
systemctl status nginx --no-pager
