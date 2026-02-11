#!/bin/bash

# Configuration
VPS_IP="66.116.224.31"
VPS_User="root"
PROJECT_ROOT="/Users/kvid/Desktop/Rationale-Generator"
REMOTE_BACKEND="/root/Rationale-Backend"
REMOTE_ADMIN_FE="/var/www/rationale-frontend"
REMOTE_GEN_FE="/var/www/rationale-gen"

echo "🚀 Starting Full Stack Deployment..."

# 1. Build Admin Web Frontend
echo "📦 Building Admin Web Frontend..."
cd "$PROJECT_ROOT/admin_web/frontend"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Admin Web Build Failed"
    exit 1
fi

# 2. Build Rationale Gen Frontend
echo "📦 Building Rationale Gen Frontend..."
cd "$PROJECT_ROOT/rationale_gen/frontend"
npm install # Ensure deps are installed
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Rationale Gen Build Failed"
    exit 1
fi

# 3. Upload Backend
echo "📤 Uploading Backend..."
cd "$PROJECT_ROOT"
# Exclude venv, __pycache__, .git, etc.
rsync -avz --exclude 'venv' --exclude '__pycache__' --exclude '.git' --exclude 'node_modules' --exclude '.DS_Store' \
    -e "ssh -o StrictHostKeyChecking=no -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa" \
    "$PROJECT_ROOT/backend/" "$VPS_User@$VPS_IP:$REMOTE_BACKEND/"

# 4. Upload Nginx Config
echo "📤 Uploading Nginx Config..."
scp -o StrictHostKeyChecking=no -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa "$PROJECT_ROOT/nginx_rationale.conf" "$VPS_User@$VPS_IP:/tmp/nginx_rationale.conf"

# 5. Upload Frontends
echo "📤 Uploading Admin Web Frontend..."
# Create remote dir if not exists (done via ssh below)
ssh -o StrictHostKeyChecking=no -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa "$VPS_User@$VPS_IP" "mkdir -p $REMOTE_ADMIN_FE $REMOTE_GEN_FE"
rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa" \
    "$PROJECT_ROOT/admin_web/public/" "$VPS_User@$VPS_IP:$REMOTE_ADMIN_FE/"

echo "📤 Uploading Rationale Gen Frontend..."
rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa" \
    "$PROJECT_ROOT/rationale_gen/public/" "$VPS_User@$VPS_IP:$REMOTE_GEN_FE/"


# 6. Remote Configuration
echo "🔧 Configuring Remote Server..."
ssh -o StrictHostKeyChecking=no -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa "$VPS_User@$VPS_IP" << 'EOF'
    # Setup Nginx
    mv /tmp/nginx_rationale.conf /etc/nginx/sites-available/rationale
    ln -sf /etc/nginx/sites-available/rationale /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx

    # Setup Backend
    cd /root/Rationale-Backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Restart Backend Service
    systemctl restart rationale-backend
EOF

echo "✅ Deployment Complete!"
echo "Admin Web: http://$VPS_IP/"
echo "Rationale Gen: http://$VPS_IP:8080/"
echo "Backend Docs: http://$VPS_IP/docs (via API proxy if configured) or http://$VPS_IP:8000/docs"
