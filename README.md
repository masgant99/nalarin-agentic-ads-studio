# Agentic Ads Studio

Open-source, self-hosted, white-label paid media operations platform — automate and manage **Meta (Facebook/Instagram) Ads**, **Google Ads**, and **TikTok Ads** from one authenticated dashboard with human-approved campaign actions.

> Fork lineage: this project extends [`iscale-llc/iscale-facebook-ad-builder`](https://github.com/jasonakatiff/iscale-facebook-ad-builder) (MIT). Original copyright and license are preserved in [`LICENSE`](LICENSE).

---

## Key Features

- **Cross-Platform Overview**: Unified dashboard aggregating spend, impressions, clicks, CTR, conversions, and CPA across Meta, Google, and TikTok.
- **Competitor Research**: Scrape and analyze ads from the Facebook Ad Library; save searches and monitor competitors over time.
- **Ad Remix Engine**: Deconstruct winning ads into structural blueprints and reconstruct them with your own brand, product, and customer profile.
- **AI Creative Generation**: Image and video ad creatives via Google Gemini and Fal.ai (nano-banana models).
- **Per-User OAuth Connections**: Operators securely connect individual ad accounts; tokens are encrypted at rest (Fernet) and never exposed to the client.
- **Multi-Account & Multi-Advertiser Support**: Grants with multiple ad accounts are fully selectable per session from the UI.
- **Agentic Optimization (Auto-Mode)**: Rule-based autonomous optimization with hard guardrails — budget ceilings, daily spend caps, max actions per day, operating hours, global kill switch. Every mutation requires an explicit approval envelope; nothing spends money silently.
- **Scoped Machine API**: Dedicated `ads:read` token support for automated reporting bots (Telegram, Discord, Slack) with zero write endpoints exposed.
- **White-Label by Design**: Customize branding, logos, legal pages, and UI accent colors via standard environment variables without modifying source code.
- **Mobile-Responsive UI**: Clean, mobile-friendly interface built with React 19 and Tailwind CSS.

---

## Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite 7)             │
│            Tailwind CSS • Lucide Icons • Axios         │
└──────────────────────────┬─────────────────────────────┘
                           │ Reverse Proxy / TLS
┌──────────────────────────▼─────────────────────────────┐
│              Backend (FastAPI / Python 3.11)           │
│   SQLAlchemy • Alembic • Pydantic v2 • Fernet Crypto   │
│      Agentic Optimization Executor (auto-mode)         │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
┌──────────────▼─────────────┐   ┌─────────▼─────────────┐
│   PostgreSQL 16 Database   │   │ External Ad APIs      │
│  (Users, Tokens, Metadata) │   │ Meta, Google, TikTok  │
└────────────────────────────┘   └───────────────────────┘
```

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Alembic, PostgreSQL 16
- **Frontend**: React 19, Vite 7, Tailwind CSS
- **Authentication**: JWT Access/Refresh tokens with bcrypt password hashing
- **Security**: Fernet token encryption, rate limiting, strict CORS & CSP policies
- **Deployment**: Docker Compose (backend, frontend/nginx, PostgreSQL)

---

## Quick Start (Docker Deployment)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/masgant99/nalarin-agentic-ads-studio.git
cd nalarin-agentic-ads-studio

cp .env.example .env
```

### 2. Generate Required Security Keys

```bash
# JWT Secret Key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Fernet OAuth Token Encryption Key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Paste these into your `.env` file for `SECRET_KEY` and `OAUTH_TOKEN_ENCRYPTION_KEY`.

### 3. Start Containers

```bash
docker compose -p ads-studio -f docker-compose.prod.yml up -d --build
```

The application will be accessible at `http://localhost:3024` (or your configured reverse-proxy domain).

### 4. Create Initial Administrator Account

A fresh installation contains no default users. Seed the initial admin account:

```bash
docker compose -p ads-studio -f docker-compose.prod.yml exec backend \
  sh -c 'ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=YourSecurePassword123! PYTHONPATH=/app python init_db.py'
```

---

## Local Development Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev # http://localhost:5173
```

### Running Tests

```bash
# Backend unit tests
cd backend
DATABASE_URL=postgresql://postgres:password@localhost:5432/ads_test pytest tests/unit -v

# Frontend unit tests
cd frontend
npm run test:unit
```

---

## Provider OAuth Setup

Configure your developer applications and set the redirect URIs in respective developer portals:

| Platform | Console | Callback URL Pattern |
|---|---|---|
| **Meta Ads** | [Meta for Developers](https://developers.facebook.com) | `https://YOUR_DOMAIN/api/v1/facebook/oauth/callback` |
| **Google Ads** | [Google Cloud Console](https://console.cloud.google.com) | `https://YOUR_DOMAIN/api/v1/google-ads/oauth/callback` |
| **TikTok Ads** | [TikTok for Business](https://business-api.tiktok.com) | `https://YOUR_DOMAIN/api/v1/tiktok-ads/oauth/callback` |

Add the credentials (`FACEBOOK_APP_ID`, `GOOGLE_ADS_CLIENT_ID`, `TIKTOK_ADS_APP_ID`, etc.) to your `.env` file. Any unconfigured provider will return a clean `503 Service Unavailable` with setup guidance.

---

## Agentic Optimization & Auto-Mode

Safety-first autonomous optimization. All rules fail-closed (default: manual approval required):

| Env Var | Effect |
|---|---|
| `ADS_AUTO_MODE` | Enable auto-mode (`true`/`false`, default `false`) |
| `ADS_AUTO_ACTIONS` | Allowlist of auto-executable actions |
| `ADS_AUTO_MAX_BUDGET_MICROS` | Absolute budget ceiling per action |
| `ADS_AUTO_MAX_DAILY_SPEND_MICROS` | Cumulative daily spend cap |
| `ADS_AUTO_MAX_ACTIONS_PER_DAY` | Max auto actions per day |
| `ADS_MUTATION_KILL_SWITCH` | Global emergency stop (rejects everything) |

Every auto action still produces a signed proposal token (HMAC-SHA256, 10-minute TTL) and is verifiable end-to-end. Campaigns are always created **PAUSED**.

---

## White-Labeling & Branding

Customize the entire appearance without code changes:

```bash
VITE_APP_NAME="Your Agency Studio" \
VITE_APP_LOGO=/logo.png \
VITE_APP_TAGLINE="Next-Gen Ad Automation" \
VITE_APP_OPERATOR="Your Company Ltd" \
VITE_APP_OPERATOR_URL="https://yourcompany.com" \
VITE_APP_ACCENT="#2563EB" \
npm run build
```

Full details in [`docs/WHITELABEL.md`](docs/WHITELABEL.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Security & Privacy Highlights

- **Zero-Storage for Raw Passwords**: Hashed via standard `bcrypt`.
- **Encrypted OAuth Credentials**: Tokens stored in PostgreSQL encrypted with authenticated Fernet.
- **Fail-Safe Operations**: All mutating actions default to preview-only until explicit `confirm=true` payload is passed.
- **No Secret Leakage**: Machine tokens are scoped, hashed, and revokable.

---

## Contributing & License

Contributions are welcome! Please submit an issue or pull request for improvements.

Distributed under the **MIT License**. See [`LICENSE`](LICENSE).
