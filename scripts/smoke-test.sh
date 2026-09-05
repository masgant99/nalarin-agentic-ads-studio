#!/bin/bash
# Quick smoke test for local dev - runs subset of critical tests

echo "=== Smoke Test ==="

# Backend - just auth and brands
cd backend
source venv/bin/activate 2>/dev/null || true
pytest tests/unit/test_auth.py tests/unit/test_brands.py -v --tb=short
cd ..

# Frontend - just login and basic nav
cd frontend
npx playwright test tests/login.spec.js tests/example.spec.js --reporter=list
cd ..

echo "=== Smoke Test Complete ==="
