#!/bin/bash
set -e

echo "=== Running Full Test Suite ==="
echo ""

# Backend tests
echo ">>> Backend Tests"
cd backend
source venv/bin/activate 2>/dev/null || true
pytest tests/ -v --tb=short
cd ..

echo ""

# Frontend tests
echo ">>> Frontend E2E Tests"
cd frontend
npx playwright test --reporter=list
cd ..

echo ""
echo "=== All Tests Passed ==="
