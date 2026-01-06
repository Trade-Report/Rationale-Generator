# Deploying rationale_gen to Google Cloud Run

This guide walks you through deploying the rationale_gen application to Google Cloud Run.

## Prerequisites

✅ Docker installed and running (`/usr/local/bin/docker`)
✅ Google Cloud SDK installed (`/opt/homebrew/bin/gcloud`)

## Quick Start

### Option 1: Using the Deployment Script (Recommended)

1. **Start Docker Desktop** (if not already running)

2. **Run the deployment script**:
   ```bash
   cd /Users/kvid/Desktop/Trade\ Analyser/rationale_gen
   ./deploy.sh
   ```

3. **Follow the prompts**:
   - Enter your Google Cloud Project ID
   - Enter your preferred region (e.g., `us-central1`, `asia-south1`)

The script will:
- Build the Docker image
- Push it to Google Container Registry
- Deploy to Cloud Run
- Display your service URL

### Option 2: Manual Deployment

#### Step 1: Start Docker
Make sure Docker Desktop is running.

#### Step 2: Authenticate with Google Cloud
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### Step 3: Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### Step 4: Build the Docker Image
```bash
cd /Users/kvid/Desktop/Trade\ Analyser/rationale_gen
docker build -t gcr.io/YOUR_PROJECT_ID/rationale-gen .
```

#### Step 5: Push to Google Container Registry
```bash
docker push gcr.io/YOUR_PROJECT_ID/rationale-gen
```

#### Step 6: Deploy to Cloud Run
```bash
gcloud run deploy rationale-gen \
    --image gcr.io/YOUR_PROJECT_ID/rationale-gen \
    --platform managed \
    --region YOUR_REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300
```

## Testing Locally with Docker

Before deploying to Cloud Run, you can test the Docker container locally:

```bash
# Build the image
docker build -t rationale-gen-test .

# Run the container
docker run -p 8080:8080 rationale-gen-test

# Access the app at http://localhost:8080
```

## Environment Variables

If your application requires environment variables, add them during deployment:

```bash
gcloud run deploy rationale-gen \
    --image gcr.io/YOUR_PROJECT_ID/rationale-gen \
    --platform managed \
    --region YOUR_REGION \
    --set-env-vars "VAR_NAME=value,ANOTHER_VAR=value"
```

Or use a `.env.yaml` file:
```yaml
VAR_NAME: "value"
ANOTHER_VAR: "value"
```

Then deploy with:
```bash
gcloud run deploy rationale-gen \
    --image gcr.io/YOUR_PROJECT_ID/rationale-gen \
    --env-vars-file .env.yaml
```

## Viewing Logs

After deployment, view logs with:
```bash
gcloud run services logs read rationale-gen --region YOUR_REGION --limit 50
```

Or stream logs in real-time:
```bash
gcloud run services logs tail rationale-gen --region YOUR_REGION
```

## Updating the Deployment

To update the application after making changes:

1. Rebuild the Docker image
2. Push to Container Registry
3. Redeploy to Cloud Run

Or simply run `./deploy.sh` again.

## Troubleshooting

### Docker daemon not running
**Error**: `Cannot connect to the Docker daemon`
**Solution**: Start Docker Desktop application

### Authentication issues
**Error**: `ERROR: (gcloud.auth.login) There was a problem`
**Solution**: Run `gcloud auth login` and follow the browser authentication flow

### Build failures
**Error**: Build fails during frontend build
**Solution**: 
- Check that `frontend/package.json` exists
- Verify Node.js dependencies are correct
- Try building locally first: `cd frontend && npm install && npm run build`

### Deployment fails
**Error**: `ERROR: (gcloud.run.deploy) PERMISSION_DENIED`
**Solution**: 
- Ensure you have the necessary IAM permissions
- Run `gcloud auth application-default login`

## Cost Optimization

Cloud Run pricing is based on:
- Request count
- CPU and memory usage
- Execution time

To optimize costs:
- Set `--max-instances` to limit concurrent instances
- Use `--cpu-throttling` for CPU allocation
- Monitor usage in Google Cloud Console

## Next Steps

After successful deployment:
1. ✅ Test all application features
2. ✅ Set up custom domain (optional)
3. ✅ Configure CI/CD pipeline (optional)
4. ✅ Set up monitoring and alerts
5. ✅ Review and adjust resource limits based on usage

## Files Created for Deployment

- `Dockerfile` - Multi-stage build configuration
- `.dockerignore` - Excludes unnecessary files from Docker build
- `.gcloudignore` - Excludes files from Cloud deployment
- `deploy.sh` - Automated deployment script
- `server.js` - Updated to use PORT environment variable
