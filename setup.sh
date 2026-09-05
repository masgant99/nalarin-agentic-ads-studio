#!/bin/bash
#
# Facebook Ad Builder - Interactive Setup Script
# This script walks you through setting up the application
#
# Created by Jason Akatiff
# iSCALE.com | A4D.com
# Telegram: @jasonakatiff
# Email: jason@jasonakatiff.com
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Print functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Check if a command exists
check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Get user input with default
prompt() {
    local prompt_text="$1"
    local default="$2"
    local var_name="$3"

    if [ -n "$default" ]; then
        read -p "$(echo -e "${CYAN}?${NC} $prompt_text [${default}]: ")" input
        eval "$var_name=\"${input:-$default}\""
    else
        read -p "$(echo -e "${CYAN}?${NC} $prompt_text: ")" input
        eval "$var_name=\"$input\""
    fi
}

# Get secret input (hidden)
prompt_secret() {
    local prompt_text="$1"
    local var_name="$2"

    read -s -p "$(echo -e "${CYAN}?${NC} $prompt_text: ")" input
    echo ""
    eval "$var_name=\"$input\""
}

# Yes/No prompt
confirm() {
    local prompt_text="$1"
    local default="${2:-y}"

    if [ "$default" = "y" ]; then
        read -p "$(echo -e "${CYAN}?${NC} $prompt_text [Y/n]: ")" input
        input="${input:-y}"
    else
        read -p "$(echo -e "${CYAN}?${NC} $prompt_text [y/N]: ")" input
        input="${input:-n}"
    fi

    [[ "$input" =~ ^[Yy] ]]
}

#
# MAIN SCRIPT
#

clear
echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════════════════╗"
echo "  ║                                                           ║"
echo "  ║          🚀 Facebook Ad Builder Setup Wizard 🚀           ║"
echo "  ║                                                           ║"
echo "  ╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "  This wizard will help you set up the Facebook Ad Builder."
echo "  It will check prerequisites, configure environment variables,"
echo "  and initialize the database."
echo ""
echo -e "  Press ${BOLD}Enter${NC} to continue or ${BOLD}Ctrl+C${NC} to exit."
read

#
# STEP 1: Check Prerequisites
#
print_header "Step 1: Checking Prerequisites"

MISSING_DEPS=()

# Check Node.js
print_step "Checking Node.js..."
if check_command node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION"
else
    print_error "Node.js not found"
    MISSING_DEPS+=("Node.js 18+ (https://nodejs.org)")
fi

# Check npm
print_step "Checking npm..."
if check_command npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION"
else
    print_error "npm not found"
    MISSING_DEPS+=("npm (comes with Node.js)")
fi

# Check Python
print_step "Checking Python..."
if check_command python3; then
    PYTHON_VERSION=$(python3 --version)
    print_success "$PYTHON_VERSION"
elif check_command python; then
    PYTHON_VERSION=$(python --version)
    print_success "$PYTHON_VERSION"
else
    print_error "Python not found"
    MISSING_DEPS+=("Python 3.11+ (https://python.org)")
fi

# Check PostgreSQL
print_step "Checking PostgreSQL..."
if check_command psql; then
    PSQL_VERSION=$(psql --version | head -1)
    print_success "$PSQL_VERSION"
else
    print_warning "PostgreSQL client not found (optional for local dev)"
    print_info "You can use a cloud database like Railway or Supabase instead"
fi

# Check agent-browser (optional)
print_step "Checking agent-browser (for testing)..."
if check_command agent-browser; then
    AB_VERSION=$(agent-browser --version 2>/dev/null || echo "installed")
    print_success "agent-browser $AB_VERSION"
else
    print_warning "agent-browser not found (optional, for e2e testing)"
    print_info "Install with: npm install -g agent-browser && agent-browser install"
fi

# Report missing dependencies
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo ""
    print_error "Missing required dependencies:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "    • $dep"
    done
    echo ""
    print_info "Please install the missing dependencies and run this script again."
    exit 1
fi

