#!/bin/bash

# Deploy rationale_gen to Google Cloud Run
# This script builds and deploys the application to Cloud Run

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to Google Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Prompt for project ID if not set
if [ -z "$GCP_PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your Google Cloud Project ID:${NC}"
    read -r GCP_PROJECT_ID
fi

# Prompt for region if not set
if [ -z "$GCP_REGION" ]; then
    echo -e "${YELLOW}Enter your preferred region (e.g., us-central1, asia-south1):${NC}"
    read -r GCP_REGION
fi

# Set the project
echo -e "${GREEN}Setting project to: $GCP_PROJECT_ID${NC}"
gcloud config set project "$GCP_PROJECT_ID"

# Enable required APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Define variables
SERVICE_NAME="rationale-gen"
IMAGE_NAME="gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME"

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t "$IMAGE_NAME" .

# Push to Google Container Registry
echo -e "${GREEN}Pushing image to Google Container Registry...${NC}"
docker push "$IMAGE_NAME"

# Deploy to Cloud Run
echo -e "${GREEN}Deploying to Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_NAME" \
    --platform managed \
    --region "$GCP_REGION" \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300

# Get the service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$GCP_REGION" --format 'value(status.url)')

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Service URL: $SERVICE_URL${NC}"
echo ""
echo -e "${YELLOW}To view logs, run:${NC}"
echo "gcloud run services logs read $SERVICE_NAME --region $GCP_REGION"
