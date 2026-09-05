#!/bin/bash
# Smoke test: Login page loads correctly
set -e

BASE_URL="${BASE_URL:-http://localhost:5173}"

echo "Testing: Login page loads"
agent-browser open "$BASE_URL/login"
sleep 2

# Get snapshot and verify elements exist
SNAPSHOT=$(agent-browser snapshot)

if echo "$SNAPSHOT" | grep -q "email"; then
  echo "✓ Email input found"
else
  echo "✗ Email input not found"
  agent-browser screenshot /tmp/login-fail.png
  agent-browser close
  exit 1
fi

if echo "$SNAPSHOT" | grep -q "password"; then
  echo "✓ Password input found"
else
  echo "✗ Password input not found"
  agent-browser close
  exit 1
fi

if echo "$SNAPSHOT" | grep -q -i "sign in\|log in\|submit"; then
  echo "✓ Submit button found"
else
  echo "✗ Submit button not found"
  agent-browser close
  exit 1
fi

echo "✓ Login page smoke test passed"
agent-browser close