echo ""
print_success "All required prerequisites are installed!"

#
# STEP 2: Environment Configuration
#
print_header "Step 2: Environment Configuration"

ENV_FILE=".env.local"

if [ -f "$ENV_FILE" ]; then
    print_warning "Found existing $ENV_FILE"
    if confirm "Do you want to reconfigure it?"; then
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%s)"
        print_info "Backed up existing config"
    else
        print_info "Keeping existing configuration"
        SKIP_ENV=true
    fi
fi

if [ "$SKIP_ENV" != "true" ]; then
    echo ""
    echo -e "${BOLD}Database Configuration${NC}"
    echo "You'll need a PostgreSQL database. Options:"
    echo "  1. Local PostgreSQL"
    echo "  2. Railway (https://railway.app)"
    echo "  3. Supabase (https://supabase.com)"
    echo "  4. Other cloud provider"
    echo ""

    prompt "Enter your DATABASE_URL" "postgresql://user:password@localhost:5432/facebook_ad_builder" DATABASE_URL

    echo ""
    echo -e "${BOLD}Authentication${NC}"
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)
    print_info "Generated random SECRET_KEY"

    echo ""
    echo -e "${BOLD}AI Services${NC}"
    echo "Get your Gemini API key from: https://aistudio.google.com/app/apikey"
    prompt "Enter your GEMINI_API_KEY (required for AI features)" "" GEMINI_API_KEY

    echo ""
    if confirm "Do you have a Fal.ai API key? (optional, for image generation)" "n"; then
        prompt "Enter your FAL_AI_API_KEY" "" FAL_AI_API_KEY
    else
        FAL_AI_API_KEY=""
    fi

    echo ""
    echo -e "${BOLD}Facebook Marketing API${NC}"
    echo "Get your access token from: https://developers.facebook.com"
    if confirm "Do you have Facebook API credentials?" "n"; then
        prompt "Enter your FACEBOOK_ACCESS_TOKEN" "" FACEBOOK_ACCESS_TOKEN
        prompt "Enter your FACEBOOK_AD_ACCOUNT_ID (format: act_123456789)" "" FACEBOOK_AD_ACCOUNT_ID
        prompt "Enter your FACEBOOK_APP_ID" "" FACEBOOK_APP_ID
        prompt_secret "Enter your FACEBOOK_APP_SECRET" FACEBOOK_APP_SECRET
    else
        FACEBOOK_ACCESS_TOKEN=""
        FACEBOOK_AD_ACCOUNT_ID=""
        FACEBOOK_APP_ID=""
        FACEBOOK_APP_SECRET=""
        print_info "You can add Facebook credentials later in $ENV_FILE"
    fi

    echo ""
    echo -e "${BOLD}Cloudflare R2 Storage${NC}"
    echo "R2 is used for storing uploaded images and videos."
    if confirm "Do you have Cloudflare R2 credentials?" "n"; then
        prompt "Enter your R2_ACCOUNT_ID" "" R2_ACCOUNT_ID
        prompt "Enter your R2_ACCESS_KEY_ID" "" R2_ACCESS_KEY_ID
        prompt_secret "Enter your R2_SECRET_ACCESS_KEY" R2_SECRET_ACCESS_KEY
        prompt "Enter your R2_BUCKET_NAME" "" R2_BUCKET_NAME
        prompt "Enter your R2_PUBLIC_URL" "https://pub-xxx.r2.dev" R2_PUBLIC_URL
    else
        R2_ACCOUNT_ID=""
        R2_ACCESS_KEY_ID=""
        R2_SECRET_ACCESS_KEY=""
        R2_BUCKET_NAME=""
        R2_PUBLIC_URL=""
        print_info "Files will be stored locally in backend/uploads/"
    fi

    echo ""
    echo -e "${BOLD}Admin Account${NC}"
    prompt "Enter admin email for initial account" "admin@example.com" ADMIN_EMAIL
    prompt_secret "Enter admin password" ADMIN_PASSWORD

    # Write .env.local file
    print_step "Writing $ENV_FILE..."

    cat > "$ENV_FILE" << EOF
