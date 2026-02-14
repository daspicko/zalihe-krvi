#!/bin/bash

# Quality Gate Script
# Runs linting and tests to ensure code quality

set -e  # Exit on any error

echo "=========================================="
echo "Running Quality Checks"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Run ESLint
echo -e "${YELLOW}[1/3] Running ESLint...${NC}"
if npm run lint; then
    echo -e "${GREEN}✓ ESLint passed${NC}"
else
    echo -e "${RED}✗ ESLint failed${NC}"
    FAILED=1
fi
echo ""

# Run scraper tests
echo -e "${YELLOW}[2/3] Running scraper tests...${NC}"
if (cd scraper && npm test); then
    echo -e "${GREEN}✓ Scraper tests passed${NC}"
else
    echo -e "${RED}✗ Scraper tests failed${NC}"
    FAILED=1
fi
echo ""

# Run notifier tests
echo -e "${YELLOW}[3/3] Running notifier tests...${NC}"
if (cd notifier && npm test); then
    echo -e "${GREEN}✓ Notifier tests passed${NC}"
else
    echo -e "${RED}✗ Notifier tests failed${NC}"
    FAILED=1
fi
echo ""

echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All quality checks passed!${NC}"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}Quality checks failed!${NC}"
    echo "=========================================="
    exit 1
fi
