$ErrorActionPreference = "Stop"

$PROJECT_ID = "magdehack"
$REGION = "europe-west3" # Frankfurt
$SERVICE_NAME = "bruecke"

Write-Host "=== 1. Setting active GCP project to $PROJECT_ID ===" -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

Write-Host "=== 2. Enabling required Google Cloud APIs ===" -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project $PROJECT_ID

Write-Host "=== 3. Building container & deploying to Google Cloud Run ===" -ForegroundColor Cyan
# Pass env vars from .env.local or shell environment variables (do NOT hardcode secrets)
gcloud run deploy $SERVICE_NAME `
  --source . `
  --project $PROJECT_ID `
  --region $REGION `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 5 `
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="",NEXT_PUBLIC_SUPABASE_ANON_KEY="",SUPABASE_SERVICE_ROLE_KEY="",GROQ_API_KEY="",GROQ_MODEL="openai/gpt-oss-120b",ELEVENLABS_API_KEY="",ELEVENLABS_VOICE_ID=""
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="$env:NEXT_PUBLIC_SUPABASE_URL",NEXT_PUBLIC_SUPABASE_ANON_KEY="$env:NEXT_PUBLIC_SUPABASE_ANON_KEY",GROQ_API_KEY="$env:GROQ_API_KEY",GROQ_MODEL="$env:GROQ_MODEL",ELEVENLABS_API_KEY="$env:ELEVENLABS_API_KEY",ELEVENLABS_VOICE_ID="$env:ELEVENLABS_VOICE_ID"

Write-Host "=== SUCCESS! Your app is now live on Google Cloud Run! ===" -ForegroundColor Green