# Database (PostgreSQL required)
DATABASE_URL=$DATABASE_URL

# Auth
SECRET_KEY=$SECRET_KEY

# AI Services
GEMINI_API_KEY=$GEMINI_API_KEY
FAL_AI_API_KEY=$FAL_AI_API_KEY
KIE_AI_API_KEY=

# Cloudflare R2 Storage
R2_ACCOUNT_ID=$R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=$R2_BUCKET_NAME
R2_PUBLIC_URL=$R2_PUBLIC_URL

# Facebook Marketing API
FACEBOOK_ACCESS_TOKEN=$FACEBOOK_ACCESS_TOKEN
FACEBOOK_AD_ACCOUNT_ID=$FACEBOOK_AD_ACCOUNT_ID
FACEBOOK_APP_ID=$FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=$FACEBOOK_APP_SECRET

# Frontend env vars (VITE_ prefix for Vite)
VITE_API_URL=http://localhost:8000/api/v1
VITE_FACEBOOK_ACCESS_TOKEN=$FACEBOOK_ACCESS_TOKEN
VITE_FACEBOOK_AD_ACCOUNT_ID=$FACEBOOK_AD_ACCOUNT_ID
VITE_FACEBOOK_API_VERSION=v24.0

# Admin user (for init_db.py)
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# CORS (add your production URLs here)
ALLOWED_ORIGINS=

# Testing (optional)
TEST_EMAIL=
TEST_PASSWORD=
BASE_URL=http://localhost:5173
EOF

    print_success "Created $ENV_FILE"
fi

#
# STEP 3: Install Dependencies
#
print_header "Step 3: Installing Dependencies"

# Backend
print_step "Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Created virtual environment"
else
    print_info "Virtual environment already exists"
fi

print_step "Installing Python dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt
print_success "Installed Python dependencies"

cd ..

# Frontend
print_step "Installing Node.js dependencies..."
cd frontend
npm install --silent
print_success "Installed Node.js dependencies"
cd ..

#
# STEP 4: Initialize Database
#
print_header "Step 4: Database Initialization"

if confirm "Do you want to initialize the database now?" "y"; then
    print_step "Initializing database..."
    cd backend
    source venv/bin/activate

    # Source the env file
    set -a
    source ../.env.local
    set +a

    if python init_db.py; then
        print_success "Database initialized successfully!"
    else
        print_error "Database initialization failed"
        print_info "Check your DATABASE_URL and try again"
        print_info "You can run manually: cd backend && python init_db.py"
    fi
    cd ..
else
    print_info "Skipping database initialization"
    print_info "Run later: cd backend && source venv/bin/activate && python init_db.py"
fi

#
# STEP 5: Summary
#
print_header "Setup Complete! 🎉"

echo -e "${BOLD}To start the application:${NC}"
echo ""
echo "  ${CYAN}Terminal 1 (Backend):${NC}"
echo "    cd backend"
echo "    source venv/bin/activate"
echo "    uvicorn app.main:app --reload --port 8000"
echo ""
echo "  ${CYAN}Terminal 2 (Frontend):${NC}"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo -e "${BOLD}Then open:${NC}"
echo "    Frontend:  http://localhost:5173"
echo "    API Docs:  http://localhost:8000/api/v1/docs"
echo ""
echo -e "${BOLD}Login with:${NC}"
echo "    Email:    $ADMIN_EMAIL"
echo "    Password: (the password you set)"
echo ""
echo -e "${BOLD}Next steps:${NC}"
echo "    1. Create your first Brand"
echo "    2. Add Products to your Brand"
echo "    3. Research competitor ads"
echo "    4. Generate AI-powered ads"
echo ""
echo -e "${BOLD}Ready to deploy?${NC}"
echo "    See RAILWAY_DEPLOYMENT.md for production deployment instructions"
echo ""
echo -e "${CYAN}Need help? Check the README.md or open an issue on GitHub.${NC}"
echo ""
