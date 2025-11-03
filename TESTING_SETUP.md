# Testing Setup Instructions

## Overview

Test infrastructure has been added to validate scanner accuracy and WCAG level calculation. The tests ensure that the accessibility scanner correctly identifies violations and calculates compliance levels.

## Installation

To install test dependencies, run:

```bash
npm install --save-dev jest @types/jest ts-jest jest-environment-jsdom @testing-library/jest-dom
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### Current Tests

1. **WCAG Level Calculation** (`__tests__/scanner.test.ts`)
   - Tests WCAG 2.1 Level A violations → should return 'fail'
   - Tests WCAG 2.1 Level AA violations → should return 'A'
   - Tests WCAG 2.1 Level AAA violations → should return 'AA'
   - Tests no violations → should return 'AAA'
   - Tests multiple violation levels
   - Tests violations without WCAG tags (fallback logic)
   - Tests WCAG 2.0, 2.1, and 2.2 tag support

2. **Violation Impact Mapping**
   - Validates that axe-core impact levels are correctly mapped

3. **Compliance Score Calculation**
   - Tests score calculation with violations and passes
   - Tests edge cases (no violations, only violations)

## Future Test Expansion

Consider adding:
- Integration tests with actual Puppeteer scans
- Tests for fix generation accuracy
- Tests for color contrast calculation
- Performance tests for scanner speed

## Notes

- The `calculateWCAGLevel` function is exported for testing purposes
- Tests use mocks for Puppeteer and axe-core to avoid requiring actual browser instances
- For integration testing, you may want to use Playwright or a similar framework

