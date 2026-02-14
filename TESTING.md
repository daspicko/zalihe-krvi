# Testing & Quality Gates

This project uses automated testing and linting to maintain code quality.

## Available Commands

### Root Level
```bash
# Run ESLint on all files
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Run all tests (scraper + notifier)
npm test

# Run complete quality check (lint + tests)
npm run quality

# Or use the shell script
./quality.sh
```

### Scraper
```bash
cd scraper
npm test
```

### Notifier
```bash
cd notifier
npm test
```

## Test Structure

### Scraper Tests (`scraper/tests/`)
- **dateUtils.test.js**: Tests date formatting utilities
- **fetchUtils.test.js**: Tests HTML parsing and data extraction logic
- **locations.test.js**: Validates location data structure and integrity

### Notifier Tests (`notifier/tests/`)
- **notifier.test.js**: Tests notification triggering logic and data processing

## Running Tests

Tests use Node.js built-in test runner (Node 18+). No additional test framework installation needed.

```bash
# Run all quality checks before committing
npm run quality
```

## CI/CD

GitHub Actions automatically runs quality checks on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The workflow tests against Node.js versions 18.x and 20.x.

## ESLint Configuration

ESLint is configured to check:
- JavaScript files (ES6+ modules)
- JSON files
- Markdown files
- CSS files

Configuration: `eslint.config.js`

## Pre-commit Recommendations

Before committing code:
1. Run `npm run lint:fix` to auto-fix style issues
2. Run `npm test` to ensure all tests pass
3. Or simply run `./quality.sh` for complete check
