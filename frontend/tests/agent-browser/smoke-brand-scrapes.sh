#!/bin/bash
# Smoke test: Brand scrapes page after login
set -e

BASE_URL="${BASE_URL:-http://localhost:5173}"
TEST_EMAIL="${TEST_EMAIL:?Set TEST_EMAIL env var}"
TEST_PASSWORD="${TEST_PASSWORD:?Set TEST_PASSWORD env var}"

echo "Testing: Brand scrapes page"

# Login first
agent-browser open "$BASE_URL/login"
sleep 2
agent-browser fill 'input[type="email"]' "$TEST_EMAIL"
agent-browser fill 'input[type="password"]' "$TEST_PASSWORD"
agent-browser click 'button[type="submit"]'
sleep 3

# Navigate to brand scrapes
agent-browser open "$BASE_URL/research/brand-scrapes"
sleep 2

# Verify page loaded
SNAPSHOT=$(agent-browser snapshot)

if echo "$SNAPSHOT" | grep -qi "scrape\|brand"; then
  echo "✓ Brand scrapes page loaded"
else
  echo "✗ Brand scrapes page not found"
  agent-browser screenshot /tmp/brand-scrapes-fail.png
  agent-browser close
  exit 1
fi

# Check for form inputs
if echo "$SNAPSHOT" | grep -q "input"; then
  echo "✓ Form inputs found"
else
  echo "✗ Form inputs not found"
  agent-browser close
  exit 1
fi

agent-browser screenshot /tmp/brand-scrapes-success.png
agent-browser close
echo "✓ Brand scrapes smoke test passed"
