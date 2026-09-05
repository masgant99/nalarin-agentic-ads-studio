#!/bin/bash
# Smoke test: Authentication flow
set -e

BASE_URL="${BASE_URL:-http://localhost:5173}"
TEST_EMAIL="${TEST_EMAIL:?Set TEST_EMAIL env var}"
TEST_PASSWORD="${TEST_PASSWORD:?Set TEST_PASSWORD env var}"

echo "Testing: Authentication flow"
agent-browser open "$BASE_URL/login"
sleep 2

# Get snapshot to find element refs
SNAPSHOT=$(agent-browser snapshot)
echo "$SNAPSHOT" | head -30

# Fill email
agent-browser fill 'input[type="email"]' "$TEST_EMAIL"
sleep 0.5

# Fill password
agent-browser fill 'input[type="password"]' "$TEST_PASSWORD"
sleep 0.5

# Click submit
agent-browser click 'button[type="submit"]'
sleep 3

# Check we're no longer on login page
CURRENT_URL=$(agent-browser get url)
if echo "$CURRENT_URL" | grep -q "/login"; then
  echo "✗ Still on login page - auth failed"
  agent-browser screenshot /tmp/auth-fail.png
  agent-browser close
  exit 1
fi

echo "✓ Successfully authenticated"
echo "Current URL: $CURRENT_URL"

agent-browser screenshot /tmp/auth-success.png
agent-browser close
echo "✓ Auth smoke test passed"
