# Brücke

**A digital bridge during the wait for psychotherapy.**

Brücke is a bilingual (German/English) support platform for people waiting for a psychotherapy place. It provides a calm, supportive companion experience while keeping clear boundaries: it does not diagnose, prescribe medication, or replace emergency or professional care.

> **Important:** Brücke is a demonstration and support tool, not a medical device or emergency service. In an immediate emergency, contact local emergency services.

## What it includes

- German and English interface switching with persisted language preference
- Clara, an empathetic AI chat companion with language-aware prompts
- Crisis-aware guardrails and emergency-resource messaging
- Patient dashboard with:
  - Conversation support
  - Daily mood check-ins
  - Evidence-based activities and psychoeducation
- New-member intake survey
- Doctor portal for waitlist and patient overview
- Practitioner/reviewer portal for conversation review and validation
- Optional text-to-speech support
- Supabase-backed profiles, conversations, messages, mood data, and reviews
- Responsive UI for desktop and mobile
- Production Docker image and Google Cloud Run deployment configuration

## Tech stack

- [Next.js](https://nextjs.org/) 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Groq OpenAI-compatible chat API
- Supabase
- Recharts
- Lucide React
- Docker and Google Cloud Run

## Getting started

### Prerequisites

- Node.js 22 or newer
- npm
- Supabase project credentials
- Groq API key for AI chat

### Install

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional voice support
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
```

Never commit `.env`, `.env.local`, API keys, service-role keys, or other credentials. Use your hosting provider's secret/environment-variable store in production.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Validate the project

```bash
npm run lint
npm run build
```

On Windows PowerShell systems where `npm.ps1` is blocked by execution policy, use:

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

## Demo access

The application includes demo accounts for the role-based experience. Patient access opens directly; doctor and practitioner access use the demo login flow shown in the UI.

Do not use real patient information or real clinical credentials in this demonstration environment.

## Project structure

```text
src/
  app/
    api/                 Server routes for chat, profiles, summaries, TTS, and validation
    doctor/              Doctor portal
    patient/             Patient experience
    practitioner/        Practitioner/reviewer portal
    layout.tsx           Global metadata and language provider
  components/            Reusable UI modules and portals
  context/               Shared language state
  lib/
    guardrails.ts        Crisis and safety checks
    llm.ts               Groq chat integration
    mockData.ts           Demo accounts and sample data
    supabase.ts           Supabase server client
    translations.ts       German and English copy
  types/                 Shared TypeScript types
supabase_schema.sql       Database schema
Dockerfile                Production standalone image
deploy-gcp.ps1            Google Cloud Run deployment helper
```

## API routes

| Route | Purpose |
| --- | --- |
| `POST /api/chat` | Generate a Clara response, apply guardrails, and optionally save messages |
| `GET/POST /api/profile` | Read or update patient profile data |
| `POST /api/summary` | Generate a structured clinical pre-briefing |
| `POST /api/validate-summary` | Validate a generated summary |
| `POST /api/tts` | Generate optional speech audio |

## Database setup

Apply [`supabase_schema.sql`](./supabase_schema.sql) to a Supabase project before enabling persistence. The application can still render its demo UI without every production table being populated, but chat persistence and clinical-review workflows require the relevant schema and credentials.

## Docker

Build and run the production image locally:

```bash
docker build -t bruecke .
docker run --env-file .env.local -p 8080:8080 bruecke
```

Open [http://localhost:8080](http://localhost:8080).

The image uses Next.js standalone output and listens on port `8080`.

## Google Cloud Run

The repository includes [`deploy-gcp.ps1`](./deploy-gcp.ps1) and [`deploy-gcp.sh`](./deploy-gcp.sh) as deployment starting points.

Before deploying:

1. Authenticate with Google Cloud.
2. Select or update the target project and region.
3. Configure all application secrets through Cloud Run environment variables or Secret Manager.
4. Ensure no credentials are stored in scripts or committed to Git.
5. Deploy from a clean working tree after validating with `npm run build`.

For production, prefer Secret Manager and a least-privilege service account instead of passing sensitive values directly on the command line.

## Safety and privacy

- This app is not a substitute for psychotherapy, diagnosis, medication, or emergency intervention.
- Crisis messages include emergency guidance and should be reviewed for the deployment country.
- Treat all conversation, profile, and mood data as sensitive.
- Use HTTPS, access controls, protected secrets, database row-level security, and audit logging before handling real users.
- Do not use the bundled demo accounts or mock data for real clinical decisions.

## Contributing

1. Create a feature branch.
2. Keep translations synchronized in [`src/lib/translations.ts`](./src/lib/translations.ts).
3. Run lint and build checks before opening a pull request.
4. Do not include secrets, real patient data, or identifying information in commits.

## License

No license has been specified for this repository yet. Treat the code as proprietary unless the project owners provide explicit licensing terms.
