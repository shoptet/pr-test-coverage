# PHP Test Files

This directory contains sample PHP files used to test the PR Test Coverage action.

## Structure

```
php-files/
├── src/
│   ├── index.php              # Main application file
│   └── services/
│       └── service1.php       # Service class used by index.php
├── tests/
│   └── ApplicationTest.php    # PHPUnit tests (partial coverage ~50%)
├── coverage/
│   └── clover.xml            # Pre-generated Clover XML coverage report
├── composer.json              # PHP dependencies (PHPUnit)
├── phpunit.xml               # PHPUnit configuration
└── .gitignore                # Ignores vendor/, coverage/ (except clover.xml)

## Purpose

This setup demonstrates the PR Test Coverage action by:

1. **PHP Source Files**: Simple application with a service class
2. **Test Coverage**: Tests that cover ~50% of the code (intentionally partial)
3. **Clover XML Report**: Coverage data in Clover format for the action to parse

## Coverage Report

The `coverage/clover.xml` file contains coverage data showing:
- **index.php**: ~50% coverage (6/12 statements covered)
- **service1.php**: ~33% coverage (5/15 statements covered)
- **Overall**: ~40% coverage (11/27 statements covered)

## Workflow Integration

The `.github/workflows/pr-check.yml` workflow:
1. Checks out the code
2. Verifies the clover.xml file exists
3. Runs the PR Test Coverage action
4. Validates that the action produces the expected output

This ensures the action correctly parses Clover XML files and generates PR comments.
