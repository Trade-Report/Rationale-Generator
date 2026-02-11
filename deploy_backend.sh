#!/bin/bash
set -e

# Update and install system dependencies
apt-get update
apt-get install -y python3-venv python3-pip libpq-dev unzip postgresql-client

# Navigate to backend directory
cd /root/Rationale-Backend

# Unzip files
unzip -o backend_deploy.zip

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Install python dependencies
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# Database setup
export PGPASSWORD='RationaleDB@2025'
# Try to create database if it doesn't exist (assuming user has createdb privilege, or ignore error)
createdb -h localhost -U rationale_user rationale || true

# Create .env file
# Note: Password has @, so we URL encode it for the connection string: RationaleDB%402025
cat <<EOF > .env
DATABASE_URL=postgresql://rationale_user:RationaleDB%402025@localhost:5432/rationale
EOF

# Create systemd service
cat <<EOF > /etc/systemd/system/rationale-backend.service
[Unit]
Description=Rationale Generator Backend
After=network.target

[Service]
User=root
WorkingDirectory=/root/Rationale-Backend
ExecStart=/root/Rationale-Backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and restart service
systemctl daemon-reload
systemctl enable rationale-backend
systemctl restart rationale-backend

# Check status
systemctl status rationale-backend --no-pager
