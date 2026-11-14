#!/usr/bin/env bash
set -e

PROJECT_ID="magdehack"
REGION="europe-west3" # Frankfurt (closest to Magdeburg, Germany)
SERVICE_NAME="bruecke"

echo "=== 1. Setting active GCP project to $PROJECT_ID ==="
gcloud config set project "$PROJECT_ID"

echo "=== 2. Enabling required Google Cloud APIs (Run, Cloud Build, Artifact Registry) ==="
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID"

echo "=== 3. Building container & deploying to Google Cloud Run ==="
# Read env vars from current environment instead of hardcoding secrets
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="",NEXT_PUBLIC_SUPABASE_ANON_KEY="",SUPABASE_SERVICE_ROLE_KEY="",GROQ_API_KEY="",GROQ_MODEL="openai/gpt-oss-120b",ELEVENLABS_API_KEY="",ELEVENLABS_VOICE_ID=""
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}",NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}",GROQ_API_KEY="${GROQ_API_KEY}",GROQ_MODEL="${GROQ_MODEL}",ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY}",ELEVENLABS_VOICE_ID="${ELEVENLABS_VOICE_ID}"

echo "=== SUCCESS! Your app is now live on Google Cloud Run! ==="
